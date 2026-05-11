const UserModel = require('./user.model');
const { ApiError } = require('../../middleware/errorHandler');
const { parseInteger, parsePagination } = require('../../utils/request');

const listUsers = async ({ role, department, is_active, page = 1, limit = 50 }) => {
  const pagination = parsePagination(page, limit);

  const users = await UserModel.findAll({
    role,
    department,
    is_active,
    limit: pagination.limit,
    offset: pagination.offset
  });

  return {
    users,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      count: users.length
    }
  };
};

const getUserById = async ({ id }) => {
  const user = await UserModel.findById(parseInteger(id));

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

const updateUserByAdmin = async ({ id, updates }) => {
  const targetId = parseInteger(id);

  if (Number.isNaN(targetId)) {
    throw new ApiError(400, 'Invalid user id');
  }

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
  const targetId = parseInteger(id);
  const success = await UserModel.deactivate(targetId);

  if (!success) {
    throw new ApiError(404, 'User not found');
  }

  return targetId;
};

const deleteUser = async ({ id, requesterId }) => {
  const targetId = parseInteger(id);

  if (targetId === requesterId) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  const success = await UserModel.delete(targetId);

  if (!success) {
    throw new ApiError(404, 'User not found');
  }

  return targetId;
};

module.exports = {
  listUsers,
  getUserById,
  updateUserByAdmin,
  deactivateUser,
  deleteUser
};
