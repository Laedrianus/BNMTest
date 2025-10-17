@echo off
setlocal

REM Start Backend on port 3000
cd /d "%~dp0backend"

if not exist node_modules (
  echo Installing backend dependencies...
  npm install
)

echo Starting backend on http://localhost:3000
set PORT=3000
node server.js

endlocal
