const crypto = require('crypto');
const UserModel = require('./user.model');
const UserSessionModel = require('./user.session.model');
const { parseUserAgent, getLocationFromIp } = require('../../utils/sessionHelper');
const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
} = require('../../middleware/auth.middleware');
const { ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../../utils/emailService');

const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const parseDurationToMs = (value, fallbackMs) => {
  if (!value || typeof value !== 'string') {
    return fallbackMs;
  }

  const match = value.trim().match(/^(\d+)(ms|s|m|h|d)$/i);
  if (!match) {
    return fallbackMs;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const unitToMs = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * unitToMs[unit];
};

const ACCESS_COOKIE_MAX_AGE_MS = parseDurationToMs(ACCESS_TOKEN_TTL, 15 * 60 * 1000);
const REFRESH_COOKIE_MAX_AGE_MS = parseDurationToMs(REFRESH_TOKEN_TTL, 30 * 24 * 60 * 60 * 1000);

const buildCookieBaseOptions = () => {
  const sameSite = process.env.AUTH_COOKIE_SAME_SITE || 'strict';
  const secure =
    process.env.AUTH_COOKIE_SECURE === 'true' ||
    (process.env.AUTH_COOKIE_SECURE !== 'false' &&
      process.env.NODE_ENV === 'production');

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  };
};

const buildAccessCookieOptions = () => ({
  ...buildCookieBaseOptions(),
  maxAge: ACCESS_COOKIE_MAX_AGE_MS,
});

const buildRefreshCookieOptions = () => ({
  ...buildCookieBaseOptions(),
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
});

const hashRefreshToken = (refreshToken) =>
  crypto.createHash('sha256').update(refreshToken).digest('hex');

const createAuthTokenPair = async (user, req = null) => {
  // Extract device/location info if request context is available
  let sessionId = null;
  let sessionInfo = null;

  if (req) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    const ua = req.headers['user-agent'] || '';
    const { browser, os, deviceType } = parseUserAgent(ua);
    const location = getLocationFromIp(ip);
    sessionInfo = { ip, ua, browser, os, deviceType, location };
  }

  // Generate tokens — sessionId embedded after session row is created
  const refreshToken = generateRefreshToken(
    { id: user.id, tokenVersion: crypto.randomUUID() },
    REFRESH_TOKEN_TTL,
  );
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshTokenExpiry = new Date(Date.now() + REFRESH_COOKIE_MAX_AGE_MS);

  // Persist legacy refresh-token hash on user row (backward compat)
  await UserModel.saveRefreshTokenByUserId(user.id, refreshTokenHash, refreshTokenExpiry);

  // Create session row if we have request context
  if (sessionInfo) {
    try {
      const session = await UserSessionModel.create({
        user_id: user.id,
        refresh_token_hash: refreshTokenHash,
        ip_address: sessionInfo.ip,
        user_agent: sessionInfo.ua,
        device_type: sessionInfo.deviceType,
        location: sessionInfo.location,
        expires_at: refreshTokenExpiry,
      });
      sessionId = session.id;
    } catch (err) {
      logger.warn('Failed to create user_sessions row', { error: err.message });
    }
  }

  const accessToken = generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      ...(sessionId ? { sessionId } : {}),
    },
    ACCESS_TOKEN_TTL,
  );

  return { accessToken, refreshToken };
};

const registerUser = async ({ full_name, email, password, role, department, cgpa, semester }, req = null) => {
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  if (role === 'student') {
    if (cgpa == null || semester == null) {
      throw new ApiError(400, 'CGPA and Semester are required for students.');
    }

    if (cgpa < 0 || cgpa > 10) {
      throw new ApiError(400, 'CGPA must be between 0 and 10.');
    }

    if (semester < 1 || semester > 8) {
      throw new ApiError(400, 'Semester must be between 1 and 8.');
    }
  }

  const user = await UserModel.create({
    full_name,
    email,
    password,
    role,
    department,
    cgpa: role === 'student' ? cgpa : null,
    semester: role === 'student' ? semester : null,
  });

  const tokens = await createAuthTokenPair(user, req);

  const userData = { ...user };
  delete userData.password_hash;

  return {
    user: userData,
    ...tokens,
  };
};

