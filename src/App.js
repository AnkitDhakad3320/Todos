import React, { useState, useEffect } from 'react';
import { authAPI } from './services/todosApi';
import TodoManager from './components/TodoManager';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check for existing token on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = async (username, password) => {
    setLoading(true);
    try {
      const authData = await authAPI.login(username, password);
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('userData', JSON.stringify(authData));
      setUser(authData);
      alert('Login successful!');
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>📝 Todo Manager</h1>
        <div className="nav">
          {user ? (
            <>
              <span>Welcome, {user.username}!</span>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <span>Please login to manage your todos</span>
          )}
        </div>
      </header>

      <main className="main-content">
        {loading && <div className="loading">Loading...</div>}
        
        {!user ? (
          <LoginForm onLogin={handleLogin} loading={loading} />
        ) : (
          <TodoManager user={user} />
        )}
      </main>
    </div>
  );
}

export default App;