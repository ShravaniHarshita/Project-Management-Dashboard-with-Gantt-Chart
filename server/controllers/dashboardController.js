const Project = require('../models/Project');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const asyncHandler = require('../utils/asyncHandler');
const { isMockDataMode, getMockData } = require('../config/db');

/**
 * @desc    Get dashboard overview statistics
 * @route   GET /api/dashboard/overview
 * @access  Public
 */
exports.getDashboardOverview = asyncHandler(async (req, res, next) => {
  // If in mock data mode, return mock dashboard data
  if (isMockDataMode()) {
    const mockData = getMockData();
    const completedTasks = mockData.tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = mockData.tasks.filter(t => t.status === 'In Progress').length;
    const pendingTasks = mockData.tasks.filter(t => t.status === 'Not Started').length;
    
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects: mockData.projects.length,
          completedProjects: mockData.projects.filter(p => p.status === 'Completed').length,
          inProgressProjects: mockData.projects.filter(p => p.status === 'In Progress').length,
          delayedProjects: 0,
          totalTasks: mockData.tasks.length,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          delayedTasks: 0,
          milestoneTasks: 2,
          totalResources: mockData.resources.length,
          availableResources: mockData.resources.filter(r => r.availability).length,
          avgResourceUtilization: 65
        },
        taskStatusDistribution: [
          { name: 'Completed', value: completedTasks, color: '#10B981' },
          { name: 'In Progress', value: inProgressTasks, color: '#3B82F6' },
          { name: 'Not Started', value: pendingTasks, color: '#6B7280' },
          { name: 'Delayed', value: 0, color: '#EF4444' }
        ],
        projectProgress: mockData.projects.map(p => ({ name: p.name, completionPercentage: p.progress, status: p.status })),
        recentActivities: mockData.tasks.slice(0, 5).map((t, index) => ({ _id: t._id, title: t.title, status: t.status, progress: t.progress, updatedAt: new Date(Date.now() - index * 3600000).toISOString(), projectId: { name: mockData.projects.find(p => p._id === t.projectId)?.name || 'Project' } })),
        upcomingDeadlines: mockData.tasks.filter(t => t.status !== 'Completed').slice(0, 3).map(t => ({ _id: t._id, title: t.title, endDate: t.endDate, status: t.status, projectId: { name: mockData.projects.find(p => p._id === t.projectId)?.name || 'Project' } })),
        monthlyTrend: [
          { _id: { year: 2024, month: 1 }, count: 5 },
          { _id: { year: 2024, month: 2 }, count: 8 },
          { _id: { year: 2024, month: 3 }, count: 12 }
        ],
        mockMode: true
      }
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Project statistics
  const totalProjects = await Project.countDocuments();
  const completedProjects = await Project.countDocuments({ status: 'Completed' });
  const inProgressProjects = await Project.countDocuments({ status: 'In Progress' });
  const delayedProjects = await Project.countDocuments({ status: 'Delayed' });

  // Task statistics
  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ status: 'Completed' });
  const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
  const pendingTasks = await Task.countDocuments({ status: 'Not Started' });
  const delayedTasks = await Task.countDocuments({ status: 'Delayed' });
  const milestoneTasks = await Task.countDocuments({ milestone: true });

  // Resource statistics
  const totalResources = await Resource.countDocuments();
  const availableResources = await Resource.countDocuments({ availability: true });

  // Calculate average resource utilization
  const resources = await Resource.find();
  let totalUtilization = 0;
  
  for (const resource of resources) {
    const activeTasks = await Task.find({
      assignedResource: resource._id,
      status: { $in: ['Not Started', 'In Progress'] }
    });
    
    const workload = activeTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    const utilization = resource.maxHoursPerWeek > 0
      ? (workload / resource.maxHoursPerWeek) * 100
      : 0;
    totalUtilization += Math.min(utilization, 100);
  }
  
  const avgResourceUtilization = resources.length > 0
    ? Math.round(totalUtilization / resources.length)
    : 0;

  // Task status distribution for pie chart
  const taskStatusDistribution = [
    { name: 'Completed', value: completedTasks, color: '#10B981' },
    { name: 'In Progress', value: inProgressTasks, color: '#3B82F6' },
    { name: 'Not Started', value: pendingTasks, color: '#6B7280' },
    { name: 'Delayed', value: delayedTasks, color: '#EF4444' }
  ];

  // Project progress for bar chart
  const projectProgress = await Project.find()
    .select('name completionPercentage status')
    .sort('-completionPercentage')
    .limit(10);

  // Recent activities (recent tasks updated)
  const recentActivities = await Task.find()
    .sort('-updatedAt')
    .limit(10)
    .populate('projectId', 'name')
    .select('title status progress updatedAt projectId');

  // Upcoming deadlines (tasks due in next 7 days)
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = await Task.find({
    endDate: { $gte: today, $lte: nextWeek },
    status: { $ne: 'Completed' }
  })
    .sort('endDate')
    .limit(5)
    .populate('projectId', 'name')
    .select('title endDate status projectId');

  // Monthly task completion trend
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyTrend = await Task.aggregate([
    {
      $match: {
        status: 'Completed',
        updatedAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        delayedProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        delayedTasks,
        milestoneTasks,
        totalResources,
        availableResources,
        avgResourceUtilization
      },
      taskStatusDistribution,
      projectProgress,
      recentActivities,
      upcomingDeadlines,
      monthlyTrend
    }
  });
});

