const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const eventsController = require('./events.controller');
const { verifyToken, verifyAdmin } = require('../../middleware/auth.middleware');
const { validate, validationSchemas } = require('../../middleware/validation');
const { apiLimiter } = require('../../middleware/rateLimiter.middleware'); // 🛡️ Rate Limiter from Issue #190

// ── Multer Storage Config ──────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
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

// Public routes 🛡️ (With Issue #190 Rate Limiting)
router.get('/', apiLimiter, validate(validationSchemas.eventQuery, 'query'), eventsController.getAllEvents);

// Protected routes — must be declared BEFORE /:id to avoid route shadowing
router.get('/saved/my-events', verifyToken, eventsController.getSavedEvents);

router.get('/:id', apiLimiter, validate(validationSchemas.idParam, 'params'), eventsController.getEventById);
router.post('/:id/save', verifyToken, validate(validationSchemas.idParam, 'params'), eventsController.saveEvent);
router.delete('/:id/save', verifyToken, validate(validationSchemas.idParam, 'params'), eventsController.unsaveEvent);

// 🎫 RSVP / Join Waitlist Engine (Added for Issue #194)
router.post('/:id/rsvp', verifyToken, validate(validationSchemas.idParam, 'params'), eventsController.rsvpToEvent);
router.delete('/:id/rsvp', verifyToken, validate(validationSchemas.idParam, 'params'), eventsController.cancelRsvpToEvent);

// Admin-only routes — upload.single('image') must match frontend field name
// Admin-only routes
router.post('/', verifyToken, verifyAdmin, upload.single('image'), eventsController.createEvent);
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), validate(validationSchemas.idParam, 'params'), eventsController.updateEvent);
router.delete('/:id', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), eventsController.deleteEvent);
router.post('/:id/restore', verifyToken, verifyAdmin, validate(validationSchemas.idParam, 'params'), eventsController.restoreEvent);

module.exports = router;