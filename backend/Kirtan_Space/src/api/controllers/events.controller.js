const db = require('../../config/db');

// @desc    Create a new event (Admin only)
const createEvent = async (req, res) => {
  try {
    const { title, description, location, startTime, endTime, clubId, targetDepartment, isFeatured, tags } = req.body;
    if (!title || !startTime || !endTime || !clubId) {
      return res.status(400).json({ message: 'Title, startTime, endTime, and clubId are required.' });
    }

    const newEventQuery = `
      INSERT INTO "Events" (title, description, location, "startTime", "endTime", "clubId", "targetDepartment", "isFeatured", tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [title, description, location, startTime, endTime, clubId, targetDepartment, isFeatured, tags];
    const { rows } = await db.query(newEventQuery, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ message: 'Server error while creating event.' });
  }
};

// @desc    Get all events with filters (Public)
const getAllEvents = async (req, res) => {
  try {
    // Basic query
    let query = 'SELECT * FROM "Events"';
    const params = [];
    const conditions = [];

    // Filtering logic
    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }
    if (req.query.tag) {
      params.push(req.query.tag);
      conditions.push(`$${params.length} = ANY(tags)`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY "startTime" ASC';

    const { rows } = await db.query(query, params);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get All Events Error:', error);
    res.status(500).json({ message: 'Server error while fetching events.' });
  }
};

// @desc    Update an event (Admin only)
const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, startTime, endTime, clubId, targetDepartment, isFeatured, tags } = req.body;
        
        const updateQuery = `
            UPDATE "Events"
            SET title = $1, description = $2, location = $3, "startTime" = $4, "endTime" = $5, "clubId" = $6, "targetDepartment" = $7, "isFeatured" = $8, tags = $9
            WHERE id = $10
            RETURNING *;
        `;
        const values = [title, description, location, startTime, endTime, clubId, targetDepartment, isFeatured, tags, id];
        const { rows } = await db.query(updateQuery, values);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Update Event Error:', error);
        res.status(500).json({ message: 'Server error while updating event.' });
    }
};

// @desc    Delete an event (Admin only)
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM "Events" WHERE id = $1 RETURNING *', [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Delete Event Error:', error);
          res.status(500).json({ message: 'Server error while deleting event.' });
    }
};

module.exports = {
   createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent
};