@echo off
echo ================================================
echo   Testing Indian Navy Question Bank Services
echo ================================================
echo.

echo Testing Database...
docker exec indian_navy_postgres pg_isready -U postgres -d question_bank
if %errorlevel% == 0 (
    echo ✓ Database: HEALTHY
    docker exec indian_navy_postgres psql -U postgres -d question_bank -c "SELECT COUNT(*) as question_count FROM questions;"
) else (
    echo ✗ Database: NOT READY
)

echo.
echo Testing Backend API...
echo Health Check:
curl -s http://localhost:8000/health | python -m json.tool 2>nul
if %errorlevel% == 0 (
    echo ✓ Backend API: HEALTHY
) else (
    echo ✗ Backend API: NOT RESPONDING
)

echo.
echo API Endpoints Test:
curl -s http://localhost:8000/get-all-questions | python -c "import sys, json; data=json.load(sys.stdin); print(f'✓ Questions API: {len(data.get(\"questions\", []))} questions found')" 2>nul

echo.
echo Testing Frontend...
curl -s -I http://localhost:3000 | findstr "200 OK" >nul
if %errorlevel% == 0 (
    echo ✓ Frontend: RESPONDING
) else (
    echo ✗ Frontend: NOT RESPONDING
)

echo.
echo ================================================
echo   Service URLs
echo ================================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo Database: localhost:5432
echo.

pause
