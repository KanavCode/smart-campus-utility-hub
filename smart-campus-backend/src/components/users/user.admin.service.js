const UserModel = require('./user.model');
const { ApiError } = require('../../middleware/errorHandler');

/**
 * Admin Service (v2.0 — UUID-based)
 * All user IDs are now UUIDs, not integers.
 */

const listUsers = async ({ role, department, is_active, page = 1, limit = 50 }) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
  const offset = (pageNum - 1) * limitNum;

  const users = await UserModel.findAll({
    role,
    department,
    is_active,
    limit: limitNum,
    offset
  });

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      count: users.length
    }
  };
};

const getUserById = async ({ id }) => {
  const user = await UserModel.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const updateUserByAdmin = async ({ id, updates }) => {
  const targetId = id;

  if (updates.role === 'student') {
    const hasCgpa = Object.prototype.hasOwnProperty.call(updates, 'cgpa');
    const hasSemester = Object.prototype.hasOwnProperty.call(updates, 'semester');

    if (!(hasCgpa && hasSemester)) {
      throw new ApiError(400, 'CGPA and Semester are required when role is student');
    }
  }

  const normalizedUpdates = { ...updates };
  if (normalizedUpdates.role === 'admin') {
    normalizedUpdates.cgpa = null;
    normalizedUpdates.semester = null;
  }

  const updatedUser = await UserModel.updateByAdmin(targetId, normalizedUpdates);
  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return { targetId, updatedUser };
};

const deactivateUser = async ({ id }) => {
  const success = await UserModel.deactivate(id);

  if (!success) {
    throw new ApiError(404, 'User not found');
  }

  return id;
};

const deleteUser = async ({ id, requesterId }) => {
  if (id === requesterId) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const success = await UserModel.delete(id);

  if (!success) {
    throw new ApiError(404, 'User not found');
  }

  return id;
};

module.exports = {
  listUsers,
  getUserById,
  updateUserByAdmin,
  deactivateUser,
  deleteUser
};
