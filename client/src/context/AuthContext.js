import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on app start
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data.data);
        setIsAuthenticated(true);
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
      }
    }
    setIsInitialized(true);
  };

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await authAPI.login(credentials);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Set user state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      const errorMessage = error.error || 'Login failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Set user state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      toast.success('Account created successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error.error || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call success
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully!');
    }
  };

  // Forgot password function - sends OTP
  const forgotPassword = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.forgotPassword(data);
      toast.success('Verification code sent to your email!');
      return response.data; // { success, message, email, otp?, previewUrl? }
    } catch (error) {
      const errorMessage = error.error || 'Failed to send verification code. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(data);
      toast.success('Code verified successfully!');
      return response.data; // { success, message, resetToken }
    } catch (error) {
      const errorMessage = error.error || 'Invalid or expired code. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (resetToken, data) => {
    setLoading(true);
    try {
      const response = await authAPI.resetPassword(resetToken, data);
      
      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Set user state
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      toast.success('Password reset successful!');
      return response.data;
    } catch (error) {
      const errorMessage = error.error || 'Password reset failed. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update user details
  const updateUserDetails = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.updateDetails(data);
      setUser(response.data.data);
      toast.success('Profile updated successfully!');
      return response.data.data;
    } catch (error) {
      const errorMessage = error.error || 'Failed to update profile. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (data) => {
    setLoading(true);
    try {
      const response = await authAPI.updatePassword(data);
      toast.success('Password updated successfully!');
      return response.data;
    } catch (error) {
      const errorMessage = error.error || 'Failed to update password. Please try again.';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated,
    isInitialized,
    
    // Methods
    login,
    register,
    logout,
    forgotPassword,
    verifyOTP,
    resetPassword,
    updateUserDetails,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthProvider;