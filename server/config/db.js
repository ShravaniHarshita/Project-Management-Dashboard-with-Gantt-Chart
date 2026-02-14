const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let isInMemory = false;
let useMockData = false;

// Set this to true to skip MongoDB entirely and use mock data
const FORCE_MOCK_MODE = false; // Set to true for demo without MongoDB

/**
 * Connect to MongoDB database
 * Uses in-memory MongoDB if local MongoDB is not available
 * Falls back to mock data mode if in-memory fails
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  // If forcing mock mode, skip all database connections
  if (FORCE_MOCK_MODE) {
    console.log(`⚡ Starting in MOCK DATA mode (no database required)`);
    isInMemory = false;
    useMockData = true;
    console.log(`✅ Server running in MOCK DATA mode`);
    console.log(`📝 API will return sample data without database`);
    return;
  }

  try {
    // First try connecting to MongoDB (local or Atlas)
    console.log('🔗 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds for Atlas
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    isInMemory = false;
    useMockData = false;
  } catch (error) {
    console.log(`⚠️ Local MongoDB not available. Starting in-memory MongoDB...`);
    
    try {
      // Clean up any existing connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      
      // Start in-memory MongoDB server with explicit configuration
      // Use older, smaller MongoDB version to reduce download size
      mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'projectmanagement',
        },
        binary: {
          version: '5.0.19', // Smaller download than 6.x
          checkMD5: false, // Skip MD5 check for faster startup
        },
      });
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      
      console.log(`✅ In-Memory MongoDB Connected: ${conn.connection.host}`);
      console.log(`📝 Note: Data will not persist after server restart`);
      isInMemory = true;
      useMockData = false;
      
      // Auto-seed data for in-memory database
      await seedInMemoryData();
    } catch (memError) {
      console.error(`❌ MongoDB Memory Server Error: ${memError.message}`);
      console.log(`⚠️ Falling back to mock data mode...`);
      
      // Enable mock data mode instead of crashing
      isInMemory = false;
      useMockData = true;
      console.log(`✅ Server running in MOCK DATA mode`);
      console.log(`📝 API will return sample data without database`);
    }
  }
};

/**
 * Check if using mock data mode
 */
const isMockDataMode = () => useMockData;

/**
 * Seed sample data for in-memory database
 */
