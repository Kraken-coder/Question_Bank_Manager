# Docker Setup - Working Solution

## Current Status ✅

The Docker setup has been successfully configured with the following working solution:

### What's Working:
- ✅ PostgreSQL database container with automatic schema initialization
- ✅ Database connection from host machine
- ✅ Schema initialization with sample data
- ✅ Volume persistence for database data

### What's Partially Working:
- ⚠️ Backend Docker container (NumPy compatibility issues with ChromaDB)

## Quick Start (Recommended Approach)

### 1. Start Database with Docker
```bash
cd c:\Users\dipta\Downloads\projects\indianNavy
docker-compose -f docker-compose-db-only.yml up -d
```

### 2. Start Backend Locally
```bash
# Option A: Use the batch script
start-backend.bat

# Option B: Manual steps
cd backend
pip install -r requirements.txt
python -m uvicorn backend_server:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Verify Everything is Working
- Database: `docker ps` (should show running postgres container)
- Backend: http://localhost:8000/health
- API Docs: http://localhost:8000/docs

## Database Access

### Connection Details:
- **Host**: localhost
- **Port**: 5432
- **Database**: question_bank
- **Username**: postgres
- **Password**: diptanshu

### Direct Database Access:
```bash
# Connect to database
docker exec -it indian_navy_postgres psql -U postgres -d question_bank

# View tables
\dt

# View sample data
SELECT * FROM questions LIMIT 5;
SELECT * FROM tags LIMIT 10;
```

## Docker Commands

### Database Management:
```bash
# Start database only
docker-compose -f docker-compose-db-only.yml up -d

# Stop database
docker-compose -f docker-compose-db-only.yml down

# View database logs
docker logs indian_navy_postgres

# Reset database (removes all data)
docker-compose -f docker-compose-db-only.yml down -v
```

### Full Docker Setup (if you want to fix the backend container):
```bash
# Try the full setup (may have issues)
docker-compose up -d

# If backend fails, check logs
docker logs indian_navy_backend

# Rebuild backend
docker-compose build --no-cache backend
```

## Troubleshooting

### Issue: Backend Container Fails to Start
**Cause**: NumPy 2.0 compatibility issues with ChromaDB
**Solution**: Run backend locally instead of in container

### Issue: Database Connection Refused
**Solutions**:
1. Check if PostgreSQL container is running: `docker ps`
2. Wait a few seconds after starting for initialization
3. Check logs: `docker logs indian_navy_postgres`

### Issue: Port Already in Use
**Solutions**:
1. Stop existing services on port 5432
2. Or change port in docker-compose-db-only.yml

## Files Created:

### Docker Configuration:
- `docker-compose.yml` - Full setup (backend container has issues)
- `docker-compose-db-only.yml` - Database only (✅ Working)
- `backend/Dockerfile` - Backend container definition
- `database/init.sql` - Database schema initialization

### Helper Scripts:
- `start-backend.bat` - Windows batch script to start backend locally
- `.env.example` - Environment variables template

### Documentation:
- `DOCKER_README.md` - Comprehensive Docker documentation
- `DOCKER_SETUP_STATUS.md` - This status file

## Next Steps

1. **For Development**: Use the database-only Docker setup + local backend
2. **For Production**: Fix NumPy/ChromaDB compatibility or use alternative vector database
3. **For Team**: Share the `start-backend.bat` script for easy local development

## Environment Variables

The backend supports these environment variables:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=question_bank
DB_USER=postgres
DB_PASSWORD=diptanshu
```

## Sample Data

The database initializes with sample questions for testing:
- Geography question (Easy)
- Physics question (Medium) 
- Naval equipment question (Hard)

Each with appropriate tags and solutions.
