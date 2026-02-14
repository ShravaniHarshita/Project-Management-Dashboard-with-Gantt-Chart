import React from 'react';
import './Loading.css';

const Loading = ({ text = 'Loading...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">{text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <span className="loading-text">{text}</span>
    </div>
  );
};

export default Loading;
