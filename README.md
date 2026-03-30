# Project Management Dashboard

A comprehensive, full-stack Project Management Dashboard with Interactive Gantt Chart Visualization. Built with React.js, Node.js, Express.js, and MongoDB.

---

## 📚 **START HERE: [📖 Documentation Guide](./DOCUMENTATION_INDEX.md)**

**New to this project?** Choose your setup path:
- ⚡ [5-minute Windows Quick Start](./QUICK_START_WINDOWS.md)
- 📖 [Complete Setup Guide](./SETUP_GUIDE.md) (All platforms)
- 📸 [Visual Setup Guide](./VISUAL_GUIDE.md) (See expected outputs)

---

![Dashboard Preview](./docs/dashboard-preview.png)

## 🚀 Features

### Core Features
- **Interactive Dashboard** - Real-time KPIs, charts, and project statistics
- **Project Management** - Create, update, and track projects with detailed information
- **Task Management** - Manage tasks with dependencies, milestones, and progress tracking
- **Gantt Chart Visualization** - Interactive timeline view using dhtmlx-gantt
- **Resource Management** - Track team members, skills, and workload utilization
- **Dark Mode** - Full dark/light theme support

### Advanced Features
- Drag-and-drop task scheduling in Gantt chart
- Task dependencies and milestone markers
- Resource utilization tracking
- Project completion auto-calculation
- Responsive design for all devices
- Real-time notifications

## 🛠 Tech Stack

### Frontend
- **React.js 18** - UI library
- **React Router v6** - Navigation
- **Chart.js & react-chartjs-2** - Data visualization
- **dhtmlx-gantt** - Gantt chart component
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **date-fns** - Date utilities
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
project-management-dashboard/
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── common/         # Reusable components
│       │   │   ├── Badge.js
│       │   │   ├── Loading.js
│       │   │   ├── Modal.js
│       │   │   └── ProgressBar.js
│       │   └── layout/         # Layout components
│       │       ├── Navbar.js
│       │       └── Sidebar.js
│       ├── context/
│       │   └── AppContext.js   # Global state management
│       ├── pages/              # Page components
│       │   ├── Dashboard.js
│       │   ├── Projects.js
│       │   ├── ProjectDetails.js
│       │   ├── Tasks.js
│       │   ├── GanttChart.js
│       │   └── Resources.js
│       ├── services/
│       │   └── api.js          # API client
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       └── index.css
│
├── server/                     # Express backend
│   ├── config/
│   │   └── db.js               # Database connection
│   ├── controllers/            # Route handlers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── projectController.js
│   │   ├── resourceController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   └── errorHandler.js     # Error handling
│   ├── models/                 # Mongoose schemas
│   │   ├── Project.js
│   │   ├── Resource.js
│   │   ├── Task.js
│   │   └── User.js
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── taskRoutes.js
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── errorResponse.js
│   │   └── seedData.js         # Database seeder
│   └── server.js               # Entry point
│
├── .env.example                # Environment template
├── package.json                # Dependencies & scripts
└── README.md
```

## 🚀 Getting Started

### ⚡ Quick Start (5 minutes)

For **complete step-by-step setup instructions**, please read the [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) file. It includes:
- System requirements
- Node.js installation
- MongoDB configuration (Atlas or Local)
- .env file setup
- Running both servers
- Troubleshooting

### Prerequisites

- **Node.js** (v16 or higher) - [Install Guide](./SETUP_GUIDE.md#-system-requirements)
- **MongoDB** (v5 or higher) - [Configuration Guide](./SETUP_GUIDE.md#-configuration)
- **npm** (v7 or higher - comes with Node.js)

### Quick Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd project-management-dashboard

# 2. Install dependencies
npm install && cd client && npm install && cd ..

# 3. Create .env file (see SETUP_GUIDE.md for details)
# Add your MongoDB URI and other configuration

# 4. Start backend server (Terminal 1)
npm start

# 5. Start frontend server (Terminal 2)
cd client && npm start

# 6. Open in browser
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/api
```

### 📖 Detailed Setup Instructions

👉 **[Read SETUP_GUIDE.md for complete instructions](./SETUP_GUIDE.md)**

This guide covers:
- Installing Node.js on Windows, macOS, and Linux
- Setting up MongoDB Atlas (cloud) or Local MongoDB
- Configuring environment variables
- Running the application
- Troubleshooting common issues
- Using the application features

---

## 🗂️ Quick Reference

### Project URLs
| Component | URL | Default Port |
|-----------|-----|--------------|
| Frontend (React) | http://localhost:3000 | 3000 |
| Backend (API) | http://localhost:5000/api | 5000 |

### Common Commands
| Command | Purpose |
|---------|---------|
| `npm install` | Install root dependencies |
| `cd client && npm install` | Install frontend dependencies |
| `npm start` | Start backend server |
| `cd client && npm start` | Start frontend server |
| `npm run dev` | Run both servers (requires concurrently) |
| `npm run seed` | Seed database with sample data |
| `npm run build` | Build production-ready frontend |

### Environment Files
| File | Purpose |
|------|---------|
| `.env` | **Your configuration** (create this) |
| `.env.example` | **Template** for `.env` file |

