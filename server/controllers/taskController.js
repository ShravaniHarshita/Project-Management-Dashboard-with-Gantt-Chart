const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { isMockDataMode, getMockData } = require('../config/db');

/**
 * @desc    Get all tasks for a project
 * @route   GET /api/tasks/:projectId
 * @access  Public
 */
exports.getTasks = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  // If in mock data mode, return mock tasks
  if (isMockDataMode()) {
    const mockData = getMockData();
    let tasks = mockData.tasks.filter(t => t.projectId === projectId);
    
    // Apply search filter if provided
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search)
      );
    }
    
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
      pagination: { page: 1, limit: 50, total: tasks.length },
      mockMode: true
    });
  }

  // Verify project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return next(new ErrorResponse(`Project not found with id ${projectId}`, 404));
  }

  // Build query
  let query;
  const reqQuery = { ...req.query, projectId };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  const parsedQuery = JSON.parse(queryStr);

  // Search functionality
  if (req.query.search) {
    parsedQuery.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  query = Task.find(parsedQuery)
    .populate('dependencyTaskId', 'title status')
    .populate('assignedResource', 'name role');

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('order startDate');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  const total = await Task.countDocuments(parsedQuery);

  query = query.skip(startIndex).limit(limit);

  const tasks = await query;

  // Pagination result
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: limit
  };

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination,
    data: tasks
  });
});

/**
 * @desc    Get all tasks (across all projects)
 * @route   GET /api/tasks
 * @access  Public
 */
exports.getAllTasks = asyncHandler(async (req, res, next) => {
  // If in mock data mode, return mock tasks
  if (isMockDataMode()) {
    const mockData = getMockData();
    let tasks = mockData.tasks.map(t => ({
      ...t,
      projectId: mockData.projects.find(p => p._id === t.projectId) || { name: 'Project', status: 'Active' }
    }));
    
    // Apply search filter if provided
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search) || 
        t.description.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter if provided
    if (req.query.status) {
      tasks = tasks.filter(t => t.status === req.query.status);
    }
    
    return res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: { currentPage: 1, totalPages: 1, totalItems: tasks.length, itemsPerPage: 50 },
      data: tasks,
      mockMode: true
    });
  }

  let query;
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  const parsedQuery = JSON.parse(queryStr);

  // Search functionality
  if (req.query.search) {
    parsedQuery.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  query = Task.find(parsedQuery)
    .populate('projectId', 'name status')
    .populate('dependencyTaskId', 'title status')
    .populate('assignedResource', 'name role');

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  const total = await Task.countDocuments(parsedQuery);

  query = query.skip(startIndex).limit(limit);

  const tasks = await query;

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: limit
  };

  res.status(200).json({
    success: true,
    count: tasks.length,
    pagination,
    data: tasks
  });
});

/**
 * @desc    Get single task
 * @route   GET /api/tasks/detail/:id
 * @access  Public
 */
