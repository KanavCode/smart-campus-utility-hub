const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { logger } = require('../config/db');
const { ApiError } = require('../middleware/errorHandler');
const UserModel = require('../components/users/user.model');

/**
 * Two-Factor Authentication (TOTP) Service
 * Handles TOTP secret generation, QR code generation, and verification
 */

/**
 * Generate a new TOTP secret for a user
 * @param {string} userEmail - User's email for secret identification
 * @returns {Object} Secret details with base32 and otpauth_url
 */
const generateTOTPSecret = (userEmail) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `Smart Campus Hub (${userEmail})`,
      issuer: 'Smart Campus Hub',
      length: 32, // Standard 32-character base32 secret
    });

    logger.debug('TOTP secret generated', { email: userEmail });

    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url,
    };
  } catch (error) {
    logger.error('Error generating TOTP secret', { error: error.message });
    throw new ApiError(500, 'Failed to generate 2FA secret');
  }
};

/**
 * Generate QR code as data URL for the given TOTP secret
 * @param {string} otpauth_url - The otpauth URL (usually from secret generation)
 * @returns {Promise<string>} QR code as PNG data URL
 */
const generateQRCodeDataURL = async (otpauth_url) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth_url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
    });
    logger.debug('QR code generated successfully');
    return qrCodeDataUrl;
  } catch (error) {
    logger.error('Error generating QR code', { error: error.message });
    throw new ApiError(500, 'Failed to generate QR code');
  }
};

/**
 * Verify a TOTP code against a secret
 * @param {string} totpCode - The TOTP code to verify (usually 6 digits)
 * @param {string} secret - The base32 secret
 * @returns {boolean} True if code is valid, false otherwise
 */
const verifyTOTPCode = (totpCode, secret) => {
  try {
    // Allow for time skew: check current and neighboring time windows
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: totpCode,
      window: 2, // Allow 2 time windows (±60 seconds) for clock skew tolerance
    });

    if (verified) {
      logger.debug('TOTP code verified successfully');
    } else {
      logger.debug('Invalid TOTP code provided');
    }

    return verified;
  } catch (error) {
    logger.error('Error verifying TOTP code', { error: error.message });
    return false;
  }
};

/**
 * Generate backup codes for account recovery
 * These are one-time codes that can be used if user loses access to their authenticator
 * @returns {Array<string>} Array of 10 backup codes (8 characters each)
 */
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate random 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  logger.debug('Backup codes generated', { count: codes.length });
  return codes;
};

/**
 * Verify and consume a backup code
 * @param {Array<string>} backupCodes - Array of remaining backup codes
 * @param {string} codeToCheck - The backup code to verify
 * @returns {Object} { isValid: boolean, remainingCodes: Array<string> }
 */
const verifyBackupCode = (backupCodes, codeToCheck) => {
  if (!Array.isArray(backupCodes) || backupCodes.length === 0) {
    return { isValid: false, remainingCodes: backupCodes };
  }

  const codeIndex = backupCodes.indexOf(codeToCheck);
  if (codeIndex === -1) {
    logger.debug('Backup code not found in user codes');
    return { isValid: false, remainingCodes: backupCodes };
  }

  // Remove the used code from the array
  const remainingCodes = backupCodes.filter((_, index) => index !== codeIndex);
  logger.debug('Backup code verified and removed', { codesRemaining: remainingCodes.length });

  return { isValid: true, remainingCodes };
};

/**
 * Generate setup challenge for 2FA enablement
 * Creates temporary secret and QR code, but does not save to database yet
 * User must verify the code before it's permanently enabled
 * @param {number} userId - User ID
 * @param {string} userEmail - User email
 * @returns {Object} Challenge data with secret and QR code
 */
const generateSetupChallenge = async (userId, userEmail) => {
  try {
    // Generate secret
    const secretData = generateTOTPSecret(userEmail);

    // Generate QR code
    const qrCodeDataUrl = await generateQRCodeDataURL(secretData.otpauth_url);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    logger.info('2FA setup challenge generated', { userId });

    return {
      secret: secretData.secret,
      qrCode: qrCodeDataUrl,
      backupCodes: backupCodes,
    };
  } catch (error) {
    logger.error('Error generating 2FA setup challenge', { userId, error: error.message });
    throw error;
  }
};

/**
 * Enable 2FA for user after verification
 * Stores the secret and backup codes in the database
 * @param {number} userId - User ID
 * @param {string} secret - The TOTP secret
 * @param {Array<string>} backupCodes - Backup codes for recovery
 * @returns {Promise<boolean>} Success status
 */
const enable2FA = async (userId, secret, backupCodes) => {
  try {
    await UserModel.enable2FA(userId, secret, backupCodes);
    logger.info('2FA enabled for user', { userId });
    return true;
  } catch (error) {
    logger.error('Error enabling 2FA', { userId, error: error.message });
    throw new ApiError(500, 'Failed to enable 2FA');
  }
};

/**
 * Disable 2FA for user
 * Clears the secret and backup codes from database
 * @param {number} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
const disable2FA = async (userId) => {
  try {
    await UserModel.disable2FA(userId);
    logger.info('2FA disabled for user', { userId });
    return true;
  } catch (error) {
    logger.error('Error disabling 2FA', { userId, error: error.message });
    throw new ApiError(500, 'Failed to disable 2FA');
  }
};

/**
 * Verify 2FA code during login
 * Accepts either TOTP code or backup code
 * @param {string} userId - User ID
 * @param {string} code - TOTP or backup code
 * @returns {Object} { verified: boolean, method: 'totp'|'backup'|null }
 */
const verify2FACode = async (userId, code) => {
  try {
    const user = await UserModel.findById(userId);

    if (!user || !user.two_factor_enabled) {
      return { verified: false, method: null };
    }

    // Try TOTP verification first
    if (verifyTOTPCode(code, user.two_factor_secret)) {
      logger.info('User verified with TOTP code', { userId });
      return { verified: true, method: 'totp' };
    }

    // Try backup code verification
    if (user.two_factor_backup_codes && user.two_factor_backup_codes.length > 0) {
      const { isValid, remainingCodes } = verifyBackupCode(user.two_factor_backup_codes, code);

      if (isValid) {
        // Update remaining backup codes in database
        await UserModel.update2FABackupCodes(userId, remainingCodes);
        logger.info('User verified with backup code', { userId, codesRemaining: remainingCodes.length });
        return { verified: true, method: 'backup' };
      }
    }

    logger.warn('Invalid 2FA code provided', { userId });
    return { verified: false, method: null };
  } catch (error) {
    logger.error('Error verifying 2FA code', { userId, error: error.message });
    return { verified: false, method: null };
  }
};

module.exports = {
  generateTOTPSecret,
  generateQRCodeDataURL,
  verifyTOTPCode,
  generateBackupCodes,
  verifyBackupCode,
  generateSetupChallenge,
  enable2FA,
  disable2FA,
  verify2FACode,
};
