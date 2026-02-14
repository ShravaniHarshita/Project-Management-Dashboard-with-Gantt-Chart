import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({
  value = 0,
  max = 100,
  showLabel = true,
  size = 'medium',
  color = 'primary',
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Dynamic color based on percentage
  const getColor = () => {
    if (color !== 'dynamic') return color;
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'primary';
  };

  return (
    <div className={`progress-wrapper ${className}`}>
      {showLabel && (
        <div className="progress-label">
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`progress-track progress-${size}`}>
        <div
          className={`progress-fill progress-${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
