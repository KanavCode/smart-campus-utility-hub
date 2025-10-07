const express = require('express');
const router = express.Router();
const clubsController = require('../controllers/clubs.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth.middleware');

// --- Public Routes ---
router.get('/', clubsController.getAllClubs);
router.get('/:id', clubsController.getClubById);

// --- Admin-Only Routes ---
// The [verifyToken, verifyAdmin] array ensures both checks run in order.
router.post('/', [verifyToken, verifyAdmin], clubsController.createClub);
router.put('/:id', [verifyToken, verifyAdmin], clubsController.updateClub);
router.delete('/:id', [verifyToken, verifyAdmin], clubsController.deleteClub);

module.exports = router;