const loginUser = async ({ email, password }, req = null) => {
  const user = await UserModel.findByEmail(email, true);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.is_active === false) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if 2FA is enabled
  if (user.two_factor_enabled === true) {
    logger.info('2FA required for user login', { userId: user.id, email: user.email });
    return {
      requiresTwoFactor: true,
      tempUserId: user.id,
      message: '2FA verification required',
    };
  }

  const tokens = await createAuthTokenPair(user, req);

  delete user.password_hash;

  return {
    user,
    ...tokens,
  };
};

const getProfileById = async (userId) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const updateProfileById = async (userId, updates) => {
  return UserModel.update(userId, updates);
};

const changePasswordById = async (userId, { oldPassword, newPassword }) => {
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  await UserModel.changePassword(userId, oldPassword, newPassword);
};

const forgotPassword = async ({ email, resetBaseUrl }) => {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    logger.info('Forgot password request for non-existent email', { email });
    return {
      message: 'If this email is registered, you will receive a password reset link.',
    };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000);

  await UserModel.saveResetToken(email, resetTokenHash, expiryTime);

  const resetLink = `${resetBaseUrl}/reset-password?token=${resetToken}`;
  await sendPasswordResetEmail(email, resetToken, resetLink);

  logger.info('Password reset email sent', { email });
  return {
    message: 'If this email is registered, you will receive a password reset link.',
  };
};

const resetPassword = async ({ token, newPassword, confirmPassword }) => {
  if (!token) {
    throw new ApiError(400, 'Reset token is required');
  }

  if (!newPassword || !confirmPassword) {
    throw new ApiError(400, 'New password and confirmation are required');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(
      400,
      'Password must contain uppercase, lowercase, number, and special character'
    );
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await UserModel.findByResetToken(tokenHash);

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  await UserModel.resetPasswordWithToken(tokenHash, newPassword);
  await sendPasswordResetConfirmation(user.email, user.full_name);

  logger.info('Password reset successful', { userId: user.id, email: user.email });
  return {
    message: 'Password reset successful. You can now log in with your new password.',
  };
};

const handleSSOLogin = async ({ email, full_name, auth_provider, provider_id }) => {
  let user = await UserModel.findByEmail(email);

  if (!user) {
    // Dynamically provision user
    user = await UserModel.createSSO({
      full_name,
      email,
      role: 'student', // Default role for new SSO users
      auth_provider,
      provider_id,
    });
  } else {
    if (user.is_active === false) {
      throw new ApiError(403, 'Account is deactivated. Please contact support.');
    }
    // Note: We could optionally update the provider_id if it's missing, 
    // but relying on email matching is standard for Entra ID / Workspace if domains match.
  }

  const tokens = await createAuthTokenPair(user);

  return {
    user,
    ...tokens,
  };
};

const refreshAuthTokens = async ({ refreshToken }) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Unauthorized: No refresh token provided.');
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new ApiError(401, 'Unauthorized: Invalid refresh token.');
  }

  const user = await UserModel.findRefreshTokenStateByUserId(decodedRefreshToken.id);
  if (!user || user.is_active === false) {
    throw new ApiError(401, 'Unauthorized: Invalid refresh token.');
  }

  const incomingRefreshTokenHash = hashRefreshToken(refreshToken);
  const isRefreshStateValid =
    user.refresh_token_hash &&
    user.refresh_token_hash === incomingRefreshTokenHash &&
    user.refresh_token_expires_at &&
    new Date(user.refresh_token_expires_at).getTime() > Date.now();

  if (!isRefreshStateValid) {
    await UserModel.clearRefreshTokenByUserId(user.id);
    throw new ApiError(401, 'Unauthorized: Refresh token expired or rotated.');
  }

  return createAuthTokenPair(user);
};

const revokeRefreshTokenByUserId = async (userId) => {
  if (!userId) return;
  await UserModel.clearRefreshTokenByUserId(userId);
};

const revokeRefreshToken = async (refreshToken) => {
  if (!refreshToken) return;
  const refreshTokenHash = hashRefreshToken(refreshToken);
  await UserModel.clearRefreshTokenByHash(refreshTokenHash);
};

