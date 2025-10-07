import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, validateToken } from '../services/todosApi';
import useIdleTimer from '../hooks/useIdleTimer';
import IdleWarningPopup from '../components/IdleWarningPopup';

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
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  // Configuration - easily adjustable
  const IDLE_TIMEOUT = 1.5 * 60 * 1000; // 10 minutes
  const WARNING_TIME = 60 * 1000; // 60 seconds warning

  // Idle timer functionality
  const {
    timeLeft,
    isWarning,
    resetTimer,
    handleStayLoggedIn: idleHandleStayLoggedIn,
    handleImmediateLogout: idleHandleImmediateLogout
  } = useIdleTimer({
    timeout: IDLE_TIMEOUT,
    warningTime: WARNING_TIME,
    onTimeout: handleAutoLogout,
    onWarning: () => setShowIdleWarning(true),
    onStayLoggedIn: handleStayLoggedIn,
    onActivity: handleUserActivity
  });

  function handleAutoLogout() {
    console.log('Auto-logout due to inactivity');
    performLogout();
  }

  function handleStayLoggedIn() {
    setShowIdleWarning(false);
    console.log('Session extended by user');
  }

  function handleUserActivity() {
    // This is called when user is active during normal operation
    // Not during warning period (that's handled in the hook)
  }

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
          resetTimer(); // Start idle timer when user is authenticated
        } else {
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
      resetTimer(); // Start idle timer after successful login
      return { success: true, data: authData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const performLogout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      setError(null);
      setShowIdleWarning(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await performLogout();
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

  // Enhanced stay logged in handler
  const handleStayLoggedInEnhanced = () => {
    idleHandleStayLoggedIn();
    setShowIdleWarning(false);
  };

  // Enhanced immediate logout handler
  const handleImmediateLogout = () => {
    idleHandleImmediateLogout();
    performLogout();
  };

  const value = {
    user,
    loading,
    error,
    showIdleWarning,
    idleTimeLeft: timeLeft,
    login,
    logout,
    signup,
    checkAuth,
    setError,
    handleStayLoggedIn: handleStayLoggedInEnhanced,
    handleImmediateLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Idle Warning Popup */}
      {showIdleWarning && user && (
        <IdleWarningPopup
          timeLeft={timeLeft}
          onStayLoggedIn={handleStayLoggedInEnhanced}
          onLogout={handleImmediateLogout}
          warningTime={WARNING_TIME / 1000}
        />
      )}
    </AuthContext.Provider>
  );
};