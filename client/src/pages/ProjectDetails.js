import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineFlag,
} from 'react-icons/hi';
import { projectAPI, taskAPI, resourceAPI } from '../services/api';
import { Loading, Modal, Badge, ProgressBar, getStatusVariant, getPriorityVariant } from '../components/common';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
    priority: 'Medium',
    assignedResource: '',
    assignedResourceName: '',
    milestone: false,
    progress: 0,
    estimatedHours: 0,
    dependencyTaskId: '',
  });

  // Fetch project and tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectRes, tasksRes, resourcesRes] = await Promise.all([
          projectAPI.getById(id),
          taskAPI.getByProject(id),
          resourceAPI.getAll(),
        ]);
        setProject(projectRes.data.data);
        setTasks(tasksRes.data.data);
        setResources(resourcesRes.data.data);
      } catch (error) {
        toast.error('Failed to load project details');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // Handle task form submission
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...taskFormData,
        projectId: id,
        assignedResourceName: resources.find(r => r._id === taskFormData.assignedResource)?.name || '',
      };

      if (editingTask) {
        const response = await taskAPI.update(editingTask._id, taskData);
        setTasks(tasks.map(t => t._id === editingTask._id ? response.data.data : t));
        toast.success('Task updated successfully');
      } else {
        const response = await taskAPI.create(taskData);
        setTasks([...tasks, response.data.data]);
        toast.success('Task created successfully');
      }
      
      // Refresh project data to get updated completion
      const projectRes = await projectAPI.getById(id);
      setProject(projectRes.data.data);
      
      closeTaskModal();
    } catch (error) {
      toast.error(error.error || 'Failed to save task');
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskAPI.delete(taskId);
        setTasks(tasks.filter(t => t._id !== taskId));
        
        // Refresh project data
        const projectRes = await projectAPI.getById(id);
        setProject(projectRes.data.data);
        
        toast.success('Task deleted successfully');
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  // Open task modal for editing
  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description || '',
      startDate: task.startDate.split('T')[0],
      endDate: task.endDate.split('T')[0],
      status: task.status,
      priority: task.priority,
      assignedResource: task.assignedResource?._id || '',
      assignedResourceName: task.assignedResourceName || '',
      milestone: task.milestone,
      progress: task.progress,
      estimatedHours: task.estimatedHours || 0,
      dependencyTaskId: task.dependencyTaskId?._id || '',
    });
    setIsTaskModalOpen(true);
  };

  // Open task modal for new task
  const openNewTaskModal = () => {
    setEditingTask(null);
    setTaskFormData({
      title: '',
      description: '',
      startDate: project?.startDate.split('T')[0] || new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Not Started',
      priority: 'Medium',
      assignedResource: '',
      assignedResourceName: '',
      milestone: false,
      progress: 0,
      estimatedHours: 0,
      dependencyTaskId: '',
    });
    setIsTaskModalOpen(true);
  };

  // Close task modal
  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  // Update task progress
  const updateTaskProgress = async (taskId, newProgress) => {
    try {
      const response = await taskAPI.update(taskId, { progress: newProgress });
      setTasks(tasks.map(t => t._id === taskId ? response.data.data : t));
      
      // Refresh project data
      const projectRes = await projectAPI.getById(id);
      setProject(projectRes.data.data);
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  if (loading) {
    return <Loading text="Loading project details..." />;
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-details-page">
      {/* Back Button */}
      <Link to="/projects" className="back-link">
        <HiOutlineArrowLeft /> Back to Projects
      </Link>

      {/* Project Header */}
      <div className="project-header">
        <div className="project-header-content">
          <div className="project-title-row">
            <h1>{project.name}</h1>
            <Badge variant={getStatusVariant(project.status)} size="large">
              {project.status}
            </Badge>
          </div>
          <p className="project-description">{project.description || 'No description provided'}</p>
        </div>
        <div className="project-header-actions">
          <Link to={`/gantt/${project._id}`} className="btn btn-secondary">
            <HiOutlineCalendar /> View Gantt Chart
          </Link>
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="project-info-grid">
        <div className="info-card">
          <div className="info-icon">
            <HiOutlineCalendar />
          </div>
          <div className="info-content">
            <span className="info-label">Timeline</span>
            <span className="info-value">
              {format(new Date(project.startDate), 'MMM d, yyyy')} - {format(new Date(project.endDate), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon priority">
            <HiOutlineFlag />
          </div>
          <div className="info-content">
            <span className="info-label">Priority</span>
            <Badge variant={getPriorityVariant(project.priority)}>{project.priority}</Badge>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon manager">
            <HiOutlineUser />
          </div>
          <div className="info-content">
            <span className="info-label">Project Manager</span>
            <span className="info-value">{project.manager || 'Not assigned'}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon clock">
            <HiOutlineClock />
          </div>
          <div className="info-content">
            <span className="info-label">Progress</span>
            <div className="progress-info">
              <span className="progress-value">{project.completionPercentage}%</span>
              <ProgressBar value={project.completionPercentage} showLabel={false} size="small" color="dynamic" />
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="tasks-section">
        <div className="section-header">
          <h2>Tasks ({tasks.length})</h2>
          <button className="btn btn-primary" onClick={openNewTaskModal}>
            <HiOutlinePlus /> Add Task
          </button>
        </div>

        {tasks.length > 0 ? (
          <div className="tasks-list">
            {tasks.map((task) => (
              <div key={task._id} className={`task-card ${task.milestone ? 'milestone' : ''}`}>
                <div className="task-card-main">
                  <div className="task-info">
                    <div className="task-title-row">
                      <h4 className="task-title">
                        {task.milestone && <HiOutlineFlag className="milestone-icon" />}
                        {task.title}
                      </h4>
                      <Badge variant={getStatusVariant(task.status)} size="small">
                        {task.status}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <div className="task-meta">
                      <span className="meta-item">
                        <HiOutlineCalendar />
                        {format(new Date(task.startDate), 'MMM d')} - {format(new Date(task.endDate), 'MMM d')}
                      </span>
                      {task.assignedResourceName && (
                        <span className="meta-item">
                          <HiOutlineUser />
                          {task.assignedResourceName}
                        </span>
                      )}
                      {task.dependencyTaskId && (
                        <span className="meta-item dependency">
                          Depends on: {tasks.find(t => t._id === task.dependencyTaskId?._id || t._id === task.dependencyTaskId)?.title || 'Task'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="task-progress-section">
                    <div className="progress-label">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => updateTaskProgress(task._id, parseInt(e.target.value))}
                      className="progress-slider"
                    />
                  </div>

                  <div className="task-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => openEditTaskModal(task)}
                      title="Edit Task"
                    >
                      <HiOutlinePencil />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteTask(task._id)}
                      title="Delete Task"
                    >
                      <HiOutlineTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-tasks">
            <p>No tasks yet. Add your first task to get started.</p>
            <button className="btn btn-primary" onClick={openNewTaskModal}>
              <HiOutlinePlus /> Add Task
            </button>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        size="medium"
      >
        <form onSubmit={handleTaskSubmit} className="task-form">
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
              className="form-input"
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              className="form-input"
              rows={2}
              placeholder="Enter task description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                value={taskFormData.startDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, startDate: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                value={taskFormData.endDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, endDate: e.target.value })}
                className="form-input"
                required
                min={taskFormData.startDate}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={taskFormData.status}
                onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                className="form-input"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                className="form-input"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assigned Resource</label>
              <select
                value={taskFormData.assignedResource}
                onChange={(e) => setTaskFormData({ ...taskFormData, assignedResource: e.target.value })}
                className="form-input"
              >
                <option value="">Select resource...</option>
                {resources.map((resource) => (
                  <option key={resource._id} value={resource._id}>
                    {resource.name} ({resource.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Depends On</label>
              <select
                value={taskFormData.dependencyTaskId}
                onChange={(e) => setTaskFormData({ ...taskFormData, dependencyTaskId: e.target.value })}
                className="form-input"
              >
                <option value="">No dependency</option>
                {tasks
                  .filter(t => t._id !== editingTask?._id)
                  .map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Estimated Hours</label>
              <input
                type="number"
                value={taskFormData.estimatedHours}
                onChange={(e) => setTaskFormData({ ...taskFormData, estimatedHours: Number(e.target.value) })}
                className="form-input"
                min={0}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Progress (%)</label>
              <input
                type="number"
                value={taskFormData.progress}
                onChange={(e) => setTaskFormData({ ...taskFormData, progress: Math.min(100, Math.max(0, Number(e.target.value))) })}
                className="form-input"
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={taskFormData.milestone}
                onChange={(e) => setTaskFormData({ ...taskFormData, milestone: e.target.checked })}
              />
              <span>Mark as Milestone</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeTaskModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
