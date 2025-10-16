const UserModel = require('./user.model');
const { generateToken } = require('../../middleware/auth.middleware');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');

/**
 * User Controller
 * Handles all user-related HTTP requests
 */

/**
 * Register a new user
 * POST /api/auth/register
 */
const allowedSubjects = [
  "Artificial Intelligence",
  "Statistics in Data Science",
  "Data Warehousing & Data Mining",
  "Distributed Systems",
  "Network Security",
  "Big Data Analytics",
  "Cloud Computing",
  "Machine Learning",
  "Mobile Computing",
  "Computer Vision & Applications",
];

const subjectToId = {
"Artificial Intelligence":1,
  "Statistics in Data Science":2,
  "Data Warehousing & Data Mining":3,
  "Distributed Systems":4,
  "Network Security":5,
  "Big Data Analytics":6,
  "Cloud Computing":7,
  "Machine Learning":8,
  "Mobile Computing":9,
  "Computer Vision & Applications":10,
};
  const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, role, department, cgpa, semester } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Role-based validation
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

  // Admin or others shouldn't send CGPA/semester
  if (role === 'admin') {
    req.body.cgpa = null;
    req.body.semester = null;
  }

  // Create user
  const user = await UserModel.create({
    full_name,
    email,
    password,
    role,
    department,
    cgpa: role === 'student' ? cgpa : null,
    semester: role === 'student' ? semester : null
  });


  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  logger.info('New user registered', { userId: user.id, email: user.email });


  // fetchs password new added
const { password_hash, ...userData } = user;
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    });

});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password
  const user = await UserModel.findByEmail(email, true);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if account is active
  if (!user.is_active) {
    throw new ApiError(403, 'Account is deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Remove password from response
  delete user.password_hash;

  logger.info('User logged in', { userId: user.id, email: user.email });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token
    }
  });
});

/**
 * Get current user profile
 * GET /api/auth/profile
 * Protected route
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.id);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: { user }
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 * Protected route
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, department, cgpa, semester } = req.body;

  const updatedUser = await UserModel.update(req.user.id, {
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

/**
 * Change password
 * POST /api/auth/change-password
 * Protected route
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, 'Old password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  await UserModel.changePassword(req.user.id, oldPassword, newPassword);

  logger.info('User changed password', { userId: req.user.id });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Get all users (admin only)
 * GET /api/users
 * Protected route - Admin only
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, department, page = 1, limit = 50 } = req.query;
  
  const offset = (page - 1) * limit;
  
  const users = await UserModel.findAll({
    role,
    department,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        count: users.length
      }
    }
  });
});

/**
 * Get user by ID (admin only)
 * GET /api/users/:id
 * Protected route - Admin only
 */
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await UserModel.findById(parseInt(id));
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json({
    success: true,
    data: { user }
  });
});

/**
 * Deactivate user (admin only)
 * PATCH /api/users/:id/deactivate
 * Protected route - Admin only
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const success = await UserModel.deactivate(parseInt(id));
  
  if (!success) {
    throw new ApiError(404, 'User not found');
  }

  logger.info('User deactivated', { adminId: req.user.id, targetUserId: id });

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
});

/**
 * Delete user (admin only)
 * DELETE /api/users/:id
 * Protected route - Admin only
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Prevent self-deletion
  if (parseInt(id) === req.user.id) {
    throw new ApiError(400, 'You cannot delete your own account');
  }
  
  const success = await UserModel.delete(parseInt(id));
  
  if (!success) {
    throw new ApiError(404, 'User not found');
  }

  logger.info('User deleted', { adminId: req.user.id, targetUserId: id });

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
  deactivateUser,
  deleteUser
};
