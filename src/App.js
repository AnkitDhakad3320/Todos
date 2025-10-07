import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import TodoManager from './components/TodoManager';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Main app content component
const AppContent = () => {
  const { user, logout, loading } = useAuth();
  const [currentAuthView, setCurrentAuthView] = useState('login');

  const handleLogout = async () => {
    await logout();
    setCurrentAuthView('login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>📝 JWT Todo Manager</h1>
        <div className="nav">
          {user ? (
            <>
              <div className="user-info">
                <span className="welcome">Welcome, <strong>{user.username}</strong>!</span>
                <span className="user-id">ID: {user.id}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary">
                🚪 Logout
              </button>
            </>
          ) : (
            <div className="auth-info">
              <span>JWT Protected Todo Application</span>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {!user ? (
          currentAuthView === 'login' ? (
            <LoginForm onSwitchToSignup={() => setCurrentAuthView('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setCurrentAuthView('login')} />
          )
        ) : (
          <ProtectedRoute>
            <TodoManager user={user} />
          </ProtectedRoute>
        )}
      </main>

      {/* Token Info Footer */}
      {user && (
        <footer className="app-footer">
          <div className="token-info">
            <span>🔐 JWT Authentication Active</span>
            <span>•</span>
            <span>Auto-refresh enabled</span>
            <span>•</span>
            <span>User ID: {user.id}</span>
          </div>
        </footer>
      )}
    </div>
  );
};

// Main App wrapper with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;