const { asyncHandler } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');
const electiveService = require('./elective.service');

/**
 * Electives Controller
 * Handles elective subject management and allocation
 */

/**
 * Create a new elective (Admin only)
 * POST /api/electives
 */
const createElective = asyncHandler(async (req, res) => {
  const { subject_name, description, max_students, department, semester } = req.body;
  const elective = await electiveService.createElective({
    subject_name,
    description,
    max_students,
    department,
    semester
  });

  logger.info('Elective created', { electiveId: elective.id, createdBy: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Elective created successfully',
    data: { elective }
  });
});

/**
 * Get all electives
 * GET /api/electives
 * Public route
 */
const getAllElectives = asyncHandler(async (req, res) => {
  const { department, semester } = req.query;
  const electives = await electiveService.listElectives({ department, semester });

  res.json({
    success: true,
    data: { electives, count: electives.length }
  });
});

/**
 * Get elective by ID
 * GET /api/electives/:id
 */
const getElectiveById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const elective = await electiveService.getElectiveById(id);

  res.json({
    success: true,
    data: { elective }
  });
});

/**
 * Update elective (Admin only)
 * PUT /api/electives/:id
 */
const updateElective = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject_name, description, max_students, department, semester } = req.body;
  const elective = await electiveService.updateElective(id, {
    subject_name,
    description,
    max_students,
    department,
    semester
  });

  logger.info('Elective updated', { electiveId: id, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Elective updated successfully',
    data: { elective }
  });
});

/**
 * Delete elective (Admin only)
 * DELETE /api/electives/:id
 */
const deleteElective = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await electiveService.deleteElective(id);

  logger.info('Elective deleted', { electiveId: id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Elective deleted successfully'
  });
});

/**
 * Submit elective choices (Protected - Student only)
 * POST /api/electives/choices
 */
const submitChoices = asyncHandler(async (req, res) => {
  const { choices } = req.body; // Array of { elective_id|subject_name, preference_rank }
  const userId = req.user.id;

  // ── Null-State Armor: ensure profile is complete ──
  const user = await UserModel.findById(userId);
  if (!user || !user.semester || !user.department) {
    return res.status(400).json({
      success: false,
      error: 'PROFILE_INCOMPLETE',
      message: 'Please complete your academic profile (department & semester) to access this feature.'
    });
  }

  const result = await electiveService.submitChoices({ choices, userId });

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message
    });
  }

  logger.info('Elective choices submitted', { userId, choicesCount: choices.length });

  res.json({
    success: true,
    message: 'Elective choices submitted successfully'
  });
});

/**
 * Get user's elective choices (Protected)
 * GET /api/electives/my-choices
 */
const getMyChoices = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const choices = await electiveService.getMyChoices(userId);

  res.json({
    success: true,
    data: { choices }
  });
});

/**
 * Get user's allocated elective (Protected)
 * GET /api/electives/my-allocation
 */
const getMyAllocation = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const allocation = await electiveService.getMyAllocation(userId);

  if (!allocation) {
    return res.json({
      success: true,
      message: 'No elective allocated yet',
      data: { allocation: null }
    });
  }

  res.json({
    success: true,
    data: { allocation }
  });
});

/**
 * Run elective allocation algorithm (Admin only)
 * POST /api/electives/allocate
 */
const allocateElectives = asyncHandler(async (req, res) => {
  const allocationResults = await electiveService.allocateElectives();

  logger.info('Elective allocation completed', { 
    allocatedBy: req.user.id, 
    totalStudents: allocationResults.length 
  });

  res.json({
    success: true,
    message: 'Elective allocation completed successfully',
    data: { allocationResults }
  });
});

module.exports = {
  createElective,
  getAllElectives,
  getElectiveById,
  updateElective,
  deleteElective,
  submitChoices,
  getMyChoices,
  getMyAllocation,
  allocateElectives
};
