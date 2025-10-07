import React, { useEffect, useState } from 'react';

const IdleWarningPopup = ({ 
  timeLeft, 
  onStayLoggedIn, 
  onLogout,
  warningTime = 60 
}) => {
  const [progress, setProgress] = useState(100);

  // Update progress bar based on time left
  useEffect(() => {
    const percentage = (timeLeft / warningTime) * 100;
    setProgress(percentage);
  }, [timeLeft, warningTime]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="idle-warning-overlay">
      <div className="idle-warning-popup">
        <div className="warning-header">
          <div className="warning-icon">⏰</div>
          <h3>Session Timeout Warning</h3>
        </div>
        
        <div className="warning-content">
          <p>You will be automatically logged out due to inactivity in:</p>
          <div className="countdown-timer">
            <span className="time">{formatTime(timeLeft)}</span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="warning-message">
            For security reasons, your session will expire soon.
          </p>
        </div>

        <div className="warning-actions">
          <button 
            onClick={onStayLoggedIn}
            className="btn-primary stay-logged-in-btn"
          >
            ✅ Stay Logged In
          </button>
          <button 
            onClick={onLogout}
            className="btn-secondary logout-now-btn"
          >
            🚪 Logout Now
          </button>
        </div>

        <div className="warning-footer">
          <small>Your activity will extend the session</small>
        </div>
      </div>
    </div>
  );
};

export default IdleWarningPopup;