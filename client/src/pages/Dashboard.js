import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineExclamationCircle,
  HiOutlineUserGroup,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
} from 'react-icons/hi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useApp } from '../context/AppContext';
import { Loading, Badge, getStatusVariant } from '../components/common';
import { format } from 'date-fns';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { dashboardData, fetchDashboardData, loading } = useApp();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading.dashboard || !dashboardData) {
    return <Loading text="Loading dashboard..." />;
  }

  const { summary, taskStatusDistribution, projectProgress, recentActivities, upcomingDeadlines } = dashboardData;

  // KPI Cards Data
  const kpiCards = [
    {
      title: 'Total Projects',
      value: summary.totalProjects,
      icon: HiOutlineFolder,
      color: '#3B82F6',
      bgColor: '#EFF6FF',
    },
    {
      title: 'Total Tasks',
      value: summary.totalTasks,
      icon: HiOutlineClipboardList,
      color: '#8B5CF6',
      bgColor: '#F5F3FF',
    },
    {
      title: 'Completed Tasks',
      value: summary.completedTasks,
      icon: HiOutlineCheckCircle,
      color: '#10B981',
      bgColor: '#ECFDF5',
    },
    {
      title: 'Pending Tasks',
      value: summary.pendingTasks,
      icon: HiOutlineClock,
      color: '#F59E0B',
      bgColor: '#FFFBEB',
    },
    {
      title: 'Delayed Tasks',
      value: summary.delayedTasks,
      icon: HiOutlineExclamationCircle,
      color: '#EF4444',
      bgColor: '#FEF2F2',
    },
    {
      title: 'Resource Utilization',
      value: `${summary.avgResourceUtilization}%`,
      icon: HiOutlineUserGroup,
      color: '#06B6D4',
      bgColor: '#ECFEFF',
    },
  ];

  // Task Status Chart Data
  const taskStatusChartData = {
    labels: taskStatusDistribution.map(item => item.name),
    datasets: [
      {
        data: taskStatusDistribution.map(item => item.value),
        backgroundColor: taskStatusDistribution.map(item => item.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const taskStatusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
    },
    cutout: '70%',
  };

  // Project Progress Chart Data
  const projectProgressChartData = {
    labels: projectProgress.map(p => p.name.substring(0, 15) + (p.name.length > 15 ? '...' : '')),
    datasets: [
      {
        label: 'Completion %',
        data: projectProgress.map(p => p.completionPercentage),
        backgroundColor: '#3B82F6',
        borderRadius: 6,
        barThickness: 20,
      },
    ],
  };

  const projectProgressChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        max: 100,
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's an overview of your projects.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpiCards.map((card, index) => (
          <div key={index} className="stats-card">
            <div
              className="stats-card-icon"
              style={{ backgroundColor: card.bgColor }}
            >
              <card.icon style={{ color: card.color }} />
            </div>
            <div className="stats-card-content">
              <span className="stats-card-title">{card.title}</span>
              <span className="stats-card-value">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Task Status Distribution */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Task Status Distribution</h3>
          </div>
          <div className="chart-wrapper">
            <Doughnut data={taskStatusChartData} options={taskStatusChartOptions} />
          </div>
        </div>

        {/* Project Progress */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Project Progress</h3>
            <Link to="/projects" className="chart-link">View All</Link>
          </div>
          <div className="chart-wrapper">
            <Bar data={projectProgressChartData} options={projectProgressChartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-bottom">
        {/* Recent Activities */}
        <div className="chart-card activity-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Recent Activities</h3>
          </div>
          <ul className="activity-list">
            {recentActivities.slice(0, 6).map((activity, index) => (
              <li key={activity._id || index} className="activity-item">
                <div
                  className="activity-dot"
                  style={{
                    backgroundColor:
                      activity.status === 'Completed'
                        ? '#10B981'
                        : activity.status === 'In Progress'
                        ? '#3B82F6'
                        : activity.status === 'Delayed'
                        ? '#EF4444'
                        : '#6B7280',
                  }}
                />
                <div className="activity-content">
                  <span className="activity-title">{activity.title}</span>
                  <div className="activity-meta">
                    <span>{activity.projectId?.name || 'Unknown Project'}</span>
                    <span>•</span>
                    <span>{activity.updatedAt ? format(new Date(activity.updatedAt), 'MMM d, h:mm a') : 'Recently'}</span>
                  </div>
                </div>
                <Badge variant={getStatusVariant(activity.status)} size="small">
                  {activity.status}
                </Badge>
              </li>
            ))}
          </ul>
        </div>

        {/* Upcoming Deadlines */}
        <div className="chart-card deadlines-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Upcoming Deadlines</h3>
            <HiOutlineCalendar className="header-icon" />
          </div>
          {upcomingDeadlines.length > 0 ? (
            <ul className="deadline-list">
              {upcomingDeadlines.map((task, index) => (
                <li key={task._id || index} className="deadline-item">
                  <div className="deadline-info">
                    <span className="deadline-title">{task.title}</span>
                    <span className="deadline-project">{task.projectId?.name}</span>
                  </div>
                  <div className="deadline-date">
                    <span className="date-value">
                      {task.endDate ? format(new Date(task.endDate), 'MMM d') : 'TBD'}
                    </span>
                    <span className="date-label">Due Date</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state-small">
              <HiOutlineCheckCircle className="empty-icon" />
              <span>No upcoming deadlines</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-icon">
            <HiOutlineTrendingUp />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{summary.inProgressProjects}</span>
            <span className="quick-stat-label">In Progress</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon completed">
            <HiOutlineCheckCircle />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{summary.completedProjects}</span>
            <span className="quick-stat-label">Completed</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon delayed">
            <HiOutlineExclamationCircle />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{summary.delayedProjects}</span>
            <span className="quick-stat-label">Delayed</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon milestone">
            <HiOutlineCalendar />
          </div>
          <div className="quick-stat-content">
            <span className="quick-stat-value">{summary.milestoneTasks}</span>
            <span className="quick-stat-label">Milestones</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