## ☁️ Backend Cloud Deployment
This project separates frontend and backend deployments.

### Recommended flow
1. Deploy the backend to a Node-friendly service like **Render**, **Railway**, or **Heroku**.
2. Deploy the frontend to **Vercel** (already configured with `vercel.json`).
3. Set the frontend environment variable:
   - `REACT_APP_API_URL=https://<your-backend-domain>/api`

### Backend deployment files included
- `Dockerfile` — container image for Node backend
- `.dockerignore` — exclude local files from Docker build
- `Procfile` — start command for Heroku/Render

### Backend environment variables
Set these values in your cloud host before starting the backend:
- `PORT=5000`
- `NODE_ENV=production`
- `MONGODB_URI=<your-mongodb-atlas-uri>`
- `JWT_SECRET=<your-secret-key>`
- `JWT_EXPIRE=30d`
- `CLIENT_URL=https://<your-frontend-domain>`
- `EMAIL_SERVICE=gmail`
- `EMAIL_FROM=<your-email>`
- `EMAIL_PASSWORD=<your-email-password>`

### Render / Railway setup
- Connect your GitHub repo
- Choose Node.js service
- Use `npm install` as the build command
- Use `npm start` as the start command
- Add the environment variables above

### Vercel configuration for frontend
In Vercel, add:
- `REACT_APP_API_URL=https://<your-backend-domain>/api`

The frontend will then call the backend using `process.env.REACT_APP_API_URL || '/api'`.

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
```http
POST   /auth/register     # Register user
POST   /auth/login        # Login user
GET    /auth/me           # Get current user
POST   /auth/logout       # Logout user
PUT    /auth/updatedetails # Update user details
PUT    /auth/updatepassword # Update password
```

### Projects
```http
GET    /projects          # Get all projects
GET    /projects/:id      # Get single project
POST   /projects          # Create project
PUT    /projects/:id      # Update project
DELETE /projects/:id      # Delete project
GET    /projects/stats    # Get project statistics
```

### Tasks
```http
GET    /tasks             # Get all tasks
GET    /tasks/:id         # Get single task
POST   /tasks             # Create task
PUT    /tasks/:id         # Update task
DELETE /tasks/:id         # Delete task
GET    /tasks/project/:projectId     # Get tasks by project
GET    /tasks/gantt/:projectId       # Get tasks in Gantt format
GET    /tasks/stats       # Get task statistics
POST   /tasks/reorder     # Reorder tasks
```

### Resources
```http
GET    /resources         # Get all resources
GET    /resources/:id     # Get single resource
POST   /resources         # Create resource
PUT    /resources/:id     # Update resource
DELETE /resources/:id     # Delete resource
GET    /resources/utilization  # Get utilization stats
GET    /resources/available    # Get available resources
```

### Dashboard
```http
GET    /dashboard/overview  # Get dashboard overview
GET    /dashboard/kpis      # Get KPIs
GET    /dashboard/timeline  # Get timeline data
```

### Request/Response Examples

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete website overhaul",
  "startDate": "2025-01-15",
  "endDate": "2025-04-15",
  "status": "In Progress",
  "priority": "High",
  "manager": "John Smith",
  "budget": 50000,
  "tags": ["web", "design"],
  "color": "#4F46E5"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Website Redesign",
    "completionPercentage": 0,
    "daysRemaining": 90,
    ...
  }
}
```

## 🎨 UI Features

### Dashboard
- KPI cards showing key metrics
- Doughnut chart for task status distribution
- Bar chart for project progress comparison
- Recent activities list
- Upcoming deadlines

### Projects Page
- Project cards with progress indicators
- Search and filter functionality
- Create/Edit modal with validation

### Project Details
- Project overview with stats
- Task list with inline progress updates
- Quick links to Gantt view

### Gantt Chart
- Interactive timeline visualization
- Zoom levels (Hours/Days/Weeks/Months)
- Drag-and-drop task scheduling
- Task dependencies visualization
- Color-coded status indicators
- Milestone markers

### Resources
- Resource cards with utilization
- Skills tags
- Availability status
- Department filtering

### Tasks
- List view with sortable columns
- Kanban board view
- Multiple filter options
- Cross-project task management

## 🔧 Configuration

### Database Indexes
The application creates the following indexes for optimal performance:
- Projects: `status`, `priority`, `endDate`
- Tasks: `projectId`, `status`, `assignedResource`, `endDate`
- Resources: `email` (unique), `availability`

### Customization
- Modify `client/src/index.css` for global styles
- Update color themes in CSS variables
- Configure Gantt settings in `GanttChart.js`

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests (if configured)
npm test
```

## 📦 Building for Production

```bash
# Build the frontend
cd client && npm run build

# The backend will serve the static files from client/build
NODE_ENV=production npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [dhtmlx-gantt](https://dhtmlx.com/docs/products/dhtmlxGantt/) - Gantt chart library
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [React Icons](https://react-icons.github.io/react-icons/) - Icon library
- [date-fns](https://date-fns.org/) - Date utilities

## 📞 Support

For support, email support@example.com or create an issue in this repository.

---

Made with ❤️ by Your Team
