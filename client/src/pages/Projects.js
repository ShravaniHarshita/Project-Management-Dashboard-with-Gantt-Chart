import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineEye,
} from 'react-icons/hi';
import { useApp } from '../context/AppContext';
import { Loading, Modal, Badge, ProgressBar, getStatusVariant, getPriorityVariant } from '../components/common';
import { format } from 'date-fns';
import './Projects.css';

const Projects = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects, createProject, updateProject, deleteProject, loading } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Not Started',
    priority: 'Medium',
    manager: '',
    budget: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesPriority = !priorityFilter || project.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
      } else {
        await createProject(formData);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? All tasks will be deleted as well.')) {
      await deleteProject(id);
    }
  };

  // Open modal for editing
  const openEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0],
      status: project.status,
      priority: project.priority,
      manager: project.manager || '',
      budget: project.budget || 0,
    });
    setIsModalOpen(true);
  };

  // Open modal for new project
  const openNewModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Not Started',
      priority: 'Medium',
      manager: '',
      budget: 0,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  if (loading.projects) {
    return <Loading text="Loading projects..." />;
  }

  return (
    <div className="projects-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={openNewModal}>
          <HiOutlinePlus /> New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrapper">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

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
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <h3 className="project-card-title">{project.name}</h3>
                <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
              </div>

              <p className="project-card-description">
                {project.description || 'No description provided'}
              </p>

              <div className="project-card-progress">
                <div className="progress-header">
                  <span>Progress</span>
                  <span>{project.completionPercentage}%</span>
                </div>
                <ProgressBar value={project.completionPercentage} showLabel={false} color="dynamic" />
              </div>

              <div className="project-card-meta">
                <div className="meta-item">
                  <HiOutlineCalendar />
                  <span>
                    {project.startDate ? format(new Date(project.startDate), 'MMM d') : 'TBD'} - {project.endDate ? format(new Date(project.endDate), 'MMM d, yyyy') : 'TBD'}
                  </span>
                </div>
                <Badge variant={getPriorityVariant(project.priority)} size="small">
                  {project.priority}
                </Badge>
              </div>

              <div className="project-card-actions">
                <button
                  className="action-btn view"
                  onClick={() => navigate(`/projects/${project._id}`)}
                  title="View Details"
                >
                  <HiOutlineEye />
                </button>
                <button
                  className="action-btn gantt"
                  onClick={() => navigate(`/gantt/${project._id}`)}
                  title="View Gantt Chart"
                >
                  <HiOutlineCalendar />
                </button>
                <button
                  className="action-btn edit"
                  onClick={() => openEditModal(project)}
                  title="Edit Project"
                >
                  <HiOutlinePencil />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(project._id)}
                  title="Delete Project"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <HiOutlineFilter className="empty-icon" />
            <h3>No projects found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              required
              placeholder="Enter project name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              rows={3}
              placeholder="Enter project description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="form-input"
                required
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
              <label className="form-label">Project Manager</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className="form-input"
                placeholder="Enter manager name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Budget ($)</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="form-input"
                min={0}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProject ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
