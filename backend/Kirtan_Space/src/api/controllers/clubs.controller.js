const db = require('../../config/db');


// @desc    Create a new club (Admin only)
const createClub = async (req, res) => {
 
  try {
    const { name, description, contactEmail, category } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Club name is required.' });
    }

    const newClubQuery = `
      INSERT INTO "Clubs" (name, description, "contactEmail", category)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const { rows } = await db.query(newClubQuery, [name, description, contactEmail, category]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create Club Error:', error);
    res.status(500).json({ message: 'Server error while creating club.' });
  }
};

// @desc    Get all clubs (Public)
const getAllClubs = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM "Clubs" ORDER BY name ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Get All Clubs Error:', error);
    res.status(500).json({ message: 'Server error while fetching clubs.' });
  }
};



// @desc    Get a single club by ID (Public)
const getClubById = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM "Clubs" WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Club not found.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Get Club By ID Error:', error);
    res.status(500).json({ message: 'Server error while fetching club.' });
  }
};
// @desc    Update a club (Admin only)
const updateClub = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, contactEmail, category } = req.body;
    
    const updateQuery = `
      UPDATE "Clubs"
      SET name = $1, description = $2, "contactEmail" = $3, category = $4
      WHERE id = $5
      RETURNING *;
    `;
    const { rows } = await db.query(updateQuery, [name, description, contactEmail, category, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Club not found.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Update Club Error:', error);
    res.status(500).json({ message: 'Server error while updating club.' });
  }
};

// @desc    Delete a club (Admin only)
const deleteClub = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM "Clubs" WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Club not found.' });
    }
    res.status(204).send(); // 204 No Content is standard for successful deletion
  } catch (error) {
    console.error('Delete Club Error:', error);
    res.status(500).json({ message: 'Server error while deleting club.' });
  }
};

module.exports = {
  createClub,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
};