const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const eventsController = require('./events.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');

// ── Multer Storage Config ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder must exist — created in app.js step
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `event-${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ── Routes ─────────────────────────────────────────────────────────────────

// Public routes
router.get('/', validate(validationSchemas.eventQuery, 'query'), eventsController.getAllEvents);
router.get('/:id', validate(validationSchemas.idParam, 'params'), eventsController.getEventById);

// Protected routes
router.get('/saved/my-events', verifyToken, eventsController.getSavedEvents);
router.post('/:id/save', verifyToken, validate(validationSchemas.idParam, 'params'), eventsController.saveEvent);
router.delete('/:id/save', verifyToken, validate(validationSchemas.idParam, 'params'), eventsController.unsaveEvent);

// Admin-only routes — upload.single('image') must match frontend field name
router.post('/', verifyToken, verifyAdmin, upload.single('image'), eventsController.createEvent);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), validate(validationSchemas.idParam, 'params'), eventsController.updateEvent);
router.delete('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), eventsController.deleteEvent);

module.exports = router;