const seedInMemoryData = async () => {
  const Project = require('../models/Project');
  const Task = require('../models/Task');
  const Resource = require('../models/Resource');
  
  // Check if data already exists
  const existingProjects = await Project.countDocuments();
  if (existingProjects > 0) return;
  
  console.log('🌱 Seeding sample data...');
  
  // Helper function for dates
  const getDate = (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };
  
  // Create Resources
  const resources = await Resource.create([
    {
      name: 'John Smith',
      email: 'john.smith@company.com',
      role: 'Senior Developer',
      department: 'Engineering',
      availability: true,
      skills: ['JavaScript', 'React', 'Node.js'],
      hourlyRate: 75,
      maxHoursPerWeek: 40,
      color: '#3B82F6'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'UI/UX Designer',
      department: 'Design',
      availability: true,
      skills: ['Figma', 'Adobe XD', 'CSS'],
      hourlyRate: 65,
      maxHoursPerWeek: 40,
      color: '#EC4899'
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@company.com',
      role: 'Backend Developer',
      department: 'Engineering',
      availability: true,
      skills: ['Python', 'Django', 'PostgreSQL'],
      hourlyRate: 70,
      maxHoursPerWeek: 40,
      color: '#10B981'
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@company.com',
      role: 'Project Manager',
      department: 'Management',
      availability: true,
      skills: ['Agile', 'Scrum', 'JIRA'],
      hourlyRate: 80,
      maxHoursPerWeek: 45,
      color: '#F59E0B'
    }
  ]);
  
  // Create Projects
  const projects = await Project.create([
    {
      name: 'E-Commerce Platform',
      description: 'Modern e-commerce platform with React and Node.js',
      startDate: getDate(-30),
      endDate: getDate(60),
      status: 'In Progress',
      completionPercentage: 45,
      priority: 'High',
      manager: 'Emily Davis',
      budget: 150000,
      tags: ['e-commerce', 'react', 'nodejs'],
      color: '#3B82F6'
    },
    {
      name: 'Mobile App Development',
      description: 'Cross-platform mobile app for iOS and Android',
      startDate: getDate(-15),
      endDate: getDate(90),
      status: 'In Progress',
      completionPercentage: 25,
      priority: 'Critical',
      manager: 'Emily Davis',
      budget: 200000,
      tags: ['mobile', 'react-native'],
      color: '#10B981'
    },
    {
      name: 'API Integration Project',
      description: 'Third-party API integrations and microservices',
      startDate: getDate(-45),
      endDate: getDate(-5),
      status: 'Completed',
      completionPercentage: 100,
      priority: 'High',
      manager: 'Emily Davis',
      budget: 75000,
      tags: ['api', 'integration'],
      color: '#8B5CF6'
    },
    {
      name: 'Analytics Dashboard',
      description: 'Real-time analytics and reporting dashboard',
      startDate: getDate(5),
      endDate: getDate(75),
      status: 'Not Started',
      completionPercentage: 0,
      priority: 'Medium',
      manager: 'Emily Davis',
      budget: 100000,
      tags: ['analytics', 'dashboard'],
      color: '#F59E0B'
    }
  ]);
  
  // Create Tasks
  const tasks = [
    // E-Commerce Tasks
    {
      projectId: projects[0]._id,
      title: 'UI/UX Design Complete',
      description: 'Finalize all UI mockups and prototypes',
      startDate: getDate(-30),
      endDate: getDate(-20),
      status: 'Completed',
      assignedResource: resources[1]._id,
      assignedResourceName: 'Sarah Johnson',
      milestone: true,
      progress: 100,
      priority: 'High',
      order: 1,
      color: '#EC4899'
    },
    {
      projectId: projects[0]._id,
      title: 'Frontend Development',
      description: 'Implement React components',
      startDate: getDate(-19),
      endDate: getDate(10),
      status: 'In Progress',
      assignedResource: resources[0]._id,
      assignedResourceName: 'John Smith',
      progress: 60,
      priority: 'High',
      order: 2,
      color: '#3B82F6'
    },
    {
      projectId: projects[0]._id,
      title: 'Backend API Development',
      description: 'Build REST APIs',
      startDate: getDate(-15),
      endDate: getDate(15),
      status: 'In Progress',
      assignedResource: resources[2]._id,
      assignedResourceName: 'Michael Chen',
      progress: 40,
      priority: 'High',
      order: 3,
      color: '#10B981'
    },
    {
      projectId: projects[0]._id,
      title: 'Payment Integration',
      description: 'Integrate Stripe payment gateway',
      startDate: getDate(16),
      endDate: getDate(30),
      status: 'Not Started',
      assignedResource: resources[2]._id,
      assignedResourceName: 'Michael Chen',
      milestone: true,
      progress: 0,
      priority: 'Critical',
      order: 4,
      color: '#EF4444'
    },
    // Mobile App Tasks
    {
      projectId: projects[1]._id,
      title: 'App Architecture Design',
      description: 'Design app architecture and data flow',
      startDate: getDate(-15),
      endDate: getDate(-10),
      status: 'Completed',
      assignedResource: resources[0]._id,
      assignedResourceName: 'John Smith',
      milestone: true,
      progress: 100,
      priority: 'High',
      order: 1,
      color: '#3B82F6'
    },
    {
      projectId: projects[1]._id,
      title: 'User Authentication',
      description: 'Implement OAuth and JWT authentication',
      startDate: getDate(-9),
      endDate: getDate(5),
      status: 'In Progress',
      assignedResource: resources[0]._id,
      assignedResourceName: 'John Smith',
      progress: 50,
      priority: 'High',
      order: 2,
      color: '#3B82F6'
    },
    {
      projectId: projects[1]._id,
      title: 'Push Notifications',
      description: 'Implement push notification system',
      startDate: getDate(6),
      endDate: getDate(20),
      status: 'Not Started',
      assignedResource: resources[2]._id,
      assignedResourceName: 'Michael Chen',
      progress: 0,
      priority: 'Medium',
      order: 3,
      color: '#10B981'
    },
    // API Project Tasks (Completed)
    {
      projectId: projects[2]._id,
      title: 'API Gateway Setup',
      description: 'Configure API gateway',
      startDate: getDate(-45),
      endDate: getDate(-35),
      status: 'Completed',
      assignedResource: resources[2]._id,
      assignedResourceName: 'Michael Chen',
      milestone: true,
      progress: 100,
      priority: 'High',
      order: 1,
      color: '#10B981'
    },
    {
      projectId: projects[2]._id,
      title: 'Third-party Integrations',
      description: 'Integrate external services',
      startDate: getDate(-34),
      endDate: getDate(-15),
      status: 'Completed',
      assignedResource: resources[2]._id,
      assignedResourceName: 'Michael Chen',
      progress: 100,
      priority: 'High',
      order: 2,
      color: '#10B981'
    },
    {
      projectId: projects[2]._id,
      title: 'Documentation',
      description: 'API documentation and guides',
      startDate: getDate(-14),
      endDate: getDate(-5),
      status: 'Completed',
      assignedResource: resources[3]._id,
      assignedResourceName: 'Emily Davis',
      progress: 100,
      priority: 'Medium',
      order: 3,
      color: '#F59E0B'
    }
  ];
  
  await Task.create(tasks);
  
  console.log('✅ Sample data seeded successfully!');
  console.log(`   - ${resources.length} resources`);
  console.log(`   - ${projects.length} projects`);
  console.log(`   - ${tasks.length} tasks`);
};

