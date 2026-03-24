const UserModel = require('./user.model');
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

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        token: result.token
      }
    });

});

/* Login user --> POST /api/auth/login */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await userAuthService.loginUser({ email, password });

  logger.info('User logged in', { userId: result.user.id, email: result.user.email });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: result.user,
      token: result.token
    }
  });
});

/* Get current user profile --> GET /api/auth/profile -> Protected route*/
const getProfile = asyncHandler(async (req, res) => {
  const user = await userAuthService.getProfileById(req.user.id);

  res.json({
    success: true,
    data: { user }
  });
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

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});

/* Change password --> POST /api/auth/change-password -> Protected route */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  await userAuthService.changePasswordById(req.user.id, { oldPassword, newPassword });

  logger.info('User changed password', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/* Get all users (admin only) --> GET /api/users -> Protected route - Admin only */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, department, page = 1, limit = 50 } = req.query;
  const result = await userAdminService.listUsers({ role, department, page, limit });

  res.json({
    success: true,
    data: {
      users: result.users,
      pagination: result.pagination
    }
  });
});

/* Get user by ID (admin only) -->GET /api/users/:id -> Protected route - Admin only */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await userAdminService.getUserById({ id });

  res.json({
    success: true,
    data: { user }
  });
});

/* Update user (admin only) --> PUT /api/users/:id -> Protected route - Admin only */
const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetId, updatedUser } = await userAdminService.updateUserByAdmin({
    id,
    updates: req.body
  });

  logger.info('User updated by admin', { adminId: req.user.id, targetUserId: targetId });

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user: updatedUser }
  });
});

/*Deactivate user (admin only) --> PATCH /api/users/:id/deactivate -> Protected route - Admin only */
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetId = await userAdminService.deactivateUser({ id });

  logger.info('User deactivated', { adminId: req.user.id, targetUserId: targetId });

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

/* Delete user (admin only) --> DELETE /api/users/:id -> Protected route - Admin only*/
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetId = await userAdminService.deleteUser({ id, requesterId: req.user.id });

  logger.info('User deleted', { adminId: req.user.id, targetUserId: targetId });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
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
  deleteUser
};
