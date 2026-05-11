const { sendSuccess } = require("../../utils/response");
const { query } = require("../../config/db");
const { asyncHandler, ApiError } = require("../../middleware/errorHandler");
const { logger } = require("../../config/db");

/**
 * Clubs Controller (v2.0 — UUID-based)
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

  if (!result.rows || result.rows.length === 0) {
    throw new ApiError(500, "Failed to create club");
  }

  logger.info("Club created", {
    clubId: result.rows[0].id,
    createdBy: req.user.id,
  });

  sendSuccess(res, 201, "Club created successfully", { club: result.rows[0] });
});

/**
 * Get all clubs
 * GET /api/clubs
 * Public route
 */
const getAllClubs = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    page = 1,
    limit = 10,
    sort = "name",
    order = "ASC",
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Validate parsed integers
  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError(400, "Invalid page number");
  }
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ApiError(400, "Invalid limit. Must be between 1 and 100");
  }

  const offset = (pageNum - 1) * limitNum;
  const allowedSortFields = ["name", "category", "created_at"];
  const allowedOrders = ["ASC", "DESC"];
  const sortField = allowedSortFields.includes(sort) ? sort : "name";
  const sortOrder = allowedOrders.includes(order.toUpperCase())
    ? order.toUpperCase()
    : "ASC";

  let sql = "SELECT *, COUNT(*) OVER() as total_count FROM clubs WHERE 1=1";
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

  sql += ` ORDER BY ${sortField} ${sortOrder}`;
  sql += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
  values.push(limitNum, offset);

  const result = await query(sql, values);
  const total =
    result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;

  sendSuccess(res, 200, "Clubs fetched successfully", {
    clubs: result.rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
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
  const clubResult = await query("SELECT * FROM clubs WHERE id = $1", [id]);

  if (clubResult.rows.length === 0) {
    throw new ApiError(404, "Club not found");
  }

  // Get club's events
  const eventsResult = await query(
    "SELECT * FROM events WHERE club_id = $1 ORDER BY start_time DESC",
    [id],
  );

  sendSuccess(res, 200, "Club fetched successfully", {
    club: clubResult.rows[0],
    events: eventsResult.rows,
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

  const result = await query(sql, [
    name,
    description,
    contact_email,
    category,
    id,
  ]);

  if (result.rows.length === 0) {
    throw new ApiError(404, "Club not found");
  }

  logger.info("Club updated", { clubId: id, updatedBy: req.user.id });

  sendSuccess(res, 200, "Club updated successfully", { club: result.rows[0] });
});

/**
 * Delete a club (Admin only)
 * DELETE /api/clubs/:id
 */
const deleteClub = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query("DELETE FROM clubs WHERE id = $1 RETURNING *", [
    id,
  ]);

  if (result.rowCount === 0) {
    throw new ApiError(404, "Club not found");
  }

  logger.info("Club deleted", { clubId: id, deletedBy: req.user.id });

  sendSuccess(res, 200, "Club deleted successfully");
});

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
};
