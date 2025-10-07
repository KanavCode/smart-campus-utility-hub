const express = require('express');
const setupController = require('../controllers/setupController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes are protected and restricted to admin only
router.use(protect);
router.use(restrictTo('admin'));

// Statistics endpoint
router.get('/stats', setupController.getStats);

// Bulk operations
router.post('/class-subjects/bulk', setupController.bulkCreateClassSubjects);

// Generic CRUD routes for all entities
const entities = [
  'teachers',
  'subjects', 
  'classes',
  'classrooms',
  'constraints',
  'class_subject_map'
];

entities.forEach(entity => {
  router
    .route(`/${entity}`)
    .get(setupController.getAll(entity))
    .post(setupController.createOne(entity));

  router
    .route(`/${entity}/:id`)
    .get(setupController.getOne(entity))
    .put(setupController.updateOne(entity))
    .delete(setupController.deleteOne(entity));
});

module.exports = router;