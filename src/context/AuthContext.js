import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, validateToken } from '../services/todosApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing valid token on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (token) {
        const userData = await validateToken();
        if (userData) {
          setUser(userData);
        } else {
          // Token is invalid, clear storage
          await authAPI.logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await authAPI.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const authData = await authAPI.login(username, password);
      
      // Store tokens and user data
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken || authData.token);
      localStorage.setItem('userData', JSON.stringify(authData));
      
      setUser(authData);
      return { success: true, data: authData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const newUser = await authAPI.signup(userData);
      
      // Auto-login after successful signup
      const loginResult = await login(userData.username, userData.password);
      return loginResult;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    signup,
    checkAuth,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};