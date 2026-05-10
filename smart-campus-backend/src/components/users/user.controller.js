const { sendSuccess } = require('../../utils/response');
const userAuthService = require('./user.auth.service');
const userAdminService = require('./user.admin.service');
const { asyncHandler } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');

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
  });

  logger.info('New user registered', { userId: result.user.id, email: result.user.email });

  sendSuccess(res, 201, 'User registered successfully', {
    user: result.user,
    token: result.token,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await userAuthService.loginUser({ email, password });

  logger.info('User logged in', { userId: result.user.id, email: result.user.email });

  sendSuccess(res, 200, 'Login successful', {
    user: result.user,
    token: result.token,
  });
});

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
  forgotPassword,
  resetPassword,
};
