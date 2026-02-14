const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getKPIs,
  getTimeline
} = require('../controllers/dashboardController');

router.get('/overview', getDashboardOverview);
router.get('/kpi', getKPIs);
router.get('/timeline', getTimeline);

module.exports = router;
