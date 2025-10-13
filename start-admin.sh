#!/bin/bash

# Start Admin Panel Backend Server
echo "🚀 Starting Blocksense Admin Panel Backend Server..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to backend directory
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the server
echo "🔧 Starting server on port 3000..."
echo "📱 Admin Panel will be available at: http://localhost:3000/../admin.html?secret=YOUR_SECRET_HERE"
echo "🔗 Backend API will be available at: http://localhost:3000/api/admin/add-call"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js
