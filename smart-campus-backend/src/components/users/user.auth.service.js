const crypto = require('crypto');
const UserModel = require('./user.model');
const { generateToken } = require('../../middleware/auth.middleware');
const { ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../../utils/emailService');

const AUTH_COOKIE_NAME = 'authToken';
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days 

const buildAuthCookieOptions = () => {
  const sameSite = process.env.AUTH_COOKIE_SAME_SITE || 'strict';
  const secure =
    process.env.AUTH_COOKIE_SECURE === 'true' ||
    (process.env.AUTH_COOKIE_SECURE !== 'false' &&
      process.env.NODE_ENV === 'production');

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/',
  };
};

const registerUser = async ({ full_name, email, password, role, department, cgpa, semester }) => {
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

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const userData = { ...user };
  delete userData.password_hash;

  return {
    user: userData,
    token,
  };
};

const loginUser = async ({ email, password }) => {
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

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  delete user.password_hash;

  return {
    user,
    token,
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

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    token,
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
  AUTH_COOKIE_NAME,
  buildAuthCookieOptions,
};
