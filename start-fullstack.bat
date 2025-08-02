@echo off
echo ================================================
echo   Indian Navy Question Bank - Full Stack Setup
echo ================================================
echo.

echo Stopping any existing containers...
docker-compose down

echo.
echo Removing any existing containers and images...
docker-compose down --rmi all --volumes --remove-orphans

echo.
echo Building and starting all services...
echo This may take several minutes on first run...
echo.

docker-compose up --build -d

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak > nul

echo.
echo Checking service status...
docker-compose ps

echo.
echo ================================================
echo   Services Status Check
echo ================================================

echo.
echo Testing Database Connection...
docker exec indian_navy_postgres pg_isready -U postgres -d question_bank
if %errorlevel% == 0 (
    echo ✓ Database is ready
) else (
    echo ✗ Database connection failed
)

echo.
echo Testing Backend API...
timeout /t 5 /nobreak > nul
curl -s http://localhost:8000/health > nul
if %errorlevel% == 0 (
    echo ✓ Backend API is responding
) else (
    echo ✗ Backend API not responding
)

echo.
echo Testing Frontend...
curl -s http://localhost:3000 > nul
if %errorlevel% == 0 (
    echo ✓ Frontend is responding
) else (
    echo ✗ Frontend not responding yet (may take a few more minutes)
)

echo.
echo ================================================
echo   Access Points
echo ================================================
echo.
echo Frontend Application:    http://localhost:3000
echo Backend API:             http://localhost:8000
echo API Documentation:       http://localhost:8000/docs
echo Database:                localhost:5432
echo.
echo ================================================
echo   Useful Commands
echo ================================================
echo.
echo View logs (all):         docker-compose logs
echo View backend logs:       docker-compose logs backend
echo View frontend logs:      docker-compose logs frontend
echo View database logs:      docker-compose logs postgres
echo Stop all services:       docker-compose down
echo Restart services:        docker-compose restart
echo.

echo Press any key to view live logs...
pause > nul
docker-compose logs -f
