import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;