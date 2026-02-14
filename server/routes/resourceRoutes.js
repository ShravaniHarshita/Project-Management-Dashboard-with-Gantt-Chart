const express = require('express');
const router = express.Router();
const {
  getResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  getResourceUtilization,
  getAvailableResources
} = require('../controllers/resourceController');

// Utilization stats
router.get('/stats/utilization', getResourceUtilization);

// Available resources
router.get('/available', getAvailableResources);

// CRUD routes
router.route('/')
  .get(getResources)
  .post(createResource);

router.route('/:id')
  .get(getResource)
  .put(updateResource)
  .delete(deleteResource);

module.exports = router;
