import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import {
  HiOutlineArrowLeft,
  HiOutlineZoomIn,
  HiOutlineZoomOut,
  HiOutlineCalendar,
} from 'react-icons/hi';
import { projectAPI, taskAPI } from '../services/api';
import { Loading } from '../components/common';
import toast from 'react-hot-toast';
import './GanttChart.css';

const GanttChart = () => {
  const { projectId } = useParams();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();
  const ganttContainer = useRef(null);
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState('Days');

  // Zoom configurations
  const zoomLevels = [
    { name: 'Hours', scale_height: 60, min_column_width: 30, scales: [
      { unit: 'day', format: '%d %M' },
      { unit: 'hour', format: '%H:00' }
    ]},
    { name: 'Days', scale_height: 60, min_column_width: 70, scales: [
      { unit: 'month', format: '%F %Y' },
      { unit: 'day', format: '%d %D' }
    ]},
    { name: 'Weeks', scale_height: 60, min_column_width: 70, scales: [
      { unit: 'month', format: '%F %Y' },
      { unit: 'week', format: 'Week #%W' }
    ]},
    { name: 'Months', scale_height: 60, min_column_width: 70, scales: [
      { unit: 'year', format: '%Y' },
      { unit: 'month', format: '%F' }
    ]}
  ];

  // Initialize Gantt
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let ganttResponse;
        
        if (projectId) {
          const [projectRes, tasksRes] = await Promise.all([
            projectAPI.getById(projectId),
            taskAPI.getGanttTasks(projectId),
          ]);
          setProject(projectRes.data.data);
          ganttResponse = tasksRes.data;
        } else {
          const tasksRes = await taskAPI.getGanttTasks();
          ganttResponse = tasksRes.data;
        }

        // Configure Gantt
        configureGantt();

        // Initialize Gantt
        gantt.init(ganttContainer.current);

        // Parse data - ensure proper format
        const chartData = ganttResponse.data ? ganttResponse : { data: [], links: [] };
        gantt.parse(chartData);

        setLoading(false);
      } catch (error) {
        console.error('Gantt Error:', error);
        toast.error('Failed to load Gantt chart data');
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup
    return () => {
      gantt.clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Configure Gantt settings
  const configureGantt = () => {
    // Basic configuration
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.xml_date = '%Y-%m-%d';
    gantt.config.drag_resize = true;
    gantt.config.drag_progress = true;
    gantt.config.drag_links = true;
    gantt.config.details_on_dblclick = false;
    gantt.config.round_dnd_dates = true;
    gantt.config.grid_resize = true;
    gantt.config.autosize = 'y';
    gantt.config.autofit = true;
    gantt.config.fit_tasks = true;
    gantt.config.show_progress = true;
    gantt.config.show_links = true;
    gantt.config.row_height = 40;
    gantt.config.bar_height = 24;
    gantt.config.scale_height = 60;

    // Column configuration
    gantt.config.columns = [
      { name: 'text', label: 'Task Name', tree: true, width: 200, resize: true },
      { name: 'start_date', label: 'Start', align: 'center', width: 90, resize: true },
      { name: 'duration', label: 'Days', align: 'center', width: 50, resize: true },
      { name: 'progress', label: 'Progress', align: 'center', width: 60, template: (task) => {
        return Math.round(task.progress * 100) + '%';
      }, resize: true },
    ];

    // Apply initial zoom
    const currentZoom = zoomLevels.find(z => z.name === zoomLevel);
    if (currentZoom) {
      gantt.config.scale_height = currentZoom.scale_height;
      gantt.config.min_column_width = currentZoom.min_column_width;
      gantt.config.scales = currentZoom.scales;
    }

    // Task styling based on status
    gantt.templates.task_class = (start, end, task) => {
      let classes = [];
      
      if (task.status === 'Completed') {
        classes.push('task-completed');
      } else if (task.status === 'In Progress') {
        classes.push('task-in-progress');
      } else if (task.status === 'Delayed') {
        classes.push('task-delayed');
      } else if (task.status === 'Not Started') {
        classes.push('task-not-started');
      }

      if (task.priority === 'Critical') {
        classes.push('priority-critical');
      } else if (task.priority === 'High') {
        classes.push('priority-high');
      }

      if (task.milestone) {
        classes.push('task-milestone');
      }

      return classes.join(' ');
    };

    // Tooltip template
    gantt.templates.tooltip_text = (start, end, task) => {
      return `
        <b>${task.text}</b><br/>
        <b>Start:</b> ${gantt.templates.tooltip_date_format(start)}<br/>
        <b>End:</b> ${gantt.templates.tooltip_date_format(end)}<br/>
        <b>Progress:</b> ${Math.round(task.progress * 100)}%<br/>
        ${task.status ? `<b>Status:</b> ${task.status}<br/>` : ''}
        ${task.assignedTo ? `<b>Assigned:</b> ${task.assignedTo}<br/>` : ''}
      `;
    };

    // Link styling
    gantt.templates.link_class = (link) => {
      return '';
    };

    // Event handlers
    gantt.attachEvent('onTaskDrag', (id, mode, task, original) => {
      // Could add validation here
      return true;
    });

    gantt.attachEvent('onAfterTaskDrag', async (id, mode, e) => {
      const task = gantt.getTask(id);
      try {
        // Use the task's _id or id field
        const taskId = task._id || task.id;
        
        let updateData = {};
        
        // Handle different types of drag operations
        if (mode === 'move' || mode === 'resize') {
          // Calculate dates properly
          const startDate = new Date(task.start_date);
          const endDate = new Date(task.start_date);
          endDate.setDate(startDate.getDate() + (task.duration || 1));
          
          // Ensure endDate is after startDate
          if (endDate <= startDate) {
            endDate.setDate(startDate.getDate() + 1);
          }
          
          updateData = {
            startDate: startDate.toISOString().split('T')[0], // Send as YYYY-MM-DD
            endDate: endDate.toISOString().split('T')[0], // Send as YYYY-MM-DD
          };
        }
        
        // Only include progress if it was actually changed
        if (mode === 'progress') {
          updateData.progress = Math.round(task.progress * 100);
        }
        
        // Don't send empty updates
        if (Object.keys(updateData).length === 0) {
          return;
        }
        
        await taskAPI.update(taskId, updateData);
        toast.success('Task updated successfully');
      } catch (error) {
        console.error('Task update error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update task';
        toast.error(errorMessage);
        // Refresh the gantt chart to revert changes
        gantt.clearAll();
        const tasksRes = await taskAPI.getGanttTasks(projectId);
        const chartData = tasksRes.data.data ? tasksRes.data : { data: [], links: [] };
        gantt.parse(chartData);
      }
    });

    gantt.attachEvent('onAfterLinkAdd', async (id, link) => {
      try {
        await taskAPI.update(link.target, {
          dependencyTaskId: link.source
        });
        toast.success('Task dependency updated');
      } catch (error) {
        toast.error('Failed to add dependency');
        gantt.deleteLink(id);
      }
    });
  };

  // Handle zoom
  const handleZoom = (direction) => {
    const currentIndex = zoomLevels.findIndex(z => z.name === zoomLevel);
    let newIndex;
    
    if (direction === 'in' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'out' && currentIndex < zoomLevels.length - 1) {
      newIndex = currentIndex + 1;
    } else {
      return;
    }

    const newZoom = zoomLevels[newIndex];
    setZoomLevel(newZoom.name);
    
    gantt.config.scale_height = newZoom.scale_height;
    gantt.config.min_column_width = newZoom.min_column_width;
    gantt.config.scales = newZoom.scales;
    gantt.render();
  };

  // Select zoom level
  const selectZoomLevel = (level) => {
    const zoom = zoomLevels.find(z => z.name === level);
    if (zoom) {
      setZoomLevel(level);
      gantt.config.scale_height = zoom.scale_height;
      gantt.config.min_column_width = zoom.min_column_width;
      gantt.config.scales = zoom.scales;
      gantt.render();
    }
  };

  if (loading) {
    return <Loading text="Loading Gantt chart..." />;
  }

  return (
    <div className="gantt-page">
      {/* Header */}
      <div className="gantt-header">
        <div className="gantt-header-left">
          <Link to={projectId ? `/projects/${projectId}` : '/projects'} className="back-link">
            <HiOutlineArrowLeft /> {projectId ? 'Back to Project' : 'Back to Projects'}
          </Link>
          <h1>
            <HiOutlineCalendar />
            {project ? `${project.name} - Gantt Chart` : 'All Projects - Gantt Chart'}
          </h1>
        </div>
        
        <div className="gantt-controls">
          <div className="zoom-controls">
            <button 
              className="zoom-btn" 
              onClick={() => handleZoom('in')}
              title="Zoom In"
            >
              <HiOutlineZoomIn />
            </button>
            <div className="zoom-level-selector">
              {zoomLevels.map(level => (
                <button
                  key={level.name}
                  className={`zoom-level-btn ${zoomLevel === level.name ? 'active' : ''}`}
                  onClick={() => selectZoomLevel(level.name)}
                >
                  {level.name}
                </button>
              ))}
            </div>
            <button 
              className="zoom-btn" 
              onClick={() => handleZoom('out')}
              title="Zoom Out"
            >
              <HiOutlineZoomOut />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="gantt-legend">
        <div className="legend-item">
          <span className="legend-color not-started"></span>
          <span>Not Started</span>
        </div>
        <div className="legend-item">
          <span className="legend-color in-progress"></span>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <span className="legend-color completed"></span>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <span className="legend-color delayed"></span>
          <span>Delayed</span>
        </div>
        <div className="legend-item">
          <span className="legend-color milestone"></span>
          <span>Milestone</span>
        </div>
      </div>

      {/* Gantt Container */}
      <div className="gantt-container" ref={ganttContainer}></div>
    </div>
  );
};

export default GanttChart;
