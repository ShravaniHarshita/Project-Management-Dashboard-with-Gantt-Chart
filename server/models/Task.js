const mongoose = require('mongoose');

/**
 * Task Schema
 * Represents individual tasks within a project
 */
const TaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Delayed'],
    default: 'Not Started'
  },
  dependencyTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
    set: v => (v === '' || v === null || v === undefined) ? null : v
  },
  assignedResource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    default: null,
    set: v => (v === '' || v === null || v === undefined) ? null : v
  },
  assignedResourceName: {
    type: String,
    trim: true
  },
  milestone: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration in days
TaskSchema.virtual('duration').get(function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.endDate < today && this.status !== 'Completed';
});

// Pre-save middleware to check if task should be marked as delayed
TaskSchema.pre('save', function(next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.endDate < today && this.status !== 'Completed') {
    this.status = 'Delayed';
  }
  
  // Auto-update status based on progress
  if (this.progress === 100 && this.status !== 'Completed') {
    this.status = 'Completed';
  } else if (this.progress > 0 && this.progress < 100 && this.status === 'Not Started') {
    this.status = 'In Progress';
  }
  
  next();
});

// Post-save middleware to update project completion percentage
TaskSchema.post('save', async function() {
  await this.constructor.updateProjectCompletion(this.projectId);
});

// Post-remove middleware to update project completion percentage
TaskSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await mongoose.model('Task').updateProjectCompletion(doc.projectId);
  }
});

// Static method to calculate and update project completion percentage
TaskSchema.statics.updateProjectCompletion = async function(projectId) {
  const Project = mongoose.model('Project');
  
  const tasks = await this.find({ projectId });
  
  if (tasks.length === 0) {
    await Project.findByIdAndUpdate(projectId, { 
      completionPercentage: 0,
      status: 'Not Started'
    });
    return;
  }
  
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
  const completionPercentage = Math.round(totalProgress / tasks.length);
  
  // Determine project status based on tasks
  let projectStatus = 'In Progress';
  const allCompleted = tasks.every(task => task.status === 'Completed');
  const anyDelayed = tasks.some(task => task.status === 'Delayed');
  const allNotStarted = tasks.every(task => task.status === 'Not Started');
  
  if (allCompleted) {
    projectStatus = 'Completed';
  } else if (anyDelayed) {
    projectStatus = 'Delayed';
  } else if (allNotStarted) {
    projectStatus = 'Not Started';
  }
  
  await Project.findByIdAndUpdate(projectId, { 
    completionPercentage,
    status: projectStatus
  });
};

// Indexes for better query performance
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ assignedResource: 1 });
TaskSchema.index({ startDate: 1, endDate: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', TaskSchema);
