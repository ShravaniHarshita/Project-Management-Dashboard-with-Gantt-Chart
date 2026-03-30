import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token');
        // Optionally redirect to login
      }
      
      return Promise.reject(data);
    }
    return Promise.reject(error);
  }
);

// ================== Project APIs ==================

export const projectAPI = {
  // Get all projects
  getAll: (params = {}) => api.get('/projects', { params }),
  
  // Get single project
  getById: (id) => api.get(`/projects/${id}`),
  
  // Create project
  create: (data) => api.post('/projects', data),
  
  // Update project
  update: (id, data) => api.put(`/projects/${id}`, data),
  
  // Delete project
  delete: (id) => api.delete(`/projects/${id}`),
  
  // Get project stats
  getStats: () => api.get('/projects/stats/overview'),
};

// ================== Task APIs ==================

export const taskAPI = {
  // Get all tasks
  getAll: (params = {}) => api.get('/tasks/all', { params }),
  
  // Get tasks by project
  getByProject: (projectId, params = {}) => api.get(`/tasks/${projectId}`, { params }),
  
  // Get single task
  getById: (id) => api.get(`/tasks/detail/${id}`),
  
  // Create task
  create: (data) => api.post('/tasks', data),
  
  // Update task
  update: (id, data) => api.put(`/tasks/${id}`, data),
  
  // Delete task
  delete: (id) => api.delete(`/tasks/${id}`),
  
  // Reorder tasks
  reorder: (taskOrders) => api.put('/tasks/reorder', { taskOrders }),
  
  // Get task stats
  getStats: () => api.get('/tasks/stats/overview'),
  
  // Get Gantt chart data
  getGanttData: (projectId) => api.get(`/tasks/gantt/${projectId}`),
  
  // Get Gantt chart data for all projects or specific project
  getGanttTasks: (projectId) => projectId ? api.get(`/tasks/gantt/${projectId}`) : api.get('/tasks/gantt'),
};

// ================== Resource APIs ==================

export const resourceAPI = {
  // Get all resources
  getAll: (params = {}) => api.get('/resources', { params }),
  
  // Get single resource
  getById: (id) => api.get(`/resources/${id}`),
  
  // Create resource
  create: (data) => api.post('/resources', data),
  
  // Update resource
  update: (id, data) => api.put(`/resources/${id}`, data),
  
  // Delete resource
  delete: (id) => api.delete(`/resources/${id}`),
  
  // Get utilization stats
  getUtilization: () => api.get('/resources/stats/utilization'),
  
  // Get available resources
  getAvailable: () => api.get('/resources/available'),
};

// ================== Dashboard APIs ==================

export const dashboardAPI = {
  // Get overview data
  getOverview: () => api.get('/dashboard/overview'),
  
  // Get KPIs
  getKPIs: () => api.get('/dashboard/kpi'),
  
  // Get timeline data
  getTimeline: (period = '6months') => api.get('/dashboard/timeline', { params: { period } }),
};

// ================== Auth APIs ==================

export const authAPI = {
  // Register
  register: (data) => api.post('/auth/register', data),
  
  // Login
  login: (data) => api.post('/auth/login', data),
  
  // Logout
  logout: () => api.get('/auth/logout'),
  
  // Forgot password - sends OTP
  forgotPassword: (data) => api.post('/auth/forgotpassword', data),
  
  // Verify OTP
  verifyOTP: (data) => api.post('/auth/verifyotp', data),
  
  // Reset password (with token from OTP verification)
  resetPassword: (resetToken, data) => api.put(`/auth/resetpassword/${resetToken}`, data),
  
  // Get current user
  getMe: () => api.get('/auth/me'),
  
  // Update details
  updateDetails: (data) => api.put('/auth/updatedetails', data),
  
  // Update password
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

export default api;
