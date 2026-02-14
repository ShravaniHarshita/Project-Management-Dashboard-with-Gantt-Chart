const Resource = require('../models/Resource');
const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { isMockDataMode, getMockData } = require('../config/db');

/**
 * @desc    Get all resources
 * @route   GET /api/resources
 * @access  Public
 */
exports.getResources = asyncHandler(async (req, res, next) => {
  // If in mock data mode, return mock resources
  if (isMockDataMode()) {
    const mockData = getMockData();
    let resources = [...mockData.resources];
    
    // Apply search filter if provided
    if (req.query.search) {
      const search = req.query.search.toLowerCase();
      resources = resources.filter(r => 
        r.name.toLowerCase().includes(search) || 
        r.role.toLowerCase().includes(search) ||
        r.department.toLowerCase().includes(search)
      );
    }
    
    return res.status(200).json({
      success: true,
      count: resources.length,
      data: resources,
      pagination: { page: 1, limit: 50, total: resources.length },
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
      { name: { $regex: req.query.search, $options: 'i' } },
      { role: { $regex: req.query.search, $options: 'i' } },
      { department: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  query = Resource.find(parsedQuery);

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('name');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const startIndex = (page - 1) * limit;
  const total = await Resource.countDocuments(parsedQuery);

  query = query.skip(startIndex).limit(limit);

  const resources = await query;

  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    itemsPerPage: limit
  };

  res.status(200).json({
    success: true,
    count: resources.length,
    pagination,
    data: resources
  });
});

/**
 * @desc    Get single resource
 * @route   GET /api/resources/:id
 * @access  Public
 */
exports.getResource = asyncHandler(async (req, res, next) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
  }

  // Get tasks assigned to this resource
  const assignedTasks = await Task.find({ assignedResource: req.params.id })
    .populate('projectId', 'name')
    .select('title status progress startDate endDate projectId');

  res.status(200).json({
    success: true,
    data: resource,
    assignedTasks
  });
});

/**
 * @desc    Create new resource
 * @route   POST /api/resources
 * @access  Public
 */
exports.createResource = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate resource creation
  if (isMockDataMode()) {
    const newResource = {
      _id: `mock-${Date.now()}`,
      ...req.body,
      availability: req.body.availability !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return res.status(201).json({
      success: true,
      data: newResource,
      mockMode: true
    });
  }

  const resource = await Resource.create(req.body);

  res.status(201).json({
    success: true,
    data: resource
  });
});

/**
 * @desc    Update resource
 * @route   PUT /api/resources/:id
 * @access  Public
 */
exports.updateResource = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate resource update
  if (isMockDataMode()) {
    const updatedResource = {
      _id: req.params.id,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    return res.status(200).json({
      success: true,
      data: updatedResource,
      mockMode: true
    });
  }

  let resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
  }

  resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: resource
  });
});

/**
 * @desc    Delete resource
 * @route   DELETE /api/resources/:id
 * @access  Public
 */
