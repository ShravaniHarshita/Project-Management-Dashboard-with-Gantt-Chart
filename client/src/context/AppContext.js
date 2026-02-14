import React, { createContext, useContext, useState, useCallback } from 'react';
import { projectAPI, taskAPI, resourceAPI, dashboardAPI } from '../services/api';
import toast from 'react-hot-toast';

// Create context
const AppContext = createContext(null);

// Provider component
export const AppProvider = ({ children }) => {
  // State
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState({
    projects: false,
    tasks: false,
    resources: false,
    dashboard: false,
  });

  // ================== Project Functions ==================

  const fetchProjects = useCallback(async (params = {}) => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const response = await projectAPI.getAll(params);
      setProjects(response.data.data);
      return response.data;
    } catch (error) {
      toast.error(error.error || 'Failed to fetch projects');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  }, []);

  const createProject = useCallback(async (data) => {
    try {
      const response = await projectAPI.create(data);
      setProjects(prev => [response.data.data, ...prev]);
      toast.success('Project created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.error || 'Failed to create project');
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (id, data) => {
    try {
      const response = await projectAPI.update(id, data);
      setProjects(prev =>
        prev.map(p => (p._id === id ? response.data.data : p))
      );
      toast.success('Project updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.error || 'Failed to update project');
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (id) => {
    try {
      await projectAPI.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted successfully');
    } catch (error) {
      toast.error(error.error || 'Failed to delete project');
      throw error;
    }
  }, []);

  // ================== Task Functions ==================

  const fetchTasks = useCallback(async (projectId = null, params = {}) => {
    setLoading(prev => ({ ...prev, tasks: true }));
    try {
      const response = projectId
        ? await taskAPI.getByProject(projectId, params)
        : await taskAPI.getAll(params);
      setTasks(response.data.data);
      return response.data;
    } catch (error) {
      toast.error(error.error || 'Failed to fetch tasks');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
  }, []);

  const createTask = useCallback(async (data) => {
    try {
      const response = await taskAPI.create(data);
      setTasks(prev => [...prev, response.data.data]);
      toast.success('Task created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.error || 'Failed to create task');
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (id, data) => {
    try {
      const response = await taskAPI.update(id, data);
      setTasks(prev =>
        prev.map(t => (t._id === id ? response.data.data : t))
      );
      toast.success('Task updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.error || 'Failed to update task');
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await taskAPI.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error.error || 'Failed to delete task');
      throw error;
    }
  }, []);

  // ================== Resource Functions ==================

  const fetchResources = useCallback(async (params = {}) => {
    setLoading(prev => ({ ...prev, resources: true }));
    try {
      const response = await resourceAPI.getAll(params);
      setResources(response.data.data);
      return response.data;
    } catch (error) {
      toast.error(error.error || 'Failed to fetch resources');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, resources: false }));
    }
  }, []);

  const createResource = useCallback(async (data) => {
    try {
      const response = await resourceAPI.create(data);
      setResources(prev => [...prev, response.data.data]);
      toast.success('Resource created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.error || 'Failed to create resource');
      throw error;
    }
  }, []);

  const updateResource = useCallback(async (id, data) => {
    try {
      const response = await resourceAPI.update(id, data);
      setResources(prev =>
        prev.map(r => (r._id === id ? response.data.data : r))
      );
      toast.success('Resource updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.error || 'Failed to update resource');
      throw error;
    }
  }, []);

  const deleteResource = useCallback(async (id) => {
    try {
      await resourceAPI.delete(id);
      setResources(prev => prev.filter(r => r._id !== id));
      toast.success('Resource deleted successfully');
    } catch (error) {
      toast.error(error.error || 'Failed to delete resource');
      throw error;
    }
  }, []);

  // ================== Dashboard Functions ==================

  const fetchDashboardData = useCallback(async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    try {
      const response = await dashboardAPI.getOverview();
      setDashboardData(response.data.data);
      return response.data.data;
    } catch (error) {
      toast.error(error.error || 'Failed to fetch dashboard data');
      throw error;
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, []);

  // Context value
  const value = {
    // State
    projects,
    tasks,
    resources,
    dashboardData,
    loading,
    
    // Project functions
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    
    // Task functions
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    
    // Resource functions
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
    
    // Dashboard functions
    fetchDashboardData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
