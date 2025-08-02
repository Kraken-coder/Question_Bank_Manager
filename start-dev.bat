@echo off
echo Starting Question Bank Management System...
echo.

echo Starting Backend Server...
cd backend
start cmd /k "uvicorn backend_server:app --reload --port 8000"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Development Server...
cd ..\frontend
start cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:8000
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this script (servers will continue running)
pause > nul
