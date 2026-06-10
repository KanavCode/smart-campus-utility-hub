const { sendSuccess } = require('../../utils/response');
const userAuthService = require('./user.auth.service');
const userAdminService = require('./user.admin.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');
const activityService = require('../../services/activity.service');

const getFrontendUrlWithDefault = () => process.env.FRONTEND_URL || 'http://localhost:5173';

const getCookieValueFromHeader = (cookieHeader, cookieName) => {
  if (!cookieHeader || typeof cookieHeader !== 'string') return null;
  const cookies = cookieHeader.split(';');
  for (const cookieEntry of cookies) {
    const [rawName, ...rawValueParts] = cookieEntry.trim().split('=');
    if (rawName === cookieName) {
      return decodeURIComponent(rawValueParts.join('='));
    }
  }
  return null;
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(
    userAuthService.ACCESS_COOKIE_NAME,
    accessToken,
    userAuthService.buildAccessCookieOptions(),
  );
  res.cookie(
    userAuthService.REFRESH_COOKIE_NAME,
    refreshToken,
    userAuthService.buildRefreshCookieOptions(),
  );
};

const clearAuthCookies = (res) => {
  const { maxAge: _accessMaxAge, ...accessClearOptions } = userAuthService.buildAccessCookieOptions();
  const { maxAge: _refreshMaxAge, ...refreshClearOptions } = userAuthService.buildRefreshCookieOptions();
  res.clearCookie(userAuthService.ACCESS_COOKIE_NAME, accessClearOptions);
  res.clearCookie(userAuthService.REFRESH_COOKIE_NAME, refreshClearOptions);
};

/**
 * User Controller
 * Handles all user-related HTTP requests
 */

const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, role, department, cgpa, semester } = req.body;

  const result = await userAuthService.registerUser({
    full_name,
    email,
    password,
    role,
    department,
    cgpa,
    semester,
  }, req);

  logger.info('New user registered', { userId: result.user.id, email: result.user.email });

  setAuthCookies(res, result.accessToken, result.refreshToken);

  sendSuccess(res, 201, 'User registered successfully', {
    user: result.user,
  });

});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await userAuthService.loginUser({ email, password }, req);

  logger.info('User logged in', { userId: result.user.id, email: result.user.email });

  setAuthCookies(res, result.accessToken, result.refreshToken);

  sendSuccess(res, 200, 'Login successful', {
    user: result.user,
  });
});

/* Logout user --> POST /api/auth/logout */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = getCookieValueFromHeader(
    req.headers.cookie,
    userAuthService.REFRESH_COOKIE_NAME,
  );
  if (req.user?.id) {
    await userAuthService.revokeRefreshTokenByUserId(req.user.id);
  } else {
    await userAuthService.revokeRefreshToken(refreshToken);
  }
  clearAuthCookies(res);
  sendSuccess(res, 200, 'Logout successful');
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getCookieValueFromHeader(
    req.headers.cookie,
    userAuthService.REFRESH_COOKIE_NAME,
  );
  const result = await userAuthService.refreshAuthTokens({ refreshToken });
  setAuthCookies(res, result.accessToken, result.refreshToken);
  sendSuccess(res, 200, 'Token refreshed successfully');
});

/* Get current user profile --> GET /api/auth/profile -> Protected route*/
const getProfile = asyncHandler(async (req, res) => {
  const user = await userAuthService.getProfileById(req.user.id);

  sendSuccess(res, 200, 'Profile fetched successfully', { user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, department, cgpa, semester } = req.body;

  const updatedUser = await userAuthService.updateProfileById(req.user.id, {
    full_name,
    department,
    cgpa,
    semester,
  });

  logger.info('User profile updated', { userId: req.user.id });

  await activityService.logActivity({
    userId: req.user.id,
    action: 'PROFILE_UPDATED',
    entityType: 'user',
    entityId: req.user.id,
    description: 'Updated profile information',
    metadata: {
      fields: ['full_name', 'department', 'cgpa', 'semester'].filter((field) => {
        if (field === 'full_name') return full_name !== undefined;
        if (field === 'department') return department !== undefined;
        if (field === 'cgpa') return cgpa !== undefined;
        if (field === 'semester') return semester !== undefined;
        return false;
      }),
    },
  });

  sendSuccess(res, 200, 'Profile updated successfully', { user: updatedUser });
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await userAuthService.changePasswordById(req.user.id, { oldPassword, newPassword });

  logger.info('User changed password', { userId: req.user.id });

  sendSuccess(res, 200, 'Password changed successfully');
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, department, is_active, page = 1, limit = 50 } = req.query;
  const result = await userAdminService.listUsers({ role, department, is_active, page, limit });

  sendSuccess(res, 200, 'Users fetched successfully', {
    users: result.users,
    pagination: result.pagination,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userAdminService.getUserById({ id });

  sendSuccess(res, 200, 'User fetched successfully', { user });
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetId, updatedUser } = await userAdminService.updateUserByAdmin({
    id,
    updates: req.body,
  });

  logger.info('User updated by admin', { adminId: req.user.id, targetUserId: targetId });

  sendSuccess(res, 200, 'User updated successfully', { user: updatedUser });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetId = await userAdminService.deactivateUser({ id });

  logger.info('User deactivated', { adminId: req.user.id, targetUserId: targetId });

  sendSuccess(res, 200, 'User deactivated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetId = await userAdminService.deleteUser({ id, requesterId: req.user.id });

  logger.info('User deleted', { adminId: req.user.id, targetUserId: targetId });

  sendSuccess(res, 200, 'User deleted successfully');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const resetBaseUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;

  const result = await userAuthService.forgotPassword({
    email,
    resetBaseUrl,
  });

  logger.info('Forgot password request', { email });

  sendSuccess(res, 200, result.message);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  const result = await userAuthService.resetPassword({
    token,
    newPassword,
    confirmPassword,
  });

  logger.info('Password reset successful');

  sendSuccess(res, 200, result.message);
});

/* SSO Redirect */
const ssoRedirect = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  let authUrl = '';

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-client-id';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/sso/google/callback';
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile`;
  } else if (provider === 'microsoft') {
    const clientId = process.env.MS_CLIENT_ID || 'mock-client-id';
    const redirectUri = process.env.MS_REDIRECT_URI || 'http://localhost:5000/api/auth/sso/microsoft/callback';
    authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=User.Read`;
  } else {
    return res.status(400).json({ success: false, message: 'Invalid SSO provider' });
  }

  res.redirect(authUrl);
});

