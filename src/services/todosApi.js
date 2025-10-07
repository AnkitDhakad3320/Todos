import axios from 'axios';

const BASE_URL = 'https://dummyjson.com';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh function
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${BASE_URL}/auth/refresh`, {
      refreshToken: refreshToken,
      expiresInMins: 30 // refresh for 30 minutes
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Store new tokens
    localStorage.setItem('authToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return accessToken;
  } catch (error) {
    // Clear tokens if refresh fails
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    window.location.href = '/';
    throw error;
  }
};

// Request interceptor to add auth token
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Token validation function
export const validateToken = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return false;

    // Use the /auth/me endpoint to validate token
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    // Clear invalid tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    return false;
  }
};

export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { 
      username, 
      password,
      expiresInMins: 30 // set token expiry
    });
    return response.data;
  },

  logout: async () => {
    // Note: DummyJSON doesn't have logout endpoint, so we just clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    return { success: true };
  },

  refreshToken: async () => {
    const response = await refreshToken();
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Note: DummyJSON doesn't have real signup, but we can simulate
  signup: async (userData) => {
    const response = await api.post('/users/add', userData);
    return response.data;
  }
};

export const todosAPI = {
  getAll: async (limit = 30, skip = 0) => {
    const response = await api.get(`/todos?limit=${limit}&skip=${skip}`);
    return response.data;
  },

  getByUser: async (userId) => {
    const response = await api.get(`/todos/user/${userId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  add: async (todoData) => {
    const response = await api.post('/todos/add', todoData);
    return response.data;
  },

  update: async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  patch: async (id, updates) => {
    const response = await api.patch(`/todos/${id}`, updates);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/todos/${id}`);
    return response.data;
  },
};

export default api;