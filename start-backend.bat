@echo off
echo Starting Indian Navy Question Bank Backend...
echo.
echo Prerequisites:
echo 1. Docker is running PostgreSQL database
echo 2. Python environment with required packages
echo.

cd /d "%~dp0backend"

echo Installing required packages...
pip install -r requirements.txt

echo.
echo Starting FastAPI server...
echo API will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo Health Check: http://localhost:8000/health
echo.

python -m uvicorn backend_server:app --host 0.0.0.0 --port 8000 --reload

pause
