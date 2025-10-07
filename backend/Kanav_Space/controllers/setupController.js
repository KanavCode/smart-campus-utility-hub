const db = require('../config/db');

/**
 * Generic function to create a record in any table
 */
exports.createOne = (table) => async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide data to create the record.'
      });
    }

    const columns = Object.keys(req.body).join(', ');
    const values = Object.values(req.body);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await db.query(query, values);

    res.status(201).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error(`Error creating ${table}:`, error);
    next(error);
  }
};

/**
 * Generic function to get all records from any table
 */
exports.getAll = (table) => async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT * FROM ${table} ORDER BY id ASC`);

    res.status(200).json({
      status: 'success',
      results: rows.length,
      data: rows
    });
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    next(error);
  }
};

/**
 * Generic function to get one record by ID from any table
 */
exports.getOne = (table) => async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid ID.'
      });
    }

    const { rows } = await db.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `No ${table.slice(0, -1)} found with that ID`
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error(`Error fetching ${table}:`, error);
    next(error);
  }
};

/**
 * Generic function to update a record in any table
 */
exports.updateOne = (table) => async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid ID.'
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide data to update the record.'
      });
    }

    const updates = Object.entries(req.body).map(([key, _], i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(req.body), id];
    
    const query = `UPDATE ${table} SET ${updates} WHERE id = $${values.length} RETURNING *`;
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `No ${table.slice(0, -1)} found with that ID`
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error(`Error updating ${table}:`, error);
    next(error);
  }
};

/**
 * Generic function to delete a record from any table
 */
exports.deleteOne = (table) => async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid ID.'
      });
    }

    const { rowCount } = await db.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

    if (rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: `No ${table.slice(0, -1)} found with that ID`
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error(`Error deleting ${table}:`, error);
    next(error);
  }
};

/**
 * Get statistics for the dashboard
 */
exports.getStats = async (req, res, next) => {
  try {
    const stats = await Promise.all([
      db.query('SELECT COUNT(*) as count FROM teachers'),
      db.query('SELECT COUNT(*) as count FROM subjects'),
      db.query('SELECT COUNT(*) as count FROM classes'),
      db.query('SELECT COUNT(*) as count FROM classrooms'),
      db.query('SELECT COUNT(*) as count FROM timetable_slots'),
      db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['teacher']),
      db.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin'])
    ]);

    const result = {
      teachers: parseInt(stats[0].rows[0].count),
      subjects: parseInt(stats[1].rows[0].count),
      classes: parseInt(stats[2].rows[0].count),
      classrooms: parseInt(stats[3].rows[0].count),
      timetableSlots: parseInt(stats[4].rows[0].count),
      teacherUsers: parseInt(stats[5].rows[0].count),
      adminUsers: parseInt(stats[6].rows[0].count)
    };

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    next(error);
  }
};

/**
 * Bulk insert for class-subject mappings
 */
exports.bulkCreateClassSubjects = async (req, res, next) => {
  try {
    const { mappings } = req.body;

    if (!mappings || !Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of class-subject mappings.'
      });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const results = [];
      for (const mapping of mappings) {
        const { class_id, subject_id, lectures_per_week } = mapping;
        
        if (!class_id || !subject_id || !lectures_per_week) {
          throw new Error('Each mapping must have class_id, subject_id, and lectures_per_week');
        }

        const query = `
          INSERT INTO class_subject_map (class_id, subject_id, lectures_per_week) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (class_id, subject_id) 
          DO UPDATE SET lectures_per_week = EXCLUDED.lectures_per_week
          RETURNING *
        `;
        const { rows } = await client.query(query, [class_id, subject_id, lectures_per_week]);
        results.push(rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        status: 'success',
        message: `Successfully created/updated ${results.length} class-subject mappings`,
        data: results
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error bulk creating class-subjects:', error);
    next(error);
  }
};