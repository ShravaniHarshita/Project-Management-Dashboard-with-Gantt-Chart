# 🚀 Project Management Dashboard - Complete Setup Guide

This guide provides **step-by-step instructions** to set up and run the Project Management Dashboard application on your local machine.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Accessing the Dashboard](#accessing-the-dashboard)
7. [Troubleshooting](#troubleshooting)
8. [Common Commands](#common-commands)

---

## ✅ Prerequisites

Before you start, ensure you have:
- A Windows/Mac/Linux computer
- Administrator access to install software
- An internet connection
- A MongoDB Atlas account (free tier available)

---

## 💻 System Requirements

| Component | Requirement |
|-----------|-------------|
| **Node.js** | v16 or higher (v25.8.1 recommended) |
| **npm** | v7 or higher (installed with Node.js) |
| **MongoDB** | v5 or higher (Cloud Atlas recommended) |
| **RAM** | Minimum 2GB available |
| **Disk Space** | ~1GB for node_modules and dependencies |
| **Browser** | Chrome, Firefox, Safari, or Edge (latest version) |

---

## 🔧 Installation Steps

### Step 1: Install Node.js

#### For Windows:
1. **Open PowerShell** or Command Prompt
2. **Run the installer command:**
   ```powershell
   winget install OpenJS.NodeJS
   ```
   *Or download from https://nodejs.org/ and install manually*

3. **Verify installation:**
   ```powershell
   node --version
   npm --version
   ```
   You should see version numbers like `v25.8.1` and `11.11.0`

#### For macOS:
```bash
brew install node
```

#### For Linux:
```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

---

### Step 2: Clone/Download the Project

1. **Navigate to your desired location:**
   ```powershell
   cd Desktop
   ```

2. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd project-management-dashboard
   ```

   OR if you already have the folder, navigate to it:
   ```powershell
   cd "project-management-dashboard"
   ```

---

### Step 3: Install Dependencies

#### Step 3a: Install Root Dependencies
```powershell
npm install
```
This installs backend dependencies (usually ~219 packages)

**Expected output:**
```
added 219 packages in X.XXs
```

#### Step 3b: Install Client Dependencies
```powershell
cd client
npm install
cd ..
```
This installs frontend dependencies (usually ~1532 packages)

**Expected output:**
```
added 1532 packages in X.XXs
```

---

## ⚙️ Configuration

### Step 4: Set Up MongoDB

#### Option A: MongoDB Atlas (Cloud - Recommended for Beginners)

1. **Go to MongoDB Atlas:**
   - Visit https://cloud.mongodb.com
   - Click "Sign Up" and create a free account

2. **Create a Free Cluster:**
   - Click "Build a Database"
   - Select "Free" tier
   - Choose a region closer to you
   - Complete the setup process

3. **Set Up Authentication:**
   - Go to Database Access
   - Create a database user with username and password
   - Save your credentials (you'll need them!)

4. **Create Connection String:**
   - Go to Database Deployment
   - Click "Connect"
   - Select "Drivers"
   - Copy the connection string
   - **Replace `<password>` with your database password**

   Example format:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
   ```

#### Option B: Local MongoDB

1. **Download MongoDB:**
   - Visit https://www.mongodb.com/try/download/community
   - Download the installer for your OS

2. **Install MongoDB:**
   - Run the installer
   - Follow the installation wizard
   - Choose "Install MongoDB as a Service"

3. **Start MongoDB Service:**
   - Windows: Open Services and start "MongoDB"
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

4. **Connection String:**
   ```
   mongodb://localhost:27017/project_management_db
   ```

---

### Step 5: Create and Configure .env File

1. **In the root project folder, create a `.env` file:**
   ```bash
   # On Windows (PowerShell)
   New-Item -Path .\.env -ItemType File
   
   # Or on macOS/Linux
   touch .env
   ```

2. **Open `.env` in a text editor** and add:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # MongoDB Configuration (replace with your actual MongoDB URL)
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?appName=Cluster0

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=30d

   # Client URL (for CORS)
   CLIENT_URL=http://localhost:3000

   # Email Configuration (optional for development)
   EMAIL_SERVICE=gmail
   EMAIL_FROM=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   ```

3. **Replace the values:**
   - Replace `your_username:your_password@cluster0.xxxxx` with your MongoDB connection string
   - Keep `JWT_SECRET` as is or create your own
   - Email fields can be left as is for testing

4. **Save the file**

---

## ▶️ Running the Application

### Step 6: Start the Backend Server

In a **PowerShell** or **terminal window**:

```powershell
# Navigate to project root (if not already there)
cd "project-management-dashboard"

# Start the backend server
npm start
```

**Wait for these messages:**
```
🚀 Server running in development mode
📡 Port: 5000
🌐 URL: http://localhost:5000

✅ MongoDB Connected
✅ Sample data seeded successfully!
```

⚠️ **Keep this terminal window open!**

---

### Step 7: Start the Frontend Server

**Open a NEW terminal/PowerShell window:**

```powershell
# Navigate to the project's client folder
cd "project-management-dashboard\client"

# Start the React development server
npm start
```

**Wait for this message:**
```
Compiled successfully!

You can now view project-management-client in the browser.

Local:            http://localhost:3000
```

⚠️ **Keep this terminal window open too!**

---

## 🌐 Accessing the Dashboard

### Step 8: Open in Browser

1. **Open your web browser**
   - Chrome, Firefox, Safari, or Edge

2. **Navigate to:**
   ```
   http://localhost:3000
   ```

3. **You should see the login page**

---

### Step 9: Create Your Account

1. **Click "Sign Up" or "Register"**

2. **Fill in the registration form:**
   - Full Name: Your name
   - Email: Your email address
   - Password: A strong password (minimum 6 characters)
   - Confirm Password: Re-enter your password

3. **Click "Register"**

4. **You'll be redirected to login page**

5. **Log in with your credentials**

6. **Welcome! 🎉** You're now in the dashboard

---

## 📊 Exploring the Application

Once logged in, you can:

### Dashboard
- View project statistics
- Monitor task progress
- Check resource utilization
- See real-time KPIs

### Projects
- Create new projects
- Edit project details
- View project timeline
- Track project status

### Tasks
- Create and assign tasks
- Set deadlines and dependencies
- Mark tasks complete
- View task status

### Gantt Chart
- Visualize project timeline
- Drag and drop tasks
- Set task dependencies
- View critical path

### Resources
- Manage team members
- Track skills and availability
- View resource workload
- Allocate resources

### Profile & Settings
- Update user profile
- Change password
- Customize theme (dark/light mode)
- Manage preferences

---

## 🔧 Troubleshooting

### Issue 1: "node: command not found"
**Solution:**
- Node.js is not installed or not in PATH
- Reinstall Node.js from https://nodejs.org/
- Restart your terminal after installation

### Issue 2: "EADDRINUSE: address already in use :::5000"
**Solution:**
- Port 5000 is already in use
- Kill the process: 
  ```powershell
  Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
  ```
- Or change PORT in `.env` to 5001

### Issue 3: "EADDRINUSE: address already in use :::3000"
**Solution:**
- Port 3000 is already in use
- Kill the process:
  ```powershell
  Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
  ```

### Issue 4: "MongoDB connection failed"
**Solution:**
- Check if MongoDB is running
- Verify connection string in `.env`
- For MongoDB Atlas: ensure IP whitelist includes your IP
- Check internet connection

### Issue 5: "Cannot GET http://localhost:3000"
**Solution:**
- Frontend server didn't start properly
- Check for errors in the terminal
- Ensure you ran `npm start` in the client folder
- Try clearing cache: `cd client && npm cache clean --force`

### Issue 6: "npm ERR! ENOENT: no such file or directory"
**Solution:**
- You're in the wrong directory
- Must be in the main project folder for root commands
- Must be in `client` folder for client commands
- Verify with: `ls` or `dir` command

### Issue 7: White screen on browser
**Solution:**
- Wait 30 seconds for React to fully compile
- Check browser console for errors (F12)
- Ensure backend is running (check terminal)
- Clear browser cache and refresh (Ctrl+Shift+Delete)

---

## 📝 Common Commands

### Development Commands
```powershell
# Start both frontend and backend
npm run dev

# Start only backend
npm start

# Start only frontend
cd client && npm start

# Seed database with sample data
npm run seed
```

### Installation Commands
```powershell
# Install all dependencies
npm run install-all

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

### Build Commands
```powershell
# Create production build
npm run build

# Build frontend only
cd client && npm run build
```

### Utility Commands
```powershell
# Check npm version
npm --version

# Check Node.js version
node --version

# List installed packages
npm list

# Clear npm cache
npm cache clean --force
```

---

## 🛑 Stopping the Application

To stop the servers:

1. **In backend terminal:** Press `Ctrl + C`
2. **In frontend terminal:** Press `Ctrl + C`
3. **Type:** `Y` and press Enter when asked

---

## 🎯 Next Steps

After successfully running the application:

1. **Explore Features**
   - Create test projects
   - Add tasks and resources
   - Try the Gantt chart
   - Test different features

2. **Customize**
   - Update project settings
   - Modify theme preferences
   - Set up email notifications

3. **Production Deployment**
   - Refer to deployment documentation
   - Set up HTTPS
   - Configure domain
   - Set up monitoring

---

## ❓ Getting Help

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Review error messages** in the terminal
3. **Check browser console** (F12 > Console tab)
4. **Verify all prerequisites** are installed
5. **Ensure MongoDB is running** and accessible

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Mongoose Documentation](https://mongoosejs.com)

---

## ✅ Checklist

Before reporting an issue, verify:
- [ ] Node.js v16+ is installed
- [ ] npm 7+ is installed
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file created with correct MongoDB URL
- [ ] MongoDB is running and accessible
- [ ] Port 5000 and 3000 are not in use
- [ ] Both servers are running in separate terminals
- [ ] No firewall is blocking localhost access
- [ ] Browser is up to date

---

**Happy Project Managing! 🚀**
