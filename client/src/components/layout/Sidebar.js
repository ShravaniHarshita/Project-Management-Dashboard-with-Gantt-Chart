import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineCalendar,
  HiOutlineUserGroup,
  HiOutlineChartBar,
  HiOutlineX,
} from 'react-icons/hi';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      icon: HiOutlineHome,
      label: 'Dashboard',
    },
    {
      path: '/projects',
      icon: HiOutlineFolder,
      label: 'Projects',
    },
    {
      path: '/tasks',
      icon: HiOutlineClipboardList,
      label: 'Tasks',
    },
    {
      path: '/gantt',
      icon: HiOutlineCalendar,
      label: 'Gantt Chart',
    },
    {
      path: '/resources',
      icon: HiOutlineUserGroup,
      label: 'Resources',
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <HiOutlineChartBar className="logo-icon" />
            <span className="logo-text">ProjectDash</span>
          </div>
          <button className="sidebar-close" onClick={toggleSidebar}>
            <HiOutlineX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive || (item.path !== '/' && location.pathname.startsWith(item.path)) ? 'active' : ''}`
                  }
                  onClick={() => {
                    if (window.innerWidth < 768) toggleSidebar();
                  }}
                >
                  <item.icon className="sidebar-link-icon" />
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="sidebar-footer-info">
              <span className="sidebar-footer-label">Project Management</span>
              <span className="sidebar-footer-version">Version 1.0.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
