import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ onSwitchToSignup }) => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: 'kminchelle',
    password: '0lelplR'
  });
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    const result = await login(formData.username, formData.password);
    
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (localError) setLocalError('');
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2>🔐 Login to Todo Manager</h2>
        
        {localError && (
          <div className="error-message">
            ❌ {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>Don't have an account? </p>
          <button 
            onClick={onSwitchToSignup}
            className="btn-link"
            disabled={loading}
          >
            Sign up here
          </button>
        </div>
        
        <div className="demo-credentials">
          <h4>Demo Credentials (JWT Protected):</h4>
          <p>Username: <strong>kminchelle</strong></p>
          <p>Password: <strong>0lelplR</strong></p>
          <p className="token-info">Tokens expire in 30 minutes with auto-refresh</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;