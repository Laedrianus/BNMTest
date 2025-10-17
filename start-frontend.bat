@echo off
setlocal

REM Start static server on port 8080 from project root
cd /d "%~dp0"

where http-server >nul 2>nul
if %errorlevel% neq 0 (
  echo Installing http-server locally...
  npx http-server -v >nul 2>nul
)

echo Starting frontend on http://127.0.0.1:8080
npx http-server -p 8080 -c-1 .

endlocal
