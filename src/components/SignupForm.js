import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SignupForm = ({ onSwitchToLogin }) => {
  const { signup, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    age: ''
  });
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');

    // Basic validation
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters long');
      return;
    }

    const result = await signup(formData);
    
    if (result.success) {
      setSuccess('Account created successfully! You are now logged in.');
    } else {
      setLocalError(result.error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (localError) setLocalError('');
  };

  return (
    <div className="login-container">
      <div className="form-container">
        <h2>👤 Create Account</h2>
        
        {localError && (
          <div className="error-message">
            ❌ {localError}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
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
              minLength="6"
              disabled={loading}
              placeholder="At least 6 characters"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
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
                Creating Account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>Already have an account? </p>
          <button 
            onClick={onSwitchToLogin}
            className="btn-link"
            disabled={loading}
          >
            Login here
          </button>
        </div>

        <div className="demo-credentials">
          <h4>Note:</h4>
          <p>This creates a user in the DummyJSON system. You'll be automatically logged in after signup.</p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;