/**
 * Get mock data for when database is unavailable
 */
const getMockData = () => {
  const getDate = (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date;
  };

  const resources = [
    { _id: '1', name: 'John Smith', email: 'john@company.com', role: 'Senior Developer', department: 'Engineering', availability: true, skills: ['JavaScript', 'React'], hourlyRate: 75, color: '#3B82F6' },
    { _id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'UI/UX Designer', department: 'Design', availability: true, skills: ['Figma', 'CSS'], hourlyRate: 65, color: '#8B5CF6' },
    { _id: '3', name: 'Michael Chen', email: 'michael@company.com', role: 'Backend Developer', department: 'Engineering', availability: true, skills: ['Node.js', 'MongoDB'], hourlyRate: 70, color: '#10B981' },
    { _id: '4', name: 'Emily Davis', email: 'emily@company.com', role: 'Project Manager', department: 'Management', availability: true, skills: ['Agile', 'Scrum'], hourlyRate: 80, color: '#F59E0B' }
  ];

  const projects = [
    { _id: '1', name: 'Website Redesign', description: 'Modernize company website', startDate: getDate(-30), endDate: getDate(30), status: 'In Progress', priority: 'High', budget: 50000, progress: 45, completionPercentage: 45, manager: 'Emily Davis', color: '#3B82F6' },
    { _id: '2', name: 'Mobile App Development', description: 'Cross-platform mobile app', startDate: getDate(-15), endDate: getDate(60), status: 'In Progress', priority: 'High', budget: 80000, progress: 25, completionPercentage: 25, manager: 'Emily Davis', color: '#8B5CF6' },
    { _id: '3', name: 'API Integration', description: 'Third-party API integrations', startDate: getDate(-45), endDate: getDate(-5), status: 'Completed', priority: 'Medium', budget: 30000, progress: 100, completionPercentage: 100, manager: 'Emily Davis', color: '#10B981' },
    { _id: '4', name: 'Dashboard Analytics', description: 'Analytics dashboard', startDate: getDate(5), endDate: getDate(45), status: 'Not Started', priority: 'Medium', budget: 25000, progress: 0, completionPercentage: 0, manager: 'Emily Davis', color: '#F59E0B' }
  ];

  const tasks = [
    { _id: '1', projectId: '1', title: 'UI Design', description: 'Create wireframes', startDate: getDate(-25), endDate: getDate(-10), status: 'Completed', assignedResource: '2', assignedResourceName: 'Sarah Johnson', progress: 100, priority: 'High', color: '#8B5CF6' },
    { _id: '2', projectId: '1', title: 'Frontend Development', description: 'Implement React components', startDate: getDate(-9), endDate: getDate(10), status: 'In Progress', assignedResource: '1', assignedResourceName: 'John Smith', progress: 60, priority: 'High', color: '#3B82F6' },
    { _id: '3', projectId: '1', title: 'Backend API', description: 'Build REST APIs', startDate: getDate(-5), endDate: getDate(15), status: 'In Progress', assignedResource: '3', assignedResourceName: 'Michael Chen', progress: 40, priority: 'Medium', color: '#10B981' },
    { _id: '4', projectId: '2', title: 'App Architecture', description: 'Design app structure', startDate: getDate(-10), endDate: getDate(5), status: 'In Progress', assignedResource: '1', assignedResourceName: 'John Smith', progress: 70, priority: 'High', color: '#3B82F6' },
    { _id: '5', projectId: '2', title: 'UI Components', description: 'Build reusable components', startDate: getDate(6), endDate: getDate(25), status: 'Not Started', assignedResource: '2', assignedResourceName: 'Sarah Johnson', progress: 0, priority: 'Medium', color: '#8B5CF6' },
    { _id: '6', projectId: '3', title: 'API Gateway Setup', description: 'Configure gateway', startDate: getDate(-45), endDate: getDate(-35), status: 'Completed', assignedResource: '3', assignedResourceName: 'Michael Chen', progress: 100, priority: 'High', color: '#10B981' },
    { _id: '7', projectId: '4', title: 'Requirements Analysis', description: 'Gather requirements', startDate: getDate(5), endDate: getDate(15), status: 'Not Started', assignedResource: '4', assignedResourceName: 'Emily Davis', progress: 0, priority: 'Medium', color: '#F59E0B' }
  ];

  return { projects, tasks, resources };
};

module.exports = { connectDB, isMockDataMode, getMockData };
