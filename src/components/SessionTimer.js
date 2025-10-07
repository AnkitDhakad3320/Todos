import React from 'react';

const SessionTimer = ({ timeLeft }) => {
  if (!timeLeft) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="session-timer">
      <div className="timer-icon">⏰</div>
      <span className="timer-text">Session expires in: {formatTime(timeLeft)}</span>
    </div>
  );
};

export default SessionTimer;