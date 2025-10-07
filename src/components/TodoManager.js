import React, { useState, useEffect } from 'react';
import { todosAPI } from '../services/todosApi';

const TodoManager = ({ user }) => {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Filter todos when todos, filter, or search query changes
  useEffect(() => {
    let filtered = todos;

    // Apply status filter
    if (filter === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (filter === 'pending') {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(todo =>
        todo.todo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTodos(filtered);
  }, [todos, filter, searchQuery]);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const data = await todosAPI.getAll(50); // Get more todos
      setTodos(data.todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
      alert('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (todoData) => {
    try {
      const newTodo = await todosAPI.add({
        ...todoData,
        userId: user.id
      });
      setTodos(prev => [newTodo, ...prev]);
      setShowAddForm(false);
      alert('Todo added successfully!');
    } catch (error) {
      console.error('Error adding todo:', error);
      alert('Failed to add todo');
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    try {
      const updatedTodo = await todosAPI.update(id, updates);
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      setEditingTodo(null);
      alert('Todo updated successfully!');
    } catch (error) {
      console.error('Error updating todo:', error);
      alert('Failed to update todo');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const updatedTodo = await todosAPI.patch(id, { completed: !completed });
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error('Error toggling todo:', error);
      alert('Failed to update todo status');
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await todosAPI.delete(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      alert('Todo deleted successfully!');
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Failed to delete todo');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled in the useEffect
  };

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    pending: todos.filter(t => !t.completed).length
  };

  return (
    <div className="todo-manager">
      <div className="section-header">
        <h2>My Todos ({stats.total})</h2>
        <div className="controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Search</button>
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="btn-secondary"
              >
                Clear
              </button>
            )}
          </form>
          
          <div className="filter-buttons">
            <button 
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'btn-primary' : 'btn-secondary'}
            >
              All ({stats.total})
            </button>
            <button 
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'btn-primary' : 'btn-secondary'}
            >
              Completed ({stats.completed})
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={filter === 'pending' ? 'btn-primary' : 'btn-secondary'}
            >
              Pending ({stats.pending})
            </button>
          </div>

          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            + Add New Todo
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total</h3>
          <span className="stat-number">{stats.total}</span>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <span className="stat-number">{stats.completed}</span>
        </div>
        <div className="stat-card pending">
          <h3>Pending</h3>
          <span className="stat-number">{stats.pending}</span>
        </div>
      </div>

      {loading && <div className="loading">Loading todos...</div>}

      {showAddForm && (
        <TodoForm
          onSubmit={handleAddTodo}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="todos-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? 'No todos match your search.' : 'No todos found.'}
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div key={todo.id} className={`todo-card ${todo.completed ? 'completed' : ''}`}>
              {editingTodo?.id === todo.id ? (
                <TodoForm
                  todo={todo}
                  onSubmit={(updates) => handleUpdateTodo(todo.id, updates)}
                  onCancel={() => setEditingTodo(null)}
                />
              ) : (
                <>
                  <div className="todo-content">
                    <div className="todo-header">
                      <h3 className="todo-title">{todo.todo}</h3>
                      <span className={`todo-status ${todo.completed ? 'completed' : 'pending'}`}>
                        {todo.completed ? '✅ Completed' : '⏳ Pending'}
                      </span>
                    </div>
                    
                    <div className="todo-meta">
                      <span className="user-id">User: {todo.userId}</span>
                      {todo.completed && (
                        <span className="completed-date">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="todo-actions">
                    <button 
                      onClick={() => handleToggleComplete(todo.id, todo.completed)}
                      className={todo.completed ? 'btn-secondary' : 'btn-success'}
                    >
                      {todo.completed ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button 
                      onClick={() => setEditingTodo(todo)}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Todo Form Component
const TodoForm = ({ todo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    todo: todo?.todo || '',
    completed: todo?.completed || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.todo.trim()) {
      alert('Please enter a todo description');
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <label>Todo Description:</label>
        <textarea
          name="todo"
          value={formData.todo}
          onChange={handleChange}
          placeholder="What needs to be done?"
          required
          rows="3"
        />
      </div>
      
      {todo && (
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="completed"
              checked={formData.completed}
              onChange={handleChange}
            />
            Completed
          </label>
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {todo ? 'Update' : 'Add'} Todo
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TodoManager;