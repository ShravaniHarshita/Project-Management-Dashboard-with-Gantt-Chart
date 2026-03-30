import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Loading from './Loading';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useContext(AuthContext);

  // Show loading while checking authentication status
  if (!isInitialized) {
    return <Loading />;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render the public component (login, register, etc.)
  return children;
};

export default PublicRoute;