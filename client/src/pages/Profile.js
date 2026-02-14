import React, { useState } from 'react';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlinePencil,
  HiOutlineCamera,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { Modal } from '../components/common';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@projectdash.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    department: 'Engineering',
    role: 'Project Manager',
    joinDate: '2024-01-15',
    bio: 'Experienced project manager with expertise in agile methodologies and team leadership. Passionate about delivering high-quality software solutions.',
    skills: ['Project Management', 'Agile/Scrum', 'Team Leadership', 'React', 'Node.js'],
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedProfile({ ...profile });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = () => {
    setShowAvatarModal(false);
    toast.success('Profile picture updated!');
  };

  const stats = [
    { label: 'Projects', value: 12, color: 'primary' },
    { label: 'Tasks Completed', value: 156, color: 'success' },
    { label: 'Team Members', value: 8, color: 'warning' },
    { label: 'Hours Logged', value: '1,240', color: 'info' },
  ];

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="page-header">
        <h1><HiOutlineUser /> My Profile</h1>
        <p>Manage your personal information and preferences</p>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Profile Card */}
        <div className="profile-card main-card">
          <div className="profile-header">
            <div className="avatar-section">
              <div className="profile-avatar-large">
                <HiOutlineUser />
                <button 
                  className="avatar-edit-btn"
                  onClick={() => setShowAvatarModal(true)}
                >
                  <HiOutlineCamera />
                </button>
              </div>
              <div className="profile-identity">
                {isEditing ? (
                  <div className="name-edit">
                    <input
                      type="text"
                      value={editedProfile.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First Name"
                    />
                    <input
                      type="text"
                      value={editedProfile.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                ) : (
                  <h2>{profile.firstName} {profile.lastName}</h2>
                )}
                <span className="profile-role">{profile.role}</span>
                <span className="profile-department">{profile.department}</span>
              </div>
            </div>
            <div className="profile-actions">
              {isEditing ? (
                <>
                  <button className="btn btn-success" onClick={handleSave}>
                    <HiOutlineCheck /> Save
                  </button>
                  <button className="btn btn-secondary" onClick={handleEditToggle}>
                    <HiOutlineX /> Cancel
                  </button>
                </>
              ) : (
                <button className="btn btn-primary" onClick={handleEditToggle}>
                  <HiOutlinePencil /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            {stats.map((stat, index) => (
              <div key={index} className={`stat-box ${stat.color}`}>
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Grid */}
        <div className="profile-grid">
          {/* Contact Information */}
          <div className="profile-card">
            <h3>Contact Information</h3>
            <div className="info-list">
              <div className="info-item">
                <HiOutlineMail className="info-icon" />
                <div className="info-content">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <span>{profile.email}</span>
                  )}
                </div>
              </div>
              <div className="info-item">
                <HiOutlinePhone className="info-icon" />
                <div className="info-content">
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <span>{profile.phone}</span>
                  )}
                </div>
              </div>
              <div className="info-item">
                <HiOutlineLocationMarker className="info-icon" />
                <div className="info-content">
                  <label>Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  ) : (
                    <span>{profile.location}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="profile-card">
            <h3>Work Information</h3>
            <div className="info-list">
              <div className="info-item">
                <HiOutlineBriefcase className="info-icon" />
                <div className="info-content">
                  <label>Department</label>
                  {isEditing ? (
                    <select
                      value={editedProfile.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  ) : (
                    <span>{profile.department}</span>
                  )}
                </div>
              </div>
              <div className="info-item">
                <HiOutlineUser className="info-icon" />
                <div className="info-content">
                  <label>Role</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                    />
                  ) : (
                    <span>{profile.role}</span>
                  )}
                </div>
              </div>
              <div className="info-item">
                <HiOutlineCalendar className="info-icon" />
                <div className="info-content">
                  <label>Join Date</label>
                  <span>{new Date(profile.joinDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="profile-card full-width">
            <h3>About Me</h3>
            {isEditing ? (
              <textarea
                value={editedProfile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="Write something about yourself..."
              />
            ) : (
              <p className="bio-text">{profile.bio}</p>
            )}
          </div>

          {/* Skills */}
          <div className="profile-card full-width">
            <h3>Skills & Expertise</h3>
            <div className="skills-list">
              {profile.skills.map((skill, index) => (
                <span key={index} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Change Profile Picture"
        size="small"
      >
        <div className="avatar-upload">
          <div className="avatar-preview">
            <HiOutlineUser />
          </div>
          <div className="upload-options">
            <button className="btn btn-primary" onClick={handleAvatarChange}>
              <HiOutlineCamera /> Upload Photo
            </button>
            <p className="upload-hint">JPG, PNG or GIF. Max size 2MB</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