exports.getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('projectId', 'name status startDate endDate')
    .populate('dependencyTaskId', 'title status endDate')
    .populate('assignedResource', 'name role email');

  if (!task) {
    return next(new ErrorResponse(`Task not found with id ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Public
 */
exports.createTask = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate task creation
  if (isMockDataMode()) {
    const newTask = {
      _id: `mock-${Date.now()}`,
      ...req.body,
      progress: req.body.progress || 0,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return res.status(201).json({
      success: true,
      data: newTask,
      mockMode: true
    });
  }

  // Verify project exists
  const project = await Project.findById(req.body.projectId);
  if (!project) {
    return next(new ErrorResponse(`Project not found with id ${req.body.projectId}`, 404));
  }

  // Validate dependency if provided
  if (req.body.dependencyTaskId) {
    const dependencyTask = await Task.findById(req.body.dependencyTaskId);
    if (!dependencyTask) {
      return next(new ErrorResponse(`Dependency task not found`, 404));
    }
    
    // Ensure dependency task belongs to same project
    if (dependencyTask.projectId.toString() !== req.body.projectId) {
      return next(new ErrorResponse(`Dependency task must belong to the same project`, 400));
    }

    // Ensure task starts after dependency ends
    if (new Date(req.body.startDate) < new Date(dependencyTask.endDate)) {
      return next(new ErrorResponse(`Task start date must be after dependency task end date`, 400));
    }
  }

  // Get the highest order number for this project
  const highestOrder = await Task.findOne({ projectId: req.body.projectId })
    .sort('-order')
    .select('order');
  
  req.body.order = highestOrder ? highestOrder.order + 1 : 1;

  const task = await Task.create(req.body);

  // Populate the created task
  const populatedTask = await Task.findById(task._id)
    .populate('dependencyTaskId', 'title status')
    .populate('assignedResource', 'name role');

  res.status(201).json({
    success: true,
    data: populatedTask
  });
});

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Public
 */
exports.updateTask = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate task update
  if (isMockDataMode()) {
    const updatedTask = {
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    return res.status(200).json({
      success: true,
      data: updatedTask,
      mockMode: true
    });
  }

  try {
    console.log('UPDATE TASK - Request body:', JSON.stringify(req.body, null, 2));
    
    let task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ErrorResponse(`Task not found with id ${req.params.id}`, 404));
    }

    console.log('UPDATE TASK - Existing task dates:');
    console.log('  startDate:', task.startDate);
    console.log('  endDate:', task.endDate);

    // Validate dates if being updated
    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      console.log('UPDATE TASK - Validating both dates:');
      console.log('  new startDate:', startDate);
      console.log('  new endDate:', endDate);
      
      if (endDate < startDate) {
        return next(new ErrorResponse('End date must be after or equal to start date', 400));
      }
    } else if (req.body.endDate && !req.body.startDate) {
      // If only endDate is being updated, check against existing startDate
      const endDate = new Date(req.body.endDate);
      
      console.log('UPDATE TASK - Validating endDate only:');
      console.log('  new endDate:', endDate);
      console.log('  existing startDate:', task.startDate);
      
      if (endDate < task.startDate) {
        return next(new ErrorResponse('End date must be after or equal to start date', 400));
      }
    } else if (req.body.startDate && !req.body.endDate) {
      // If only startDate is being updated, check against existing endDate
      const startDate = new Date(req.body.startDate);
      
      console.log('UPDATE TASK - Validating startDate only:');
      console.log('  new startDate:', startDate);
      console.log('  existing endDate:', task.endDate);
      
      if (startDate > task.endDate) {
        return next(new ErrorResponse('Start date must be before or equal to end date', 400));
      }
    }

    // Validate dependency if being updated
    if (req.body.dependencyTaskId && req.body.dependencyTaskId !== task.dependencyTaskId?.toString()) {
      const dependencyTask = await Task.findById(req.body.dependencyTaskId);
      if (!dependencyTask) {
        return next(new ErrorResponse(`Dependency task not found`, 404));
      }
      
      // Prevent circular dependency
      if (req.body.dependencyTaskId === req.params.id) {
        return next(new ErrorResponse(`Task cannot depend on itself`, 400));
      }

      // Check for circular dependency chain
      let currentDep = dependencyTask;
      while (currentDep && currentDep.dependencyTaskId) {
        if (currentDep.dependencyTaskId.toString() === req.params.id) {
          return next(new ErrorResponse(`Circular dependency detected`, 400));
        }
        currentDep = await Task.findById(currentDep.dependencyTaskId);
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
      .populate('dependencyTaskId', 'title status')
      .populate('assignedResource', 'name role');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(err => err.message).join(', ');
      return next(new ErrorResponse(message, 400));
    }
    return next(error);
  }
});

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Public
 */
exports.deleteTask = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate task deletion
  if (isMockDataMode()) {
    return res.status(200).json({
      success: true,
      data: {},
      mockMode: true
    });
  }

  const task = await Task.findById(req.params.id);

  if (!task) {
    return next(new ErrorResponse(`Task not found with id ${req.params.id}`, 404));
  }

  // Check if any other tasks depend on this one
  const dependentTasks = await Task.find({ dependencyTaskId: req.params.id });
  if (dependentTasks.length > 0) {
    // Remove dependency from dependent tasks
    await Task.updateMany(
      { dependencyTaskId: req.params.id },
      { $set: { dependencyTaskId: null } }
    );
  }

  const projectId = task.projectId;
  await Task.findByIdAndDelete(req.params.id);

  // Update project completion
  await Task.updateProjectCompletion(projectId);

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Update task order (for drag and drop)
 * @route   PUT /api/tasks/reorder
 * @access  Public
 */
exports.reorderTasks = asyncHandler(async (req, res, next) => {
  const { taskOrders } = req.body; // Array of { id, order }

  if (!taskOrders || !Array.isArray(taskOrders)) {
    return next(new ErrorResponse('Task orders array is required', 400));
  }

  // Update each task's order
  const updatePromises = taskOrders.map(({ id, order }) =>
    Task.findByIdAndUpdate(id, { order }, { new: true })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Task order updated successfully'
  });
});

/**
 * @desc    Get task statistics
 * @route   GET /api/tasks/stats/overview
 * @access  Public
 */
exports.getTaskStats = asyncHandler(async (req, res, next) => {
  // Total tasks
  const totalTasks = await Task.countDocuments();

  // Tasks by status
  const tasksByStatus = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Tasks by priority
  const tasksByPriority = await Task.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Milestone count
  const milestonesCount = await Task.countDocuments({ milestone: true });

  // Overdue tasks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = await Task.countDocuments({
    endDate: { $lt: today },
    status: { $ne: 'Completed' }
  });

  // Average progress
  const avgProgress = await Task.aggregate([
    {
      $group: {
        _id: null,
        avgProgress: { $avg: '$progress' }
      }
    }
  ]);

  // Tasks due this week
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueSoon = await Task.countDocuments({
    endDate: { $gte: today, $lte: nextWeek },
    status: { $ne: 'Completed' }
  });

  res.status(200).json({
    success: true,
    data: {
      totalTasks,
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      milestonesCount,
      overdueTasks,
      avgProgress: avgProgress[0]?.avgProgress || 0,
      dueSoon
    }
  });
});

/**
 * @desc    Get tasks for Gantt chart format
 * @route   GET /api/tasks/gantt/:projectId
 * @access  Public
 */
exports.getGanttTasks = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;

  // If in mock data mode, return mock Gantt data
  if (isMockDataMode()) {
    const mockData = getMockData();
    let tasks = projectId 
      ? mockData.tasks.filter(t => t.projectId === projectId)
      : mockData.tasks;
    
    // Format dates for Gantt chart (YYYY-MM-DD format)
    const formatDate = (date) => {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Calculate duration in days
    const getDuration = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    };

    const ganttData = {
      data: tasks.map(task => ({
        id: task._id,
        text: task.title,
        start_date: formatDate(task.startDate),
        duration: getDuration(task.startDate, task.endDate),
        progress: (task.progress || 0) / 100,
        parent: 0,
        type: task.milestone ? 'milestone' : 'task',
        color: task.color,
        assignee: task.assignedResourceName || 'Unassigned',
        status: task.status,
        priority: task.priority,
        projectName: mockData.projects.find(p => p._id === task.projectId)?.name || ''
      })),
      links: []
    };

    return res.status(200).json(ganttData);
  }

  let tasks;
  let projects = [];

  if (projectId) {
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return next(new ErrorResponse(`Project not found with id ${projectId}`, 404));
    }
    tasks = await Task.find({ projectId })
      .sort('order startDate')
      .populate('assignedResource', 'name');
  } else {
    // Get all tasks from all projects
    tasks = await Task.find()
      .sort('projectId order startDate')
      .populate('assignedResource', 'name')
      .populate('projectId', 'name');
    
    // Get all projects for grouping
    projects = await Project.find().select('name startDate endDate');
  }

  // Format tasks for Gantt chart
  const ganttData = {
    data: tasks.map(task => ({
      id: task._id,
      text: task.title,
      start_date: task.startDate,
      end_date: task.endDate,
      duration: task.duration,
      progress: task.progress / 100,
      parent: 0,
      type: task.milestone ? 'milestone' : 'task',
      color: task.color,
      assignee: task.assignedResource?.name || task.assignedResourceName || 'Unassigned',
      status: task.status,
      priority: task.priority,
      projectName: task.projectId?.name || ''
    })),
    links: tasks
      .filter(task => task.dependencyTaskId)
      .map((task, index) => ({
        id: index + 1,
        source: task.dependencyTaskId,
        target: task._id,
        type: '0' // Finish-to-Start
      }))
  };

  res.status(200).json(ganttData);
});
