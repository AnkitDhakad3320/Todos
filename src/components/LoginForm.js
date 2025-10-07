import React, { useState } from 'react';

const LoginForm = ({ onLogin, loading }) => {
  const [formData, setFormData] = useState({
    username: 'kminchelle',
    password: '0lelplR'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(formData.username, formData.password);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2>Login to Todo Manager</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
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
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="demo-credentials">
          <h4>Demo Credentials:</h4>
          <p>Username: <strong>kminchelle</strong></p>
          <p>Password: <strong>0lelplR</strong></p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;