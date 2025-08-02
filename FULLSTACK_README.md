# 🚀 Indian Navy Question Bank - Full Stack Docker Setup

Complete Docker Compose setup for the Indian Navy Question Bank application with PostgreSQL database, FastAPI backend, and React frontend.

## 📋 Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git (for cloning the repository)
- At least 4GB RAM available for Docker
- Ports 3000, 8000, and 5432 available

## 🏃‍♂️ Quick Start

### 1. **One-Click Setup**
```bash
# Run the automated setup script
start-fullstack.bat
```

### 2. **Manual Setup**
```bash
# Start all services
docker-compose up --build -d

# Check status
docker-compose ps

# Test services
test-services.bat
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React application |
| **Backend API** | http://localhost:8000 | FastAPI server |
| **API Documentation** | http://localhost:8000/docs | Interactive API docs |
| **Database** | localhost:5432 | PostgreSQL database |

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    Frontend     │◄──►│     Backend     │◄──►│   PostgreSQL    │
│   (React)       │    │   (FastAPI)     │    │   Database      │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 5432    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Services

### 🗄️ Database (PostgreSQL)
- **Image**: postgres:14
- **Port**: 5432
- **Database**: question_bank
- **User**: postgres
- **Password**: diptanshu
- **Features**:
  - Automatic schema initialization
  - Health checks
  - Data persistence
  - Sample data included

### 🔧 Backend (FastAPI)
- **Technology**: Python 3.10 + FastAPI
- **Port**: 8000
- **Features**:
  - RESTful API endpoints
  - Question management (CRUD)
  - Vector database integration
  - File upload and processing
  - PDF/Excel/Word export
  - Health monitoring

### 🎨 Frontend (React)
- **Technology**: Node.js 18 + React
- **Port**: 3000
- **Features**:
  - Modern UI components
  - Question filtering and search
  - Statistics dashboard
  - File export functionality
  - Real-time updates

## 📁 Project Structure

```
indianNavy/
├── docker-compose.yml          # Main Docker Compose file
├── docker-compose.prod.yml     # Production configuration
├── .env                        # Environment variables
├── start-fullstack.bat         # Automated setup script
├── test-services.bat          # Service testing script
├── database/
│   └── init.sql               # Database schema and sample data
├── backend/
│   ├── Dockerfile             # Backend container config
│   ├── requirements.txt       # Python dependencies
│   ├── backend_server.py      # FastAPI application
│   ├── database_manager.py    # Database operations
│   └── ...                    # Other backend files
└── frontend/
    ├── Dockerfile             # Frontend container config
    ├── package.json           # Node.js dependencies
    ├── src/                   # React source code
    └── ...                    # Other frontend files
```

## 🔧 Configuration

### Environment Variables

Create or modify `.env` file:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=question_bank
DB_USER=postgres
DB_PASSWORD=your_password_here

# API
GOOGLE_API_KEY=your_google_api_key

# Frontend
REACT_APP_API_URL=http://localhost:8000
NODE_ENV=development
```

## 📝 Common Commands

### Development
```bash
# Start all services in development mode
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Database Operations
```bash
# Access PostgreSQL directly
docker-compose exec postgres psql -U postgres -d question_bank

# Check database tables
docker-compose exec postgres psql -U postgres -d question_bank -c "\dt"

# View sample questions
docker-compose exec postgres psql -U postgres -d question_bank -c "SELECT * FROM questions LIMIT 5;"
```

### Troubleshooting
```bash
# View service status
docker-compose ps

# Check service health
docker-compose exec postgres pg_isready -U postgres
curl http://localhost:8000/health
curl http://localhost:3000

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend

# Reset everything
docker-compose down --volumes --rmi all
docker-compose up --build -d
```

## 🔍 Health Monitoring

### Automatic Health Checks
- **Database**: `pg_isready` command every 10 seconds
- **Backend**: HTTP health endpoint every 30 seconds
- **Frontend**: HTTP availability check

### Manual Health Check
```bash
# Run comprehensive health check
test-services.bat

# Individual service checks
curl http://localhost:8000/health
curl http://localhost:3000
docker-compose exec postgres pg_isready -U postgres
```

## 🚀 Production Deployment

### Using Production Configuration
```bash
# Create production environment file
cp .env.example .env.production

# Edit production settings
# Set secure passwords, API URLs, etc.

# Deploy with production settings
docker-compose -f docker-compose.prod.yml up -d
```

### Production Checklist
- [ ] Change default passwords
- [ ] Set secure API keys
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Configure database backups
- [ ] Set up monitoring and logging
- [ ] Configure reverse proxy (nginx)

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Change ports in docker-compose.yml if needed
```

#### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Verify database is healthy
docker-compose exec postgres pg_isready -U postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Backend API Issues
```bash
# Check backend logs
docker-compose logs backend

# Check Python dependencies
docker-compose exec backend pip list

# Test database connection from backend
docker-compose exec backend python -c "from database_manager import DatabaseManager; db = DatabaseManager(); print('Connected!')"
```

#### Frontend Issues
```bash
# Check frontend logs
docker-compose logs frontend

# Verify Node.js setup
docker-compose exec frontend npm list

# Check environment variables
docker-compose exec frontend printenv | grep REACT_APP
```

## 📊 Performance Tips

- Allocate at least 4GB RAM to Docker Desktop
- Use Docker volume mounts for better performance
- Enable BuildKit for faster builds:
  ```bash
  set DOCKER_BUILDKIT=1
  set COMPOSE_DOCKER_CLI_BUILD=1
  ```
- Use `.dockerignore` files to reduce build context

## 🆘 Getting Help

1. **Check the logs**: `docker-compose logs`
2. **Run health checks**: `test-services.bat`
3. **Verify environment**: Check `.env` file
4. **Reset everything**: `docker-compose down -v && docker-compose up --build -d`

## 📚 API Documentation

Once the backend is running, visit:
- **Interactive Docs**: http://localhost:8000/docs
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🔐 Security Notes

⚠️ **Important**: This setup is configured for development. For production:
- Change all default passwords
- Use environment-specific configurations
- Set up proper authentication
- Configure HTTPS/SSL
- Implement proper logging and monitoring