exports.deleteResource = asyncHandler(async (req, res, next) => {
  // If in mock data mode, simulate resource deletion
  if (isMockDataMode()) {
    return res.status(200).json({
      success: true,
      data: {},
      mockMode: true
    });
  }

  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    return next(new ErrorResponse(`Resource not found with id ${req.params.id}`, 404));
  }

  // Remove resource assignment from all tasks
  await Task.updateMany(
    { assignedResource: req.params.id },
    { $set: { assignedResource: null, assignedResourceName: null } }
  );

  await Resource.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get resource utilization statistics
 * @route   GET /api/resources/stats/utilization
 * @access  Public
 */
exports.getResourceUtilization = asyncHandler(async (req, res, next) => {
  // If in mock data mode, return mock utilization data
  if (isMockDataMode()) {
    const mockData = getMockData();
    const utilizationData = mockData.resources.map((resource, index) => ({
      id: resource._id,
      name: resource.name,
      role: resource.role,
      availability: resource.availability,
      maxHoursPerWeek: 40,
      currentWorkload: [20, 32, 28, 36][index] || 20,
      utilizationPercentage: [50, 80, 70, 90][index] || 50,
      activeTasks: [2, 3, 2, 4][index] || 1,
      completedTasks: [5, 3, 4, 6][index] || 2,
      totalTasks: [7, 6, 6, 10][index] || 3
    }));

    return res.status(200).json({
      success: true,
      data: {
        resources: utilizationData,
        summary: {
          totalResources: mockData.resources.length,
          availableResources: mockData.resources.filter(r => r.availability).length,
          avgUtilization: 72,
          overloaded: 0,
          fullyAllocated: 1,
          underutilized: 1
        }
      },
      mockMode: true
    });
  }

  const resources = await Resource.find();

  // Calculate utilization for each resource
  const utilizationData = await Promise.all(
    resources.map(async (resource) => {
      // Get active tasks for this resource
      const activeTasks = await Task.find({
        assignedResource: resource._id,
        status: { $in: ['Not Started', 'In Progress'] }
      });

      const totalEstimatedHours = activeTasks.reduce(
        (sum, task) => sum + (task.estimatedHours || 0),
        0
      );

      const completedTasks = await Task.countDocuments({
        assignedResource: resource._id,
        status: 'Completed'
      });

      const totalTasks = await Task.countDocuments({
        assignedResource: resource._id
      });

      return {
        id: resource._id,
        name: resource.name,
        role: resource.role,
        availability: resource.availability,
        maxHoursPerWeek: resource.maxHoursPerWeek,
        currentWorkload: totalEstimatedHours,
        utilizationPercentage: resource.maxHoursPerWeek > 0
          ? Math.round((totalEstimatedHours / resource.maxHoursPerWeek) * 100)
          : 0,
        activeTasks: activeTasks.length,
        completedTasks,
        totalTasks
      };
    })
  );

  // Overall statistics
  const totalResources = resources.length;
  const availableResources = resources.filter(r => r.availability).length;
  const avgUtilization = utilizationData.length > 0
    ? Math.round(
        utilizationData.reduce((sum, r) => sum + r.utilizationPercentage, 0) /
          utilizationData.length
      )
    : 0;

  // Resources by utilization level
  const overloaded = utilizationData.filter(r => r.utilizationPercentage > 100).length;
  const fullyAllocated = utilizationData.filter(
    r => r.utilizationPercentage >= 80 && r.utilizationPercentage <= 100
  ).length;
  const underutilized = utilizationData.filter(r => r.utilizationPercentage < 50).length;

  res.status(200).json({
    success: true,
    data: {
      resources: utilizationData,
      summary: {
        totalResources,
        availableResources,
        avgUtilization,
        overloaded,
        fullyAllocated,
        underutilized
      }
    }
  });
});

/**
 * @desc    Get available resources for task assignment
 * @route   GET /api/resources/available
 * @access  Public
 */
exports.getAvailableResources = asyncHandler(async (req, res, next) => {
  // If in mock data mode, return mock available resources
  if (isMockDataMode()) {
    const mockData = getMockData();
    const availableResources = mockData.resources
      .filter(r => r.availability)
      .map((resource, index) => ({
        ...resource,
        currentWorkload: [20, 32, 28, 36][index] || 20,
        utilizationPercentage: [50, 80, 70, 90][index] || 50,
        isAvailable: true
      }));

    return res.status(200).json({
      success: true,
      data: availableResources,
      mockMode: true
    });
  }

  const resources = await Resource.find({ availability: true });

  // Filter resources that are not overloaded
  const availableResources = await Promise.all(
    resources.map(async (resource) => {
      const activeTasks = await Task.find({
        assignedResource: resource._id,
        status: { $in: ['Not Started', 'In Progress'] }
      });

      const totalHours = activeTasks.reduce(
        (sum, task) => sum + (task.estimatedHours || 0),
        0
      );

      const utilization = resource.maxHoursPerWeek > 0
        ? Math.round((totalHours / resource.maxHoursPerWeek) * 100)
        : 0;

      return {
        ...resource.toObject(),
        currentWorkload: totalHours,
        utilizationPercentage: utilization,
        isAvailable: utilization < 100
      };
    })
  );

  res.status(200).json({
    success: true,
    data: availableResources.filter(r => r.isAvailable)
  });
});
