import React from 'react';
import './Badge.css';

const Badge = ({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} badge-size-${size} ${className}`}>
      {children}
    </span>
  );
};

// Helper function to get status badge variant
export const getStatusVariant = (status) => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'In Progress':
      return 'info';
    case 'Delayed':
      return 'error';
    case 'Not Started':
    default:
      return 'default';
  }
};

// Helper function to get priority badge variant
export const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'error';
    case 'High':
      return 'warning';
    case 'Medium':
      return 'info';
    case 'Low':
    default:
      return 'default';
  }
};

export default Badge;
