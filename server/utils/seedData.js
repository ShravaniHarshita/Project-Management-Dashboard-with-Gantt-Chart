require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Resource = require('../models/Resource');
const User = require('../models/User');

/**
 * Seed data for development and testing
 */

const resources = [
  {
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Senior Developer',
    department: 'Engineering',
    availability: true,
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
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
    skills: ['Figma', 'Adobe XD', 'CSS', 'User Research'],
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
    skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
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
    skills: ['Agile', 'Scrum', 'JIRA', 'Communication'],
    hourlyRate: 80,
    maxHoursPerWeek: 45,
    color: '#F59E0B'
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@company.com',
    role: 'DevOps Engineer',
    department: 'Engineering',
    availability: true,
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Linux'],
    hourlyRate: 85,
    maxHoursPerWeek: 40,
    color: '#8B5CF6'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    role: 'QA Engineer',
    department: 'Quality Assurance',
    availability: true,
    skills: ['Selenium', 'Jest', 'Manual Testing', 'Test Planning'],
    hourlyRate: 55,
    maxHoursPerWeek: 40,
    color: '#06B6D4'
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@projectdash.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Regular User',
    email: 'user@projectdash.com',
    password: 'user123',
    role: 'user'
  }
];

// Function to create dates relative to today
const getDate = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Resource.deleteMany({});
    await User.deleteMany({});

    // Create users
    console.log('👤 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`   ✅ Created ${createdUsers.length} users`);

    // Create resources
    console.log('👥 Creating resources...');
    const createdResources = await Resource.create(resources);
    console.log(`   ✅ Created ${createdResources.length} resources`);

    // Create projects
    console.log('📁 Creating projects...');
    const projects = [
      {
        name: 'E-Commerce Platform Redesign',
        description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX and improved performance.',
        startDate: getDate(-30),
        endDate: getDate(60),
        status: 'In Progress',
        completionPercentage: 45,
        priority: 'High',
        manager: 'Emily Davis',
        budget: 150000,
        tags: ['redesign', 'e-commerce', 'frontend'],
        color: '#3B82F6'
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms with real-time synchronization.',
        startDate: getDate(-15),
        endDate: getDate(90),
        status: 'In Progress',
        completionPercentage: 25,
        priority: 'Critical',
        manager: 'Emily Davis',
        budget: 200000,
        tags: ['mobile', 'ios', 'android'],
        color: '#10B981'
      },
      {
        name: 'API Gateway Implementation',
        description: 'Implementing a centralized API gateway for microservices architecture.',
        startDate: getDate(-45),
        endDate: getDate(-5),
        status: 'Completed',
        completionPercentage: 100,
        priority: 'High',
        manager: 'David Wilson',
        budget: 75000,
        tags: ['api', 'backend', 'microservices'],
        color: '#8B5CF6'
      },
      {
        name: 'Data Analytics Dashboard',
        description: 'Building a comprehensive analytics dashboard with real-time data visualization.',
        startDate: getDate(5),
        endDate: getDate(75),
        status: 'Not Started',
        completionPercentage: 0,
        priority: 'Medium',
        manager: 'Emily Davis',
        budget: 100000,
        tags: ['analytics', 'dashboard', 'visualization'],
        color: '#F59E0B'
      },
      {
        name: 'Security Audit & Enhancement',
        description: 'Comprehensive security audit and implementation of enhanced security measures.',
        startDate: getDate(-60),
        endDate: getDate(-10),
        status: 'Delayed',
        completionPercentage: 80,
        priority: 'Critical',
        manager: 'David Wilson',
        budget: 50000,
        tags: ['security', 'audit', 'compliance'],
        color: '#EF4444'
      },
      {
        name: 'Customer Support Portal',
        description: 'Self-service customer support portal with ticketing system and knowledge base.',
        startDate: getDate(-20),
        endDate: getDate(40),
        status: 'In Progress',
        completionPercentage: 35,
        priority: 'Medium',
        manager: 'Emily Davis',
        budget: 80000,
        tags: ['support', 'portal', 'ticketing'],
        color: '#06B6D4'
      }
    ];

    const createdProjects = await Project.create(projects);
    console.log(`   ✅ Created ${createdProjects.length} projects`);

    // Create tasks for each project
    console.log('📋 Creating tasks...');
    let totalTasks = 0;

    // E-Commerce Platform Tasks
    const ecommerceProject = createdProjects[0];
    const ecommerceTasks = [
      {
        projectId: ecommerceProject._id,
        title: 'Requirements Analysis',
        description: 'Gather and document all requirements from stakeholders',
        startDate: getDate(-30),
        endDate: getDate(-25),
        status: 'Completed',
        assignedResource: createdResources[3]._id,
        assignedResourceName: 'Emily Davis',
        milestone: true,
        progress: 100,
        priority: 'High',
        estimatedHours: 20,
        order: 1,
        color: '#3B82F6'
      },
      {
        projectId: ecommerceProject._id,
        title: 'UI/UX Design',
        description: 'Create wireframes and high-fidelity mockups',
        startDate: getDate(-24),
        endDate: getDate(-10),
        status: 'Completed',
        assignedResource: createdResources[1]._id,
        assignedResourceName: 'Sarah Johnson',
        milestone: false,
        progress: 100,
        priority: 'High',
        estimatedHours: 60,
        order: 2,
        color: '#EC4899'
      },
      {
        projectId: ecommerceProject._id,
        title: 'Frontend Development',
        description: 'Implement React components based on designs',
        startDate: getDate(-9),
        endDate: getDate(20),
        status: 'In Progress',
        assignedResource: createdResources[0]._id,
        assignedResourceName: 'John Smith',
        milestone: false,
        progress: 60,
        priority: 'High',
        estimatedHours: 120,
        order: 3,
        color: '#3B82F6'
      },
      {
        projectId: ecommerceProject._id,
        title: 'Backend API Development',
        description: 'Build RESTful APIs for the platform',
        startDate: getDate(-9),
        endDate: getDate(15),
        status: 'In Progress',
        assignedResource: createdResources[2]._id,
        assignedResourceName: 'Michael Chen',
        milestone: false,
        progress: 40,
        priority: 'High',
        estimatedHours: 100,
        order: 4,
        color: '#10B981'
      },
      {
        projectId: ecommerceProject._id,
        title: 'Payment Integration',
        description: 'Integrate Stripe and PayPal payment gateways',
        startDate: getDate(16),
        endDate: getDate(30),
        status: 'Not Started',
        assignedResource: createdResources[2]._id,
        assignedResourceName: 'Michael Chen',
        milestone: true,
        progress: 0,
        priority: 'Critical',
        estimatedHours: 40,
        order: 5,
        color: '#10B981'
      },
      {
        projectId: ecommerceProject._id,
        title: 'Testing & QA',
        description: 'Comprehensive testing and bug fixes',
        startDate: getDate(31),
        endDate: getDate(50),
        status: 'Not Started',
        assignedResource: createdResources[5]._id,
        assignedResourceName: 'Lisa Anderson',
        milestone: false,
        progress: 0,
        priority: 'High',
        estimatedHours: 60,
        order: 6,
        color: '#06B6D4'
      },
      {
        projectId: ecommerceProject._id,
        title: 'Deployment',
        description: 'Deploy to production environment',
        startDate: getDate(51),
        endDate: getDate(60),
        status: 'Not Started',
        assignedResource: createdResources[4]._id,
        assignedResourceName: 'David Wilson',
        milestone: true,
        progress: 0,
        priority: 'High',
        estimatedHours: 20,
        order: 7,
        color: '#8B5CF6'
      }
    ];

    // Mobile App Tasks
    const mobileProject = createdProjects[1];
    const mobileTasks = [
      {
        projectId: mobileProject._id,
        title: 'Project Setup & Architecture',
        description: 'Set up React Native project and define architecture',
        startDate: getDate(-15),
        endDate: getDate(-10),
        status: 'Completed',
        assignedResource: createdResources[0]._id,
        assignedResourceName: 'John Smith',
        milestone: false,
        progress: 100,
        priority: 'High',
        estimatedHours: 16,
        order: 1,
        color: '#10B981'
      },
      {
        projectId: mobileProject._id,
        title: 'UI Component Library',
        description: 'Build reusable UI components',
        startDate: getDate(-9),
        endDate: getDate(5),
        status: 'In Progress',
        assignedResource: createdResources[1]._id,
        assignedResourceName: 'Sarah Johnson',
        milestone: false,
        progress: 70,
        priority: 'High',
        estimatedHours: 40,
        order: 2,
        color: '#EC4899'
      },
      {
        projectId: mobileProject._id,
        title: 'Authentication Module',
        description: 'Implement user authentication and authorization',
        startDate: getDate(6),
        endDate: getDate(20),
        status: 'Not Started',
        assignedResource: createdResources[0]._id,
        assignedResourceName: 'John Smith',
        milestone: true,
        progress: 0,
        priority: 'Critical',
        estimatedHours: 30,
        order: 3,
        color: '#3B82F6'
      },
      {
        projectId: mobileProject._id,
        title: 'Offline Sync Feature',
        description: 'Implement offline data synchronization',
        startDate: getDate(21),
        endDate: getDate(45),
        status: 'Not Started',
        assignedResource: createdResources[2]._id,
        assignedResourceName: 'Michael Chen',
        milestone: false,
        progress: 0,
        priority: 'High',
        estimatedHours: 50,
        order: 4,
        color: '#10B981'
      },
      {
        projectId: mobileProject._id,
        title: 'Push Notifications',
        description: 'Integrate push notification service',
        startDate: getDate(46),
        endDate: getDate(60),
        status: 'Not Started',
        assignedResource: createdResources[0]._id,
        assignedResourceName: 'John Smith',
        milestone: false,
        progress: 0,
        priority: 'Medium',
        estimatedHours: 24,
        order: 5,
        color: '#3B82F6'
      },
      {
        projectId: mobileProject._id,
        title: 'App Store Submission',
        description: 'Prepare and submit to app stores',
        startDate: getDate(80),
        endDate: getDate(90),
        status: 'Not Started',
        assignedResource: createdResources[4]._id,
        assignedResourceName: 'David Wilson',
        milestone: true,
        progress: 0,
        priority: 'High',
        estimatedHours: 16,
        order: 6,
        color: '#8B5CF6'
      }
    ];

    // API Gateway Tasks (Completed Project)
    const apiProject = createdProjects[2];
    const apiTasks = [
      {
        projectId: apiProject._id,
        title: 'Architecture Design',
        description: 'Design API gateway architecture',
        startDate: getDate(-45),
        endDate: getDate(-40),
        status: 'Completed',
        assignedResource: createdResources[2]._id,
        assignedResourceName: 'Michael Chen',
        milestone: true,
        progress: 100,
        priority: 'High',
        estimatedHours: 16,
        order: 1,
        color: '#8B5CF6'
      },
      {
        projectId: apiProject._id,
        title: 'Gateway Implementation',
        description: 'Implement Kong API gateway',
        startDate: getDate(-39),
        endDate: getDate(-20),
        status: 'Completed',
        assignedResource: createdResources[4]._id,
        assignedResourceName: 'David Wilson',
        milestone: false,
        progress: 100,
        priority: 'High',
        estimatedHours: 60,
        order: 2,
        color: '#8B5CF6'
      },
      {
        projectId: apiProject._id,
        title: 'Rate Limiting & Security',
        description: 'Configure rate limiting and security policies',
        startDate: getDate(-19),
        endDate: getDate(-10),
        status: 'Completed',
        assignedResource: createdResources[4]._id,
        assignedResourceName: 'David Wilson',
        milestone: false,
        progress: 100,
        priority: 'Critical',
        estimatedHours: 30,
        order: 3,
        color: '#8B5CF6'
      },
      {
        projectId: apiProject._id,
        title: 'Documentation & Training',
        description: 'Create documentation and train team',
        startDate: getDate(-9),
        endDate: getDate(-5),
        status: 'Completed',
        assignedResource: createdResources[3]._id,
        assignedResourceName: 'Emily Davis',
        milestone: true,
        progress: 100,
        priority: 'Medium',
        estimatedHours: 16,
        order: 4,
        color: '#F59E0B'
      }
    ];

    // Customer Support Portal Tasks
    const supportProject = createdProjects[5];
    const supportTasks = [
      {
        projectId: supportProject._id,
        title: 'Database Schema Design',
        description: 'Design database schema for ticketing system',
        startDate: getDate(-20),
        endDate: getDate(-15),
        status: 'Completed',
        assignedResource: createdResources[2]._id,
        assignedResourceName: 'Michael Chen',
        milestone: false,
        progress: 100,
        priority: 'High',
        estimatedHours: 16,
        order: 1,
        color: '#06B6D4'
      },
      {
        projectId: supportProject._id,
        title: 'Ticket Management System',
        description: 'Build core ticket CRUD functionality',
        startDate: getDate(-14),
        endDate: getDate(5),
        status: 'In Progress',
        assignedResource: createdResources[0]._id,
        assignedResourceName: 'John Smith',
        milestone: false,
        progress: 50,
        priority: 'High',
        estimatedHours: 50,
        order: 2,
        color: '#3B82F6'
      },
      {
        projectId: supportProject._id,
        title: 'Knowledge Base Module',
        description: 'Implement searchable knowledge base',
        startDate: getDate(6),
        endDate: getDate(25),
        status: 'Not Started',
        assignedResource: createdResources[0]._id,
        assignedResourceName: 'John Smith',
        milestone: true,
        progress: 0,
        priority: 'Medium',
        estimatedHours: 40,
        order: 3,
        color: '#3B82F6'
      },
      {
        projectId: supportProject._id,
        title: 'Live Chat Integration',
        description: 'Integrate real-time chat support',
        startDate: getDate(26),
        endDate: getDate(40),
        status: 'Not Started',
        assignedResource: createdResources[2]._id,
        assignedResourceName: 'Michael Chen',
        milestone: false,
        progress: 0,
        priority: 'High',
        estimatedHours: 35,
        order: 4,
        color: '#10B981'
      }
    ];

    // Add dependencies
    ecommerceTasks[2].dependencyTaskId = null; // Will be set after creation
    mobileTasks[2].dependencyTaskId = null;

    // Create all tasks
    const allTasks = [...ecommerceTasks, ...mobileTasks, ...apiTasks, ...supportTasks];
    const createdTasks = await Task.create(allTasks);
    totalTasks = createdTasks.length;

    // Update dependencies (UI Development depends on UI/UX Design)
    const uiDesignTask = createdTasks.find(t => t.title === 'UI/UX Design' && t.projectId.toString() === ecommerceProject._id.toString());
    const frontendTask = createdTasks.find(t => t.title === 'Frontend Development' && t.projectId.toString() === ecommerceProject._id.toString());
    if (uiDesignTask && frontendTask) {
      await Task.findByIdAndUpdate(frontendTask._id, { dependencyTaskId: uiDesignTask._id });
    }

    // Backend depends on Requirements
    const reqTask = createdTasks.find(t => t.title === 'Requirements Analysis');
    const backendTask = createdTasks.find(t => t.title === 'Backend API Development' && t.projectId.toString() === ecommerceProject._id.toString());
    if (reqTask && backendTask) {
      await Task.findByIdAndUpdate(backendTask._id, { dependencyTaskId: reqTask._id });
    }

    // Payment depends on Backend
    const paymentTask = createdTasks.find(t => t.title === 'Payment Integration');
    if (backendTask && paymentTask) {
      await Task.findByIdAndUpdate(paymentTask._id, { dependencyTaskId: backendTask._id });
    }

    console.log(`   ✅ Created ${totalTasks} tasks`);

    // Update project completion percentages
    console.log('📊 Updating project statistics...');
    for (const project of createdProjects) {
      await Task.updateProjectCompletion(project._id);
    }

    console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   ✅ Database seeded successfully!                        ║
  ║                                                           ║
  ║   📊 Summary:                                              ║
  ║   • ${createdUsers.length} Users                                           ║
  ║   • ${createdResources.length} Resources                                       ║
  ║   • ${createdProjects.length} Projects                                         ║
  ║   • ${totalTasks} Tasks                                            ║
  ║                                                           ║
  ║   🔐 Login Credentials:                                   ║
  ║   Admin: admin@projectdash.com / admin123                 ║
  ║   User:  user@projectdash.com / user123                   ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
