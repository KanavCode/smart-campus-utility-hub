const { sendSuccess } = require('../../utils/response');

const userAuthService = require('./user.auth.service');
const userAdminService = require('./user.admin.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');

/**
 * User Controller
 * Handles all user-related HTTP requests
 */

/* Register a new user --> POST /api/auth/register */
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
  });

  logger.info('New user registered', { userId: result.user.id, email: result.user.email });

    sendSuccess(res, 201, 'User registered successfully', { 
      user: result.user, 
      token: result.token 
    });

});

/* Login user --> POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await userAuthService.loginUser({ email, password });

  logger.info('User logged in', { userId: result.user.id, email: result.user.email });

  sendSuccess(res, 200, 'Login successful', { 
    user: result.user, 
    token: result.token 
  });

});

/* Get current user profile --> GET /api/auth/profile -> Protected route*/
const getProfile = asyncHandler(async (req, res) => {
  const user = await userAuthService.getProfileById(req.user.id);

  sendSuccess(res, 200, 'Profile fetched successfully', { user });
});

/* Update user profile --> PUT /api/auth/profile -> Protected route */
const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, department, cgpa, semester } = req.body;

  const updatedUser = await userAuthService.updateProfileById(req.user.id, {
    full_name,
    department,
    cgpa,
    semester
  });

  logger.info('User profile updated', { userId: req.user.id });

  sendSuccess(res, 200, 'Profile updated successfully', { user: updatedUser });
});

/* Change password --> POST /api/auth/change-password -> Protected route */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await userAuthService.changePasswordById(req.user.id, { oldPassword, newPassword });

  logger.info('User changed password', { userId: req.user.id });

  sendSuccess(res, 200, 'Password changed successfully');
});

/* Get all users (admin only) --> GET /api/users -> Protected route - Admin only */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, department, is_active, page = 1, limit = 50 } = req.query;
  const result = await userAdminService.listUsers({ role, department, is_active, page, limit });

  sendSuccess(res, 200, 'Users fetched successfully', { 
    users: result.users, 
    pagination: result.pagination 
  });
});

/* Get user by ID (admin only) -->GET /api/users/:id -> Protected route - Admin only */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userAdminService.getUserById({ id });

  sendSuccess(res, 200, 'User fetched successfully', { user });
});

/* Update user (admin only) --> PUT /api/users/:id -> Protected route - Admin only */
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetId, updatedUser } = await userAdminService.updateUserByAdmin({
    id,
    updates: req.body
  });

  logger.info('User updated by admin', { adminId: req.user.id, targetUserId: targetId });

  sendSuccess(res, 200, 'User updated successfully', { user: updatedUser });
});

/*Deactivate user (admin only) --> PATCH /api/users/:id/deactivate -> Protected route - Admin only */
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetId = await userAdminService.deactivateUser({ id });

  logger.info('User deactivated', { adminId: req.user.id, targetUserId: targetId });

  sendSuccess(res, 200, 'User deactivated successfully');
});

/* Delete user (admin only) --> DELETE /api/users/:id -> Protected route - Admin only*/
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetId = await userAdminService.deleteUser({ id, requesterId: req.user.id });

  logger.info('User deleted', { adminId: req.user.id, targetUserId: targetId });

  sendSuccess(res, 200, 'User deleted successfully');
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
    return res.redirect('http://localhost:5173/auth?error=NoCodeProvided');
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
      return res.redirect('http://localhost:5173/auth?error=ProfileFetchFailed');
    }

    const result = await userAuthService.handleSSOLogin({
      email: userInfo.email,
      full_name: userInfo.name || 'SSO User',
      auth_provider: provider,
      provider_id: userInfo.sub,
    });

    logger.info('User logged in via SSO', { userId: result.user.id, email: result.user.email, provider });

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/auth?token=${result.token}`);
  } catch (error) {
    logger.error('SSO Callback Error', error);
    res.redirect('http://localhost:5173/auth?error=SSOFailed');
  }
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deactivateUser,
  deleteUser,
  ssoRedirect,
  ssoCallback
};
