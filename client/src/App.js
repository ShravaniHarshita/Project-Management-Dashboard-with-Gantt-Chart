import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Route Components
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';

// Pages
import {
  Dashboard,
  Projects,
  ProjectDetails,
  GanttChart,
  Resources,
  Tasks,
  Profile,
  Settings,
  HelpSupport,
  Login,
  Register,
  ForgotPassword,
  ResetPassword
} from './pages';

// Context
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

// Styles
import './App.css';

// Layout component for authenticated pages
const AuthenticatedLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <Navbar
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />

        {/* Page Content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  // Force light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="app-root">
            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#FFFFFF',
                  color: '#111827',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } />
              <Route path="/reset-password/:resetToken" element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } />

              {/* Protected Routes */}
              <Route path="/" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/projects" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Projects />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/projects/:id" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <ProjectDetails />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/gantt" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <GanttChart />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/gantt/:projectId" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <GanttChart />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/resources" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Resources />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/tasks" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Tasks />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/settings" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <Settings />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />
              <Route path="/help" element={
                <PrivateRoute>
                  <AuthenticatedLayout>
                    <HelpSupport />
                  </AuthenticatedLayout>
                </PrivateRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
