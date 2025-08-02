# Indian Navy Question Bank - Docker Setup

This repository contains a Docker Compose setup for the Indian Navy Question Bank application with PostgreSQL database.

## Quick Start

### Prerequisites
- Docker and Docker Compose installed on your system
- Git (to clone the repository)

### Setup and Run

1. **Clone the repository** (if not already done):
```bash
git clone <your-repo-url>
cd indianNavy
```

2. **Create environment file** (optional):
```bash
cp .env.example .env
# Edit .env file if you want to change default settings
```

3. **Start the services**:
```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL database container
- Automatically initialize the database schema
- Start the FastAPI backend server
- Set up networking between containers

4. **Check if services are running**:
```bash
docker-compose ps
```

5. **Check application health**:
```bash
curl http://localhost:8000/health
```

### Access Points

- **API Backend**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL Database**: localhost:5432
- **Health Check**: http://localhost:8000/health

### Default Database Credentials

- **Database**: question_bank
- **Username**: postgres
- **Password**: diptanshu
- **Host**: localhost (from host machine) / postgres (from containers)
- **Port**: 5432

## Docker Commands

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs postgres
```

### Stop services
```bash
docker-compose down
```

### Stop and remove all data
```bash
docker-compose down -v
```

### Rebuild services
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Access database directly
```bash
docker-compose exec postgres psql -U postgres -d question_bank
```

### Access backend container
```bash
docker-compose exec backend bash
```

## Database Schema

The database is automatically initialized with the following tables:

### Questions Table
- `question_id`: Primary key (auto-increment)
- `question`: Question text
- `difficulty`: Easy/Medium/Hard
- `language`: Default 'English'
- `image_required`: Boolean
- `type`: MCQ/Short Answer/Long Answer/oneword/True-False
- `solution`: Answer/solution text
- `created_at`: Timestamp
- `updated_at`: Timestamp (auto-updated)

### Tags Table
- `id`: Primary key
- `question_id`: Foreign key to questions
- `tag`: Tag text

## Environment Variables

You can customize the setup using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | postgres | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | question_bank | Database name |
| DB_USER | postgres | Database username |
| DB_PASSWORD | diptanshu | Database password |

## Development

### Local Development with Docker

For development, you can mount your local code:

```bash
# Start only the database
docker-compose up -d postgres

# Run backend locally
cd backend
pip install -r requirements.txt
python -m uvicorn backend_server:app --reload --host 0.0.0.0 --port 8000
```

### Debugging

1. **Check container status**:
```bash
docker-compose ps
```

2. **View real-time logs**:
```bash
docker-compose logs -f
```

3. **Check database connection**:
```bash
docker-compose exec postgres pg_isready -U postgres
```

4. **Reset everything**:
```bash
docker-compose down -v
docker-compose up -d
```

## Production Considerations

Before deploying to production:

1. **Change default passwords**
2. **Set up proper SSL/TLS**
3. **Configure proper CORS origins**
4. **Set up database backups**
5. **Use secrets management**
6. **Set up monitoring and logging**

## Troubleshooting

### Common Issues

1. **Port already in use**:
   - Change ports in docker-compose.yml
   - Or stop services using those ports

2. **Database connection fails**:
   - Check if PostgreSQL container is healthy
   - Verify environment variables
   - Check network connectivity

3. **Backend fails to start**:
   - Check backend logs: `docker-compose logs backend`
   - Verify all required Python packages are installed
   - Check file permissions

4. **Schema not initialized**:
   - Remove database volume: `docker-compose down -v`
   - Restart: `docker-compose up -d`

### Getting Help

Check the logs for detailed error messages:
```bash
docker-compose logs backend
docker-compose logs postgres
```
