import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
};

export const todosAPI = {
  // Get all todos
  getAll: async (limit = 30, skip = 0) => {
    const response = await api.get(`/todos?limit=${limit}&skip=${skip}`);
    return response.data;
  },

  // Get todos by user
  getByUser: async (userId) => {
    const response = await api.get(`/todos/user/${userId}`);
    return response.data;
  },

  // Get single todo
  getById: async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // Add new todo
  add: async (todoData) => {
    const response = await api.post('/todos/add', todoData);
    return response.data;
  },

  // Update todo
  update: async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  // Partial update (for completing todos)
  patch: async (id, updates) => {
    const response = await api.patch(`/todos/${id}`, updates);
    return response.data;
  },

  // Delete todo
  delete: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },
};

export const usersAPI = {
  getCurrent: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;