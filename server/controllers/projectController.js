const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { isMockDataMode, getMockData } = require('../config/db');

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Public
 */
exports.getProjects = asyncHandler(async (req, res, next) => {
  // If in mock data mode, return mock projects
  if (isMockDataMode()) {
    const mockData = getMockData();
    let projects = [...mockData.projects];
    
    // Apply search filter if provided
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      projects = projects.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter if provided
    if (req.query.status) {
      projects = projects.filter(p => p.status === req.query.status);
    }
    
    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
      mockMode: true
    });
  }

  // Build query
  let query;
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string for operators
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Parse the query
  const parsedQuery = JSON.parse(queryStr);

  // Search functionality
  if (req.query.search) {
    parsedQuery.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Date range filter
  if (req.query.startDateFrom || req.query.startDateTo) {
    parsedQuery.startDate = {};
    if (req.query.startDateFrom) {
      parsedQuery.startDate.$gte = new Date(req.query.startDateFrom);
    }
    if (req.query.startDateTo) {
      parsedQuery.startDate.$lte = new Date(req.query.startDateTo);
    }
    delete parsedQuery.startDateFrom;
    delete parsedQuery.startDateTo;
  }

  query = Project.find(parsedQuery);

  // Select specific fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Project.countDocuments(parsedQuery);

  query = query.skip(startIndex).limit(limit);

  // Execute query
  const projects = await query;

  // Pagination result
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: limit
  };

  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: projects.length,
    pagination,
    data: projects
  });
});

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Public
 */
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse(`Project not found with id ${req.params.id}`, 404));
  }

  // Get tasks count for this project
  const taskStats = await Task.aggregate([
    { $match: { projectId: project._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: project,
    taskStats
  });
});

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Public
 */
exports.createProject = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate project creation
  if (isMockDataMode()) {
    const newProject = {
      _id: `mock-${Date.now()}`,
      ...req.body,
      completionPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return res.status(201).json({
      success: true,
      data: newProject,
      mockMode: true
    });
  }

  const project = await Project.create(req.body);

  res.status(201).json({
    success: true,
    data: project
  });
});

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Public
 */
exports.updateProject = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate project update
  if (isMockDataMode()) {
    const updatedProject = {
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    return res.status(200).json({
      success: true,
      data: updatedProject,
      mockMode: true
    });
  }

  try {
    console.log('UPDATE PROJECT - Request body:', JSON.stringify(req.body, null, 2));
    
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse(`Project not found with id ${req.params.id}`, 404));
    }

    console.log('UPDATE PROJECT - Existing project dates:');
    console.log('  startDate:', project.startDate);
    console.log('  endDate:', project.endDate);

    // Validate dates if both are being updated
    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      console.log('UPDATE PROJECT - Validating both dates:');
      console.log('  new startDate:', startDate);
      console.log('  new endDate:', endDate);
      
      if (endDate < startDate) {
        return next(new ErrorResponse('End date must be after or equal to start date', 400));
      }
    } else if (req.body.endDate && !req.body.startDate) {
      // If only endDate is being updated, check against existing startDate
      const endDate = new Date(req.body.endDate);
      
      console.log('UPDATE PROJECT - Validating endDate only:');
      console.log('  new endDate:', endDate);
      console.log('  existing startDate:', project.startDate);
      
      if (endDate < project.startDate) {
        return next(new ErrorResponse('End date must be after or equal to start date', 400));
      }
    } else if (req.body.startDate && !req.body.endDate) {
      // If only startDate is being updated, check against existing endDate
      const startDate = new Date(req.body.startDate);
      
      console.log('UPDATE PROJECT - Validating startDate only:');
      console.log('  new startDate:', startDate);
      console.log('  existing endDate:', project.endDate);
      
      if (startDate > project.endDate) {
        return next(new ErrorResponse('Start date must be before or equal to end date', 400));
      }
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    res.status(200).json({
      success: true,
      data: project
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
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Public
 */
exports.deleteProject = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate project deletion
  if (isMockDataMode()) {
    return res.status(200).json({
      success: true,
      data: {},
      mockMode: true
    });
  }

  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new ErrorResponse(`Project not found with id ${req.params.id}`, 404));
  }

  // Delete all tasks associated with this project
  await Task.deleteMany({ projectId: req.params.id });

  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/stats/overview
 * @access  Public
 */
exports.getProjectStats = asyncHandler(async (req, res, next) => {
  // Total projects count
  const totalProjects = await Project.countDocuments();

  // Projects by status
  const projectsByStatus = await Project.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Average completion percentage
  const avgCompletion = await Project.aggregate([
    {
      $group: {
        _id: null,
        avgCompletion: { $avg: '$completionPercentage' }
      }
    }
  ]);

  // Projects by priority
  const projectsByPriority = await Project.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent projects
  const recentProjects = await Project.find()
    .sort('-createdAt')
    .limit(5)
    .select('name status completionPercentage createdAt');

  // Projects ending soon (within 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const endingSoon = await Project.find({
    endDate: { $gte: today, $lte: nextWeek },
    status: { $ne: 'Completed' }
  }).select('name endDate status completionPercentage');

  res.status(200).json({
    success: true,
    data: {
      totalProjects,
      projectsByStatus: projectsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      avgCompletion: avgCompletion[0]?.avgCompletion || 0,
      projectsByPriority: projectsByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentProjects,
      endingSoon
    }
  });
});