/* SSO Callback */
const ssoCallback = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { code } = req.query;

  if (!code) {
    return res.redirect(`${getFrontendUrlWithDefault()}/auth?error=NoCodeProvided`);
  }

  let userInfo = null;

  try {
    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID || 'mock-client-id';
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'mock-client-secret';
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/sso/google/callback';

      // If mock, simulate user
      if (clientId === 'mock-client-id') {
        userInfo = { email: 'mockuser@smartcampus.edu', name: 'Mock Google User', sub: 'google-123' };
      } else {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
          }),
        });
        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
          throw new Error('Failed to get access token');
        }

        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const profileData = await profileResponse.json();
        userInfo = { email: profileData.email, name: profileData.name, sub: profileData.sub };
      }
    } else if (provider === 'microsoft') {
      // Mock Microsoft logic
      userInfo = { email: 'mockmsuser@smartcampus.edu', name: 'Mock MS User', sub: 'ms-123' };
    }

    if (!userInfo || !userInfo.email) {
      return res.redirect(`${getFrontendUrlWithDefault()}/auth?error=ProfileFetchFailed`);
    }

    const result = await userAuthService.handleSSOLogin({
      email: userInfo.email,
      full_name: userInfo.name || 'SSO User',
      auth_provider: provider,
      provider_id: userInfo.sub,
    });

    logger.info('User logged in via SSO', { userId: result.user.id, email: result.user.email, provider });

    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Redirect to frontend after cookie is set
    res.redirect(`${getFrontendUrlWithDefault()}/auth?sso=success`);
  } catch (error) {
    logger.error('SSO Callback Error', error);
    res.redirect(`${getFrontendUrlWithDefault()}/auth?error=SSOFailed`);
  }
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await userAuthService.getUserSessions(req.user.id);
  sendSuccess(res, 200, 'Sessions fetched successfully', { sessions });
});

const revokeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await userAuthService.revokeSessionById(id, req.user.id);
  logger.info('Session revoked', { userId: req.user.id, sessionId: id });
  sendSuccess(res, 200, 'Session revoked successfully');
});

/**
 * Setup 2FA - Generate challenge (secret + QR code)
 * Protected endpoint
 */
const setup2FA = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const challenge = await userAuthService.generate2FASetupChallenge(userId);

  sendSuccess(res, 200, 'Challenge generated successfully', {
    secret: challenge.secret,
    qrCode: challenge.qrCode,
    backupCodes: challenge.backupCodes,
  });
});

/**
 * Verify 2FA setup - Verify code and enable 2FA
 * Protected endpoint
 */
const verify2FASetup = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { code, secret, backupCodes } = req.body;

  if (!code || !secret || !backupCodes) {
    return sendSuccess(res, 400, 'Code, secret, and backup codes are required');
  }

  const result = await userAuthService.verify2FASetup(userId, code, secret, backupCodes);

  sendSuccess(res, 200, result.message, {
    backupCodes: result.backupCodes,
  });
});

/**
 * Verify 2FA code during login
 * Public endpoint - used when 2FA is required
 */
const verify2FALogin = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return sendSuccess(res, 400, 'User ID and 2FA code are required');
  }

  const result = await userAuthService.verify2FACodeLogin(userId, code, req);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  sendSuccess(res, 200, '2FA verification successful', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

/**
 * Disable 2FA - Remove 2FA from account
 * Protected endpoint
 */
const disable2FA = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await userAuthService.disable2FA(userId);

  sendSuccess(res, 200, result.message);
});

/**
 * Get 2FA status - Check if 2FA is enabled
 * Protected endpoint
 */
const get2FAStatus = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const status = await userAuthService.get2FAStatus(userId);

  sendSuccess(res, 200, '2FA status retrieved', status);
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deactivateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  ssoRedirect,
  ssoCallback,
  getSessions,
  revokeSession,
  setup2FA,
  verify2FASetup,
  verify2FALogin,
  disable2FA,
  get2FAStatus,
};
