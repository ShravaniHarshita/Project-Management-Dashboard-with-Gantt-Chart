# 📸 Visual Setup Guide - What You Should See

This guide shows you **exactly what your screen should look like** at each step of the setup process.

---

## Step 1: Node.js Installation

### Command:
```powershell
winget install OpenJS.NodeJS
```

### Expected Output:
```
Found Node.js [OpenJS.NodeJS] Version 25.8.1
This application is licensed to you by its owner.
Microsoft is not responsible for, nor does it grant any licenses to, third-party
packages.

Downloading https://nodejs.org/dist/v25.8.1/node-v25.8.1-x64.msi
████████████████████████████  31.8 MB / 31.8 MB

Successfully verified installer hash
Starting package install...
The installer will request to run as administrator. Expect a prompt.
Successfully installed
```

### Verify:
```powershell
node --version
npm --version
```

### Expected Result:
```
v25.8.1
11.11.0
```

✅ **If you see version numbers, Node.js is installed correctly!**

---

## Step 2: Installing Dependencies

### Command 1: Root Dependencies
```powershell
cd "path\to\project-management-dashboard"
npm install
```

### Expected Output (will take 1-2 minutes):
```
up to date, audited 219 packages in 2s

34 packages are looking for funding
run `npm fund` for details

2 vulnerabilities (1 moderate, 1 high)
```

⚠️ **Warnings are OK! Errors are NOT OK.**

### Command 2: Client Dependencies
```powershell
cd client
npm install
cd ..
```

### Expected Output (will take 2-3 minutes):
```
removed 1 package, and audited 1532 packages in 9s

272 packages are looking for funding
run `npm fund` for details

30 vulnerabilities (9 low, 4 moderate, 17 high)
```

✅ **If both complete successfully, you're good!**

---

## Step 3: Create .env File

### File Location:
```
project-management-dashboard/
├── .env          ← Create it here
├── server/
├── client/
└── package.json
```

### File Content:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=super_secret_key_12345
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

✅ **File created successfully when you can see it in the folder**

---

## Step 4: Start Backend Server

### Command:
```powershell
npm start
```

### Expected Output (wait ~10 seconds):
```
🔗 Connecting to MongoDB...

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Server running in development mode                  ║
║   📡 Port: 5000                                           ║
║   🌐 URL: http://localhost:5000                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

⚠️ Local MongoDB not available. Starting in-memory MongoDB...
✅ In-Memory MongoDB Connected: 127.0.0.1
📝 Note: Data will not persist after server restart
🌱 Seeding sample data...
✅ Sample data seeded successfully!
   - 4 resources
   - 4 projects
   - 10 tasks
✅ Email service: Using Ethereal test account
```

✅ **If you see these messages, your backend is working!**

### Common Startup Issues:

**Issue: "Error: listen EADDRINUSE: address already in use :::5000"**
```
Solution: Port 5000 is in use
Run: Get-NetTCPConnection -LocalPort 5000 | Stop-Process -Force
```

**Issue: "MongoDB connection failed"**
```
Solution: Check your .env MONGODB_URI
It will fall back to in-memory database
Try again with correct credentials
```

---

## Step 5: Start Frontend Server

### Command (in NEW terminal):
```powershell
cd "project-management-dashboard\client"
npm start
```

### Expected Output (wait ~20-30 seconds):
```
> project-management-client@0.1.0 start
> react-scripts start

(node:12345) [DEP_WEBPACK_DEV_SERVER_ON_AFTER_SETUP_MIDDLEWARE] DeprecationWarning:
'onAfterSetupMiddleware' option is deprecated. Please use the 'setupMiddlewares' option.
(Use `node --trace-deprecation` to suppress this warning.)

Starting the development server...

Compiled successfully!

You can now view project-management-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://10.123.76.46:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled successfully
```

✅ **If you see "Compiled successfully!", your frontend is ready!**

### Common Frontend Issues:

**Issue: "Something is already running on port 3000"**
```
Solution: Kill the process on port 3000
Run: Get-NetTCPConnection -LocalPort 3000 | Stop-Process -Force
Restart npm start
```

**Issue: "not found: npm"**
```
Solution: You're in the wrong directory
Make sure you're in the client folder
Run: cd client
Then: npm start
```

---

## Step 6: Open Browser

### Navigate to:
```
http://localhost:3000
```

### What You Should See:

#### Page 1: Login/Register
```
┌─────────────────────────────────────┐
│   PROJECT MANAGEMENT DASHBOARD      │
│                                     │
│   Welcome!                          │
│                                     │
│   Email: [________________]         │
│   Password: [________________]      │
│                                     │
│   [ Login ]  [ Sign Up ]            │
│                                     │
│   Forgot Password?                  │
└─────────────────────────────────────┘
```

✅ **If you see the login page, everything works!**

---

## Step 7: Register & Login

### Click "Sign Up"

### Fill in:
```
Full Name: John Doe
Email: john.doe@example.com
Password: MySecurePassword123
Confirm Password: MySecurePassword123

[ Register ]
```

### Expected Result:
```
✅ Registration successful!
↓ (redirects to login)
```

### Login:
```
Email: john.doe@example.com
Password: MySecurePassword123

[ Login ]
```

### What You Should See After Login:

#### Dashboard Page
```
┌─────────────────────────────────────────┐
│  Menu  | Dashboard | Projects | Tasks   │
├─────────────────────────────────────────┤
│                                         │
│   Welcome, John Doe!                    │
│                                         │
│   Projects: 4                           │
│   Tasks: 10                             │
│   Resources: 4                          │
│                                         │
│   [Recent Activities]  [Statistics]     │
│                                         │
└─────────────────────────────────────────┘
```

✅ **Congratulations! The application is fully running!**

---

## Terminal Views

### Backend Terminal (Should show):
```
✅ Listening on port 5000
✅ MongoDB connected
✅ All routes initialized
```

### Frontend Terminal (Should show):
```
✅ Compiled successfully!
✅ webpack compiled
```

### Browser:
```
✅ Website loads without errors
✅ Can register/login
✅ Can see dashboard
```

---

## Verification Checklist

After all steps complete, verify:

| Item | Status | Check |
|------|--------|-------|
| Node.js installed | ✅ | `node --version` shows v16+ |
| npm installed | ✅ | `npm --version` shows v7+ |
| Dependencies installed | ✅ | No errors during `npm install` |
| .env file created | ✅ | File exists in root folder |
| Backend running | ✅ | Terminal shows "Server running on :5000" |
| Frontend running | ✅ | Terminal shows "Compiled successfully!" |
| Browser loads | ✅ | http://localhost:3000 opens login |
| Can register | ✅ | Sign up form works |
| Can login | ✅ | Dashboard appears |

---

## ✅ All Steps Complete!

If everything appears as described, your Project Management Dashboard is **fully operational** and ready to use! 🎉

---

## ❌ Something Looks Different?

Check the [**SETUP_GUIDE.md**](./SETUP_GUIDE.md) Troubleshooting section for:
- Port already in use
- MongoDB connection issues
- Dependency installation problems
- Common error messages and solutions

---

**Happy dashboard managing!** 📊
