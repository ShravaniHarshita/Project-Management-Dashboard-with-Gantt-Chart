# 🚀 Quick Start Guide for Windows Users

This is a **5-minute setup guide** for Windows users to get the Project Management Dashboard running.

---

## 📋 Prerequisites

- Windows 10/11
- Administrator access
- Internet connection

---

## Step 1: Install Node.js (2 minutes)

1. **Open PowerShell** (Right-click → Run as Administrator)

2. **Run this command:**
   ```powershell
   winget install OpenJS.NodeJS
   ```

3. **Verify installation** (close and reopen PowerShell):
   ```powershell
   node --version
   npm --version
   ```

✅ You should see version numbers like `v25.8.1` and `11.11.0`

---

## Step 2: Setup Project Folder (1 minute)

1. **Navigate to your project:**
   ```powershell
   cd "project-management-dashboard"
   ```

2. **Install all dependencies:**
   ```powershell
   npm install
   cd client
   npm install
   cd ..
   ```

⏳ This takes 2-5 minutes. Get a coffee! ☕

---

## Step 3: Configure MongoDB (1 minute)

### Option A: Use MongoDB Atlas (Cloud - No Installation)

1. **Get your MongoDB URL:**
   - Go to https://cloud.mongodb.com
   - Create free account → Create cluster → Get connection string
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0`

### Option B: Use Local MongoDB

1. **Download MongoDB:**
   ```powershell
   winget install MongoDB.Server
   ```

2. **Connection string:**
   ```
   mongodb://localhost:27017/project_management_db
   ```

---

## Step 4: Create Configuration File (1 minute)

1. **Create `.env` file in project root:**
   ```powershell
   New-Item -Path .\.env -ItemType File
   ```

2. **Open `.env` in Notepad or VS Code:**
   ```powershell
   notepad .env
   ```

3. **Paste this content** (replace with your MongoDB URL):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
   JWT_SECRET=super_secret_key_12345
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000
   EMAIL_SERVICE=gmail
   EMAIL_FROM=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

4. **Save and close** (Ctrl+S)

---

## Step 5: Start the Servers (1 minute)

### Terminal 1: Start Backend

```powershell
npm start
```

Wait for this message:
```
🚀 Server running in development mode
📡 Port: 5000
✅ MongoDB Connected
```

✅ **Keep this terminal open!**

### Terminal 2: Start Frontend

**Open a NEW PowerShell window:**

```powershell
cd "project-management-dashboard\client"
npm start
```

Wait for this message:
```
Compiled successfully!
Local: http://localhost:3000
```

✅ **Keep this terminal open too!**

---

## Step 6: Open in Browser (30 seconds)

1. **Go to:** `http://localhost:3000`
2. **Click "Sign Up"**
3. **Create your account**
4. **Login and enjoy!** 🎉

---

## 📋 Checklist

- [ ] Node.js installed (`node --version` works)
- [ ] Project dependencies installed (`npm install` completed)
- [ ] `.env` file created with MongoDB URL
- [ ] Backend started on port 5000
- [ ] Frontend started on port 3000
- [ ] Browser shows login page at http://localhost:3000

---

## 🔧 Quick Fixes

### "node command not found"
```powershell
# Restart PowerShell as Administrator
```

### "Port 5000 already in use"
```powershell
Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
```

### "Port 3000 already in use"
```powershell
Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
```

### "MongoDB connection failed"
- Verify MongoDB URL in `.env`
- Check internet connection
- For Atlas: Ensure IP is whitelisted (set to 0.0.0.0/0)

---

## ❌ Stop the Application

Press `Ctrl + C` in each terminal window and type `Y` to confirm.

---

## 📚 Need More Help?

Read the full **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** for:
- Detailed MongoDB setup
- Troubleshooting
- Available commands
- Feature explanations

---

**That's it! You're ready to use Project Management Dashboard.** ✨
