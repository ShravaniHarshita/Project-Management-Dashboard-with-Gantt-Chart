import React, { useEffect, useState } from 'react';
import {
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineFlag,
  HiOutlineFolder,
  HiPlus,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Loading, Badge, ProgressBar, Modal, getStatusVariant, getPriorityVariant } from '../components/common';
import { format } from 'date-fns';
import './Tasks.css';

const Tasks = () => {
  const { tasks, projects, resources, loading, fetchTasks, fetchProjects, fetchResources, createTask, updateTask } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [sortBy, setSortBy] = useState('endDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Not Started',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    progress: 0,
  });

  // Fetch data on mount
  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle add task form submit
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.projectId) {
      return;
    }
    try {
      await createTask({
        ...newTask,
        assignedTo: newTask.assignedTo || null,
      });
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        projectId: '',
        assignedTo: '',
        priority: 'Medium',
        status: 'Not Started',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        progress: 0,
      });
    } catch (error) {
      // Error is handled by context
    }
  };

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      const matchesProject = !projectFilter || 
        (task.projectId?._id === projectFilter || task.projectId === projectFilter);
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'startDate':
          comparison = new Date(a.startDate) - new Date(b.startDate);
          break;
        case 'endDate':
          comparison = new Date(a.endDate) - new Date(b.endDate);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'priority':
          const priorityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        default:
          comparison = new Date(a.endDate) - new Date(b.endDate);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get project name
  const getProjectName = (task) => {
    if (task.projectId?.name) {
      return task.projectId.name;
    }
    const project = projects.find(p => p._id === task.projectId);
    return project?.name || 'Unknown Project';
  };

  // Get project ID
  const getProjectId = (task) => {
    return task.projectId?._id || task.projectId;
  };

  // Update task progress inline
  // eslint-disable-next-line no-unused-vars
  const handleProgressChange = async (taskId, newProgress) => {
    try {
      await updateTask(taskId, { progress: newProgress });
    } catch (error) {
      console.error('Failed to update progress');
    }
  };

  // Group tasks by status for Kanban-like view
  const tasksByStatus = {
    'Not Started': filteredTasks.filter(t => t.status === 'Not Started'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Completed': filteredTasks.filter(t => t.status === 'Completed'),
    'Delayed': filteredTasks.filter(t => t.status === 'Delayed'),
  };

  // View mode
  const [viewMode, setViewMode] = useState('list');

  if (loading.tasks && tasks.length === 0) {
    return <Loading text="Loading tasks..." />;
  }

  return (
    <div className="tasks-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1><HiOutlineClipboardList /> All Tasks</h1>
          <p>View and manage tasks across all projects</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <HiPlus /> Add Task
          </button>
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Board
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="task-stats">
        <div className="stat-item">
          <span className="stat-count">{tasks.length}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item not-started">
          <span className="stat-count">{tasks.filter(t => t.status === 'Not Started').length}</span>
          <span className="stat-label">Not Started</span>
        </div>
        <div className="stat-item in-progress">
          <span className="stat-count">{tasks.filter(t => t.status === 'In Progress').length}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item completed">
          <span className="stat-count">{tasks.filter(t => t.status === 'Completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item delayed">
          <span className="stat-count">{tasks.filter(t => t.status === 'Delayed').length}</span>
          <span className="stat-label">Delayed</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-row">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>{project.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Delayed">Delayed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="filter-select"
          >
            <option value="endDate-asc">Due Date (Earliest)</option>
            <option value="endDate-desc">Due Date (Latest)</option>
            <option value="startDate-asc">Start Date (Earliest)</option>
            <option value="startDate-desc">Start Date (Latest)</option>
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="priority-asc">Priority (Low to High)</option>
            <option value="progress-desc">Progress (High to Low)</option>
            <option value="progress-asc">Progress (Low to High)</option>
            <option value="title-asc">Name (A-Z)</option>
            <option value="title-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Tasks Display */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="tasks-list-view">
          {filteredTasks.length > 0 ? (
            <div className="tasks-table">
              <div className="table-header">
                <div className="th-task">Task</div>
                <div className="th-project">Project</div>
                <div className="th-dates">Dates</div>
                <div className="th-assignee">Assignee</div>
                <div className="th-progress">Progress</div>
                <div className="th-status">Status</div>
                <div className="th-priority">Priority</div>
              </div>
              {filteredTasks.map((task) => (
                <div key={task._id} className="table-row">
                  <div className="td-task">
                    <Link to={`/projects/${getProjectId(task)}`} className="task-link">
                      {task.milestone && <HiOutlineFlag className="milestone-icon" />}
                      {task.title}
                    </Link>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                  </div>
                  <div className="td-project">
                    <Link to={`/projects/${getProjectId(task)}`} className="project-link">
                      <HiOutlineFolder />
                      {getProjectName(task)}
                    </Link>
                  </div>
                  <div className="td-dates">
                    <span className="date-range">
                      <HiOutlineCalendar />
                      {task.startDate ? format(new Date(task.startDate), 'MMM d') : 'TBD'} - {task.endDate ? format(new Date(task.endDate), 'MMM d') : 'TBD'}
                    </span>
                  </div>
                  <div className="td-assignee">
                    {task.assignedResourceName ? (
                      <span className="assignee">
                        <HiOutlineUser />
                        {task.assignedResourceName}
                      </span>
                    ) : (
                      <span className="unassigned">Unassigned</span>
                    )}
                  </div>
                  <div className="td-progress">
                    <div className="progress-cell">
                      <span className="progress-value">{task.progress}%</span>
                      <ProgressBar 
                        value={task.progress} 
                        showLabel={false} 
                        size="small" 
                        color="dynamic"
                      />
                    </div>
                  </div>
                  <div className="td-status">
                    <Badge variant={getStatusVariant(task.status)} size="small">
                      {task.status}
                    </Badge>
                  </div>
                  <div className="td-priority">
                    <Badge variant={getPriorityVariant(task.priority)} size="small">
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <HiOutlineClipboardList className="empty-icon" />
              <h3>No tasks found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="kanban-view">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className={`kanban-column ${status.toLowerCase().replace(' ', '-')}`}>
              <div className="column-header">
                <h3>{status}</h3>
                <span className="task-count">{statusTasks.length}</span>
              </div>
              <div className="column-content">
                {statusTasks.map((task) => (
                  <Link 
                    to={`/projects/${getProjectId(task)}`} 
                    key={task._id} 
                    className="kanban-card"
                  >
                    <div className="card-header">
                      <Badge variant={getPriorityVariant(task.priority)} size="small">
                        {task.priority}
                      </Badge>
                      {task.milestone && <HiOutlineFlag className="milestone-flag" />}
                    </div>
                    <h4 className="card-title">{task.title}</h4>
                    <p className="card-project">{getProjectName(task)}</p>
                    <div className="card-meta">
                      <span className="meta-item">
                        <HiOutlineCalendar />
                        {task.endDate ? format(new Date(task.endDate), 'MMM d') : 'TBD'}
                      </span>
                      {task.assignedResourceName && (
                        <span className="meta-item">
                          <HiOutlineUser />
                          {task.assignedResourceName}
                        </span>
                      )}
                    </div>
                    <div className="card-progress">
                      <ProgressBar 
                        value={task.progress} 
                        showLabel={false} 
                        size="small" 
                        color="dynamic"
                      />
                      <span>{task.progress}%</span>
                    </div>
                  </Link>
                ))}
                {statusTasks.length === 0 && (
                  <div className="empty-column">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Task"
        size="medium"
      >
        <form onSubmit={handleAddTask} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="projectId">Project *</label>
              <select
                id="projectId"
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                required
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo">Assign To</label>
              <select
                id="assignedTo"
                value={newTask.assignedTo}
                onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {resources.map((resource) => (
                  <option key={resource._id} value={resource._id}>
                    {resource.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={newTask.status}
                onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="progress">Progress: {newTask.progress}%</label>
            <input
              type="range"
              id="progress"
              min="0"
              max="100"
              value={newTask.progress}
              onChange={(e) => setNewTask({ ...newTask, progress: parseInt(e.target.value) })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <HiPlus /> Add Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
