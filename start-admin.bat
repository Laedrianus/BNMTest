@echo off
echo 🚀 Starting Blocksense Admin Panel Backend Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the server
echo 🔧 Starting server on port 3000...
echo 📱 Admin Panel will be available at: http://localhost:3000/../admin.html?secret=YOUR_SECRET_HERE
echo 🔗 Backend API will be available at: http://localhost:3000/api/admin/add-call
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js
