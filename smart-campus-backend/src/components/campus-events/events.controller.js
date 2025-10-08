const { query } = require('../../config/db');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { logger } = require('../../config/db');

/**
 * Events Controller
 * Handles all event-related HTTP requests
 */

/**
 * Create a new event (Admin only)
 * POST /api/events
 */
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, location, start_time, end_time, club_id, target_department, is_featured, tags } = req.body;

  const sql = `
    INSERT INTO events (title, description, location, start_time, end_time, club_id, target_department, is_featured, tags)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [title, description, location, start_time, end_time, club_id, target_department, is_featured || false, tags];
  const result = await query(sql, values);

  logger.info('Event created', { eventId: result.rows[0].id, createdBy: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event: result.rows[0] }
  });
});

/**
 * Get all events with filtering
 * GET /api/events
 * Public route
 */
const getAllEvents = asyncHandler(async (req, res) => {
  const { search, tag, club_id, department, is_featured, upcoming } = req.query;
  
  let sql = 'SELECT e.*, c.name as club_name FROM events e LEFT JOIN clubs c ON e.club_id = c.id WHERE 1=1';
  const values = [];
  let paramCounter = 1;

  // Search by title or description
  if (search) {
    sql += ` AND (e.title ILIKE $${paramCounter} OR e.description ILIKE $${paramCounter})`;
    values.push(`%${search}%`);
    paramCounter++;
  }

  // Filter by tag
  if (tag) {
    sql += ` AND $${paramCounter} = ANY(e.tags)`;
    values.push(tag);
    paramCounter++;
  }

  // Filter by club
  if (club_id) {
    sql += ` AND e.club_id = $${paramCounter}`;
    values.push(parseInt(club_id));
    paramCounter++;
  }

  // Filter by department
  if (department) {
    sql += ` AND (e.target_department = $${paramCounter} OR e.target_department IS NULL)`;
    values.push(department);
    paramCounter++;
  }

  // Filter featured events
  if (is_featured === 'true') {
    sql += ' AND e.is_featured = true';
  }

  // Filter upcoming events only
  if (upcoming === 'true') {
    sql += ' AND e.start_time > NOW()';
  }

  sql += ' ORDER BY e.start_time ASC';

  const result = await query(sql, values);

  res.json({
    success: true,
    data: { events: result.rows, count: result.rows.length }
  });
});

/**
 * Get single event by ID
 * GET /api/events/:id
 * Public route
 */
const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT e.*, c.name as club_name, c.description as club_description
    FROM events e
    LEFT JOIN clubs c ON e.club_id = c.id
    WHERE e.id = $1
  `;

  const result = await query(sql, [parseInt(id)]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Event not found');
  }

  res.json({
    success: true,
    data: { event: result.rows[0] }
  });
});

/**
 * Update an event (Admin only)
 * PUT /api/events/:id
 */
const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, location, start_time, end_time, club_id, target_department, is_featured, tags } = req.body;

  const sql = `
    UPDATE events
    SET title = $1, description = $2, location = $3, start_time = $4, end_time = $5,
        club_id = $6, target_department = $7, is_featured = $8, tags = $9
    WHERE id = $10
    RETURNING *
  `;

  const values = [title, description, location, start_time, end_time, club_id, target_department, is_featured, tags, parseInt(id)];
  const result = await query(sql, values);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Event not found');
  }

  logger.info('Event updated', { eventId: id, updatedBy: req.user.id });

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event: result.rows[0] }
  });
});

/**
 * Delete an event (Admin only)
 * DELETE /api/events/:id
 */
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query('DELETE FROM events WHERE id = $1 RETURNING *', [parseInt(id)]);

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Event not found');
  }

  logger.info('Event deleted', { eventId: id, deletedBy: req.user.id });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

/**
 * Save an event for a user (Protected)
 * POST /api/events/:id/save
 */
const saveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check if event exists
  const eventCheck = await query('SELECT id FROM events WHERE id = $1', [parseInt(id)]);
  if (eventCheck.rows.length === 0) {
    throw new ApiError(404, 'Event not found');
  }

  // Check if already saved
  const existingCheck = await query(
    'SELECT * FROM saved_events WHERE user_id = $1 AND event_id = $2',
    [userId, parseInt(id)]
  );

  if (existingCheck.rows.length > 0) {
    throw new ApiError(400, 'Event already saved');
  }

  // Save the event
  await query(
    'INSERT INTO saved_events (user_id, event_id) VALUES ($1, $2)',
    [userId, parseInt(id)]
  );

  logger.info('Event saved', { eventId: id, userId });

  res.json({
    success: true,
    message: 'Event saved successfully'
  });
});

/**
 * Unsave an event (Protected)
 * DELETE /api/events/:id/save
 */
const unsaveEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const result = await query(
    'DELETE FROM saved_events WHERE user_id = $1 AND event_id = $2 RETURNING *',
    [userId, parseInt(id)]
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, 'Event not in saved list');
  }

  logger.info('Event unsaved', { eventId: id, userId });

  res.json({
    success: true,
    message: 'Event removed from saved list'
  });
});

/**
 * Get user's saved events (Protected)
 * GET /api/events/saved
 */
const getSavedEvents = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT e.*, c.name as club_name, se.saved_at
    FROM saved_events se
    JOIN events e ON se.event_id = e.id
    LEFT JOIN clubs c ON e.club_id = c.id
    WHERE se.user_id = $1
    ORDER BY e.start_time ASC
  `;

  const result = await query(sql, [userId]);

  res.json({
    success: true,
    data: { events: result.rows, count: result.rows.length }
  });
});

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  saveEvent,
  unsaveEvent,
  getSavedEvents
};
