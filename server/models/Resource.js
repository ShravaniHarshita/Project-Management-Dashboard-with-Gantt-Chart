const mongoose = require('mongoose');

/**
 * Resource Schema
 * Represents team members/resources that can be assigned to tasks
 */
const ResourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [50, 'Role cannot exceed 50 characters']
  },
  department: {
    type: String,
    trim: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    min: 0,
    default: 0
  },
  maxHoursPerWeek: {
    type: Number,
    min: 0,
    max: 168,
    default: 40
  },
  currentWorkload: {
    type: Number,
    min: 0,
    default: 0
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    trim: true
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

// Virtual for utilization percentage
ResourceSchema.virtual('utilizationPercentage').get(function() {
  if (this.maxHoursPerWeek === 0) return 0;
  return Math.round((this.currentWorkload / this.maxHoursPerWeek) * 100);
});

// Virtual for availability status text
ResourceSchema.virtual('availabilityStatus').get(function() {
  if (!this.availability) return 'Unavailable';
  if (this.utilizationPercentage >= 100) return 'Fully Allocated';
  if (this.utilizationPercentage >= 80) return 'Nearly Full';
  return 'Available';
});

// Static method to calculate resource utilization
ResourceSchema.statics.calculateUtilization = async function(resourceId) {
  const Task = mongoose.model('Task');
  
  const tasks = await Task.find({ 
    assignedResource: resourceId,
    status: { $in: ['Not Started', 'In Progress'] }
  });
  
  const totalHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
  
  await this.findByIdAndUpdate(resourceId, { currentWorkload: totalHours });
  
  return totalHours;
};

// Indexes for better query performance
ResourceSchema.index({ name: 1 });
ResourceSchema.index({ availability: 1 });
ResourceSchema.index({ role: 1 });
ResourceSchema.index({ name: 'text', role: 'text', department: 'text' });

module.exports = mongoose.model('Resource', ResourceSchema);
