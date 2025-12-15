const { query } = require('../../config/db');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');

/**
 * Clubs Controller
 * Handles all club-related HTTP requests
  */

/**
 * Create a new club (Admin only)
 * POST /api/clubs
 */
 const createClub = asyncHandler(async (req, res) => {
  const { name, description, contact_email, category } = req.body;

  const sql = `
    INSERT INTO clubs (name, description, contact_email, category)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await query(sql, [name, description, contact_email, category]);

  logger.info('Club created', { clubId: result.rows[0].id, createdBy: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Club created successfully',
    data: { club: result.rows[0] }
  });
});

/**
 * Get all clubs
 * GET /api/clubs
 * Public route
 */
const getAllClubs = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  
  let sql = 'SELECT * FROM clubs WHERE 1=1';
  const values = [];
  let paramCounter = 1;

  if (category) {
    sql += ` AND category = $${paramCounter}`;
    values.push(category);
    paramCounter++;
  }

  if (search) {
    sql += ` AND (name ILIKE $${paramCounter} OR description ILIKE $${paramCounter})`;
    values.push(`%${search}%`);
    paramCounter++;
  }

  sql += ' ORDER BY name ASC';

  const result = await query(sql, values);

  res.json({
    success: true,
    data: { clubs: result.rows, count: result.rows.length }
  });
});

/**
 * Get single club by ID with its events
 * GET /api/clubs/:id
 * Public route
 */
const getClubById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get club details
  const clubResult = await query('SELECT * FROM clubs WHERE id = $1', [parseInt(id)]);

  if (clubResult.rows.length === 0) {
    throw new ApiError(404, 'Club not found');
  }

  // Get club's events
  const eventsResult = await query(
    'SELECT * FROM events WHERE club_id = $1 ORDER BY start_time DESC',
    [parseInt(id)]
  );

  res.json({
    success: true,
    data: {
      club: clubResult.rows[0],
      events: eventsResult.rows
    }
  });
});

/**
 * Update a club (Admin only)
 * PUT /api/clubs/:id
 */
const updateClub = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, contact_email, category } = req.body;

  const sql = `
    UPDATE clubs
    SET name = $1, description = $2, contact_email = $3, category = $4
    WHERE id = $5
    RETURNING *
  `;

  const result = await query(sql, [name, description, contact_email, category, parseInt(id)]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Club not found');
  }

  logger.info('Club updated', { clubId: id, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Club updated successfully',
    data: { club: result.rows[0] }
  });
});

/**
 * Delete a club (Admin only)
 * DELETE /api/clubs/:id
 */
const deleteClub = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query('DELETE FROM clubs WHERE id = $1 RETURNING *', [parseInt(id)]);

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Club not found');
  }

  logger.info('Club deleted', { clubId: id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Club deleted successfully'
  });
});

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub
};
