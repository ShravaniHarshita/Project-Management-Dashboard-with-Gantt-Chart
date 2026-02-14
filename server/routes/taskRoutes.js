const express = require('express');
const router = express.Router();
const {
  getTasks,
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  getTaskStats,
  getGanttTasks
} = require('../controllers/taskController');

// Stats route
router.get('/stats/overview', getTaskStats);

// All tasks (across projects)
router.get('/all', getAllTasks);

// Reorder tasks
router.put('/reorder', reorderTasks);

// Get single task detail
router.get('/detail/:id', getTask);

// Gantt chart data - all projects
router.get('/gantt', getGanttTasks);

// Gantt chart data - specific project
router.get('/gantt/:projectId', getGanttTasks);

// Tasks for a specific project
router.get('/:projectId', getTasks);

// CRUD routes
router.route('/')
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