const getUserSessions = async (userId) => {
  return UserSessionModel.findActiveByUserId(userId);
};

const revokeSessionById = async (sessionId, userId) => {
  const session = await UserSessionModel.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }
  if (String(session.user_id) !== String(userId)) {
    throw new ApiError(403, 'You do not have permission to revoke this session');
  }
  await UserSessionModel.deleteById(sessionId);
};

/**
 * Verify 2FA code during login and return tokens if valid
 * @param {number} userId - User ID
 * @param {string} code - TOTP or backup code
 * @param {Object} req - Request context
 * @returns {Object} User and token pair if valid
 */
const verify2FACodeLogin = async (userId, code, req = null) => {
  if (!userId || !code) {
    throw new ApiError(400, '2FA code and user ID are required');
  }

  // Import twofa service
  const twoFAService = require('../../services/twofa.service');

  const { verified, method } = await twoFAService.verify2FACode(userId, code);

  if (!verified) {
    logger.warn('Invalid 2FA code attempted', { userId });
    throw new ApiError(401, 'Invalid 2FA code');
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.is_active === false) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  const tokens = await createAuthTokenPair(user, req);

  logger.info('2FA verification successful during login', {
    userId,
    method,
  });

  return {
    user,
    ...tokens,
  };
};

/**
 * Generate 2FA setup challenge (secret + QR code)
 * @param {number} userId - User ID
 * @returns {Object} Setup challenge with secret and QR code
 */
const generate2FASetupChallenge = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Import twofa service
  const twoFAService = require('../../services/twofa.service');

  const challenge = await twoFAService.generateSetupChallenge(userId, user.email);

  logger.info('2FA setup challenge generated', { userId });

  return challenge;
};

/**
 * Verify 2FA setup code and enable 2FA
 * @param {number} userId - User ID
 * @param {string} code - TOTP code to verify
 * @param {string} secret - The secret to verify against
 * @param {Array<string>} backupCodes - Backup codes to save
 * @returns {Object} Success message and backup codes
 */
const verify2FASetup = async (userId, code, secret, backupCodes) => {
  if (!code || !secret) {
    throw new ApiError(400, 'TOTP code and secret are required');
  }

  // Import twofa service
  const twoFAService = require('../../services/twofa.service');

  // Verify the code with the provided secret
  const isValid = twoFAService.verifyTOTPCode(code, secret);
  if (!isValid) {
    logger.warn('Invalid TOTP code during 2FA setup', { userId });
    throw new ApiError(401, 'Invalid TOTP code. Please check and try again.');
  }

  // Enable 2FA in database
  await twoFAService.enable2FA(userId, secret, backupCodes);

  logger.info('2FA enabled for user', { userId });

  return {
    message: '2FA successfully enabled',
    backupCodes, // Return backup codes so user can store them
  };
};

/**
 * Disable 2FA for user
 * @param {number} userId - User ID
 * @returns {Object} Success message
 */
const disable2FA = async (userId) => {
  // Import twofa service
  const twoFAService = require('../../services/twofa.service');

  await twoFAService.disable2FA(userId);

  logger.info('2FA disabled for user', { userId });

  return {
    message: '2FA successfully disabled',
  };
};

/**
 * Get 2FA status for user
 * @param {number} userId - User ID
 * @returns {Object} 2FA status
 */
const get2FAStatus = async (userId) => {
  const status = await UserModel.get2FAStatus(userId);
  if (!status) {
    throw new ApiError(404, 'User not found');
  }

  return {
    twoFactorEnabled: status.two_factor_enabled,
    enabledAt: status.two_factor_enabled_at,
    backupCodesCount: status.backup_codes_count || 0,
  };
};

module.exports = {
  registerUser,
  loginUser,
  getProfileById,
  updateProfileById,
  changePasswordById,
  forgotPassword,
  resetPassword,
  handleSSOLogin,
  refreshAuthTokens,
  verify2FACodeLogin,
  generate2FASetupChallenge,
  verify2FASetup,
  disable2FA,
  get2FAStatus,
  revokeRefreshTokenByUserId,
  revokeRefreshToken,
  getUserSessions,
  revokeSessionById,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  buildAccessCookieOptions,
  buildRefreshCookieOptions,
};
