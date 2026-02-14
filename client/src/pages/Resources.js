import React, { useEffect, useState } from 'react';
import {
  HiOutlineUserGroup,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineMail,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlinePencil,
} from 'react-icons/hi';
import { useApp } from '../context/AppContext';
import { resourceAPI } from '../services/api';
import { Loading, Modal, Badge, ProgressBar } from '../components/common';
import toast from 'react-hot-toast';
import './Resources.css';

const Resources = () => {
  const { resources, loading, fetchResources, createResource, updateResource, deleteResource } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [utilization, setUtilization] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    availability: true,
    skills: [],
    hourlyRate: 0,
    maxHoursPerWeek: 40,
    currentWorkload: 0,
  });
  const [skillInput, setSkillInput] = useState('');

  // Fetch resources and utilization data
  useEffect(() => {
    fetchResources();
    fetchUtilization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUtilization = async () => {
    try {
      const response = await resourceAPI.getUtilization();
      setUtilization(response.data.data || []);
    } catch (error) {
      console.error('Failed to load utilization data');
    }
  };

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !departmentFilter || resource.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = [...new Set(resources.map(r => r.department).filter(Boolean))];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingResource) {
        await updateResource(editingResource._id, formData);
      } else {
        await createResource(formData);
      }
      closeModal();
      fetchUtilization();
    } catch (error) {
      toast.error(error.error || 'Failed to save resource');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      await deleteResource(id);
      fetchUtilization();
    }
  };

  // Open modal for editing
  const openEditModal = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      email: resource.email,
      role: resource.role,
      department: resource.department || '',
      availability: resource.availability,
      skills: resource.skills || [],
      hourlyRate: resource.hourlyRate || 0,
      maxHoursPerWeek: resource.maxHoursPerWeek || 40,
      currentWorkload: resource.currentWorkload || 0,
    });
    setIsModalOpen(true);
  };

  // Open modal for new resource
  const openNewModal = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      availability: true,
      skills: [],
      hourlyRate: 0,
      maxHoursPerWeek: 40,
      currentWorkload: 0,
    });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingResource(null);
    setSkillInput('');
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  // Remove skill
  const removeSkill = (skill) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  // Get availability variant
  const getAvailabilityVariant = (resource) => {
    const status = resource.availabilityStatus || (resource.availability ? 'Available' : 'Unavailable');
    switch (status) {
      case 'Available': return 'success';
      case 'Nearly Full':
      case 'Partially Available': return 'warning';
      case 'Unavailable':
      case 'Fully Allocated': return 'error';
      default: return resource.availability ? 'success' : 'error';
    }
  };

  // Get availability text
  const getAvailabilityText = (resource) => {
    return resource.availabilityStatus || (resource.availability ? 'Available' : 'Unavailable');
  };

  // Get utilization percentage for a resource
  const getUtilizationPercentage = (resourceId) => {
    if (!Array.isArray(utilization)) return 0;
    const resourceUtil = utilization.find(u => u._id === resourceId);
    return resourceUtil?.utilizationPercentage || 0;
  };

  if (loading.resources && resources.length === 0) {
    return <Loading text="Loading resources..." />;
  }

  return (
    <div className="resources-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1><HiOutlineUserGroup /> Resources</h1>
          <p>Manage your team members and their workload</p>
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          <HiOutlinePlus /> Add Resource
        </button>
      </div>

      {/* Stats Cards */}
      <div className="resource-stats">
        <div className="stat-card">
          <div className="stat-value">{resources.length}</div>
          <div className="stat-label">Total Resources</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {resources.filter(r => r.availability === true).length}
          </div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {resources.filter(r => r.availabilityStatus === 'Nearly Full').length}
          </div>
          <div className="stat-label">Nearly Full</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {resources.filter(r => r.availability === false).length}
          </div>
          <div className="stat-label">Unavailable</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <div key={resource._id} className="resource-card">
              <div className="resource-card-header">
                <div className="resource-avatar">
                  {resource.name.charAt(0).toUpperCase()}
                </div>
                <div className="resource-info">
                  <h3>{resource.name}</h3>
                  <span className="resource-role">{resource.role}</span>
                </div>
                <Badge variant={getAvailabilityVariant(resource)} size="small">
                  {getAvailabilityText(resource)}
                </Badge>
              </div>

              <div className="resource-details">
                <div className="detail-item">
                  <HiOutlineMail />
                  <span>{resource.email}</span>
                </div>
                {resource.department && (
                  <div className="detail-item">
                    <HiOutlineBriefcase />
                    <span>{resource.department}</span>
                  </div>
                )}
                <div className="detail-item">
                  <HiOutlineClock />
                  <span>{resource.currentWorkload || 0} / {resource.maxHoursPerWeek || 40} hrs/week</span>
                </div>
              </div>

              {resource.skills && resource.skills.length > 0 && (
                <div className="resource-skills">
                  {resource.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                  {resource.skills.length > 3 && (
                    <span className="skill-tag more">+{resource.skills.length - 3}</span>
                  )}
                </div>
              )}

              <div className="utilization-section">
                <div className="utilization-header">
                  <span>Utilization</span>
                  <span>{getUtilizationPercentage(resource._id)}%</span>
                </div>
                <ProgressBar 
                  value={getUtilizationPercentage(resource._id)} 
                  showLabel={false} 
                  size="small" 
                  color="dynamic"
                />
              </div>

              <div className="resource-actions">
                <button
                  className="action-btn edit"
                  onClick={() => openEditModal(resource)}
                  title="Edit Resource"
                >
                  <HiOutlinePencil />
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(resource._id)}
                  title="Delete Resource"
                >
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <HiOutlineUserGroup className="empty-icon" />
          <h3>No resources found</h3>
          <p>
            {searchTerm || departmentFilter 
              ? 'Try adjusting your filters' 
              : 'Add your first team member to get started'}
          </p>
          {!searchTerm && !departmentFilter && (
            <button className="btn btn-primary" onClick={openNewModal}>
              <HiOutlinePlus /> Add Resource
            </button>
          )}
        </div>
      )}

      {/* Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingResource ? 'Edit Resource' : 'Add New Resource'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="resource-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
                placeholder="Enter name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                required
                placeholder="Enter email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-input"
                required
                placeholder="e.g., Developer, Designer"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-input"
                placeholder="e.g., Engineering, Design"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                value={formData.availability ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value === 'true' })}
                className="form-input"
              >
                <option value="true">Available</option>
                <option value="false">Unavailable</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Rate ($)</label>
              <input
                type="number"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                className="form-input"
                min={0}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Max Hours/Week</label>
              <input
                type="number"
                value={formData.maxHoursPerWeek}
                onChange={(e) => setFormData({ ...formData, maxHoursPerWeek: Number(e.target.value) })}
                className="form-input"
                min={0}
                max={168}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Workload (hrs/week)</label>
              <input
                type="number"
                value={formData.currentWorkload}
                onChange={(e) => setFormData({ ...formData, currentWorkload: Number(e.target.value) })}
                className="form-input"
                min={0}
                max={formData.maxHoursPerWeek}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills</label>
            <div className="skill-input-wrapper">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="form-input"
                placeholder="Type a skill and press Enter"
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="skills-list">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}>&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingResource ? 'Update Resource' : 'Add Resource'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Resources;
