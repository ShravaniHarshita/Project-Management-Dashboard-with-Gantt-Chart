import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineMenu,
  HiOutlineBell,
  HiOutlineSearch,
  HiOutlineUser,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineCog,
  HiOutlineSupport,
  HiOutlineLogout,
} from 'react-icons/hi';
import { projectAPI, taskAPI } from '../../services/api';
import './Navbar.css';

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ projects: [], tasks: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchRef = useRef(null);

  const notifications = [
    { id: 1, title: 'New task assigned', time: '5 min ago', read: false },
    { id: 2, title: 'Project deadline approaching', time: '1 hour ago', read: false },
    { id: 3, title: 'Task completed', time: '3 hours ago', read: true },
  ];

  // Profile menu handlers
  const handleMyProfile = () => {
    setShowProfile(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setShowProfile(false);
    navigate('/settings');
  };

  const handleHelpSupport = () => {
    setShowProfile(false);
    navigate('/help');
  };

  const handleSignOut = () => {
    setShowProfile(false);
    toast.success('Signed out successfully!');
    // In a real app, you would clear auth tokens and redirect to login
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  // Debounced search
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const [projectsRes, tasksRes] = await Promise.all([
            projectAPI.getAll({ search: searchQuery, limit: 5 }),
            taskAPI.getAll({ search: searchQuery, limit: 5 })
          ]);
          setSearchResults({
            projects: projectsRes.data.data || [],
            tasks: tasksRes.data.data || []
          });
          setShowSearchResults(true);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults({ projects: [], tasks: [] });
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type, id) => {
    setSearchQuery('');
    setShowSearchResults(false);
    if (type === 'project') {
      navigate(`/projects/${id}`);
    } else if (type === 'task') {
      navigate('/tasks');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        {/* Menu Toggle */}
        <button className="navbar-toggle" onClick={toggleSidebar}>
          <HiOutlineMenu />
        </button>

        {/* Search Bar */}
        <div className="navbar-search" ref={searchRef}>
          <HiOutlineSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            className="search-input"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && (searchResults.projects.length > 0 || searchResults.tasks.length > 0) && (
            <div className="search-results-dropdown">
              {searchResults.projects.length > 0 && (
                <div className="search-results-section">
                  <div className="search-results-header">
                    <HiOutlineFolder /> Projects
                  </div>
                  {searchResults.projects.map(project => (
                    <div 
                      key={project._id} 
                      className="search-result-item"
                      onClick={() => handleResultClick('project', project._id)}
                    >
                      <span className="search-result-name">{project.name}</span>
                      <span className="search-result-meta">{project.status}</span>
                    </div>
                  ))}
                </div>
              )}
              {searchResults.tasks.length > 0 && (
                <div className="search-results-section">
                  <div className="search-results-header">
                    <HiOutlineClipboardList /> Tasks
                  </div>
                  {searchResults.tasks.map(task => (
                    <div 
                      key={task._id} 
                      className="search-result-item"
                      onClick={() => handleResultClick('task', task._id)}
                    >
                      <span className="search-result-name">{task.title}</span>
                      <span className="search-result-meta">{task.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {showSearchResults && isSearching && (
            <div className="search-results-dropdown">
              <div className="search-loading">Searching...</div>
            </div>
          )}
          
          {showSearchResults && !isSearching && searchQuery.length >= 2 && 
           searchResults.projects.length === 0 && searchResults.tasks.length === 0 && (
            <div className="search-results-dropdown">
              <div className="search-no-results">No results found</div>
            </div>
          )}
        </div>
      </div>

      <div className="navbar-right">
          {/* Search can be extended here */}

        {/* Notifications */}
        <div className="navbar-dropdown">
          <button
            className="navbar-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <HiOutlineBell />
            <span className="notification-badge">
              {notifications.filter(n => !n.read).length}
            </span>
          </button>

          {showNotifications && (
            <div className="dropdown-menu notifications-menu">
              <div className="dropdown-header">
                <span>Notifications</span>
                <button className="mark-read-btn">Mark all read</button>
              </div>
              <ul className="notifications-list">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : ''}`}
                  >
                    <div className="notification-content">
                      <span className="notification-title">{notification.title}</span>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="dropdown-footer">
                <button className="view-all-btn">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="navbar-dropdown">
          <button
            className="navbar-profile"
            onClick={() => setShowProfile(!showProfile)}
          >
            <div className="profile-avatar">
              <HiOutlineUser />
            </div>
            <span className="profile-name">Admin User</span>
          </button>

          {showProfile && (
            <div className="dropdown-menu profile-menu">
              <div className="profile-info">
                <div className="profile-avatar large">
                  <HiOutlineUser />
                </div>
                <div className="profile-details">
                  <span className="profile-name">Admin User</span>
                  <span className="profile-email">admin@projectdash.com</span>
                </div>
              </div>
              <ul className="profile-menu-list">
                <li><button onClick={handleMyProfile}><HiOutlineUser /> My Profile</button></li>
                <li><button onClick={handleSettings}><HiOutlineCog /> Settings</button></li>
                <li><button onClick={handleHelpSupport}><HiOutlineSupport /> Help & Support</button></li>
                <li className="divider"></li>
                <li><button className="logout-btn" onClick={handleSignOut}><HiOutlineLogout /> Sign Out</button></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile) && (
        <div
          className="dropdown-overlay"
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
          }}
        />
      )}
    </header>
  );
};

export default Navbar;