/**
 * @desc    Get KPI data
 * @route   GET /api/dashboard/kpi
 * @access  Public
 */
exports.getKPIs = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // On-time completion rate
  const totalCompletedTasks = await Task.countDocuments({ status: 'Completed' });
  const onTimeCompletedTasks = await Task.countDocuments({
    status: 'Completed',
    $expr: { $lte: ['$updatedAt', '$endDate'] }
  });
  const onTimeRate = totalCompletedTasks > 0
    ? Math.round((onTimeCompletedTasks / totalCompletedTasks) * 100)
    : 100;

  // Average project duration
  const completedProjects = await Project.find({ status: 'Completed' });
  let avgDuration = 0;
  if (completedProjects.length > 0) {
    const totalDuration = completedProjects.reduce((sum, project) => {
      const duration = Math.ceil(
        (new Date(project.endDate) - new Date(project.startDate)) / (1000 * 60 * 60 * 24)
      );
      return sum + duration;
    }, 0);
    avgDuration = Math.round(totalDuration / completedProjects.length);
  }

  // Task throughput (tasks completed this week)
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyThroughput = await Task.countDocuments({
    status: 'Completed',
    updatedAt: { $gte: weekAgo }
  });

  // Project health distribution
  const projectHealth = await Project.aggregate([
    {
      $project: {
        health: {
          $switch: {
            branches: [
              { case: { $eq: ['$status', 'Completed'] }, then: 'Completed' },
              { case: { $eq: ['$status', 'Delayed'] }, then: 'At Risk' },
              {
                case: {
                  $and: [
                    { $gte: ['$completionPercentage', 70] },
                    { $ne: ['$status', 'Delayed'] }
                  ]
                },
                then: 'On Track'
              },
              {
                case: {
                  $and: [
                    { $gte: ['$completionPercentage', 30] },
                    { $lt: ['$completionPercentage', 70] }
                  ]
                },
                then: 'Needs Attention'
              }
            ],
            default: 'At Risk'
          }
        }
      }
    },
    {
      $group: {
        _id: '$health',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      onTimeRate,
      avgDuration,
      weeklyThroughput,
      projectHealth: projectHealth.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    }
  });
});

/**
 * @desc    Get timeline data for charts
 * @route   GET /api/dashboard/timeline
 * @access  Public
 */
exports.getTimeline = asyncHandler(async (req, res, next) => {
  const { period = '6months' } = req.query;
  
  let startDate = new Date();
  switch (period) {
    case '1month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case '3months':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case '6months':
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case '1year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      startDate.setMonth(startDate.getMonth() - 6);
  }

  // Tasks created over time
  const tasksCreated = await Task.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Tasks completed over time
  const tasksCompleted = await Task.aggregate([
    {
      $match: {
        status: 'Completed',
        updatedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' },
          day: { $dayOfMonth: '$updatedAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Projects created over time
  const projectsCreated = await Project.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      tasksCreated,
      tasksCompleted,
      projectsCreated
    }
  });
});
