# Cosmic Watch Django Deployment Guide

## Overview
This guide covers deploying the Cosmic Watch Django application with Docker, PostgreSQL, Redis, Celery, and WebSocket support.

## Prerequisites
- Docker and Docker Compose installed
- NASA API Key (already provided)
- PostgreSQL (via Docker)
- Redis (via Docker)
- Python 3.11+ (for local development)

## Quick Start with Docker

### 1. Clone and Setup
```bash
cd django_project
cp .env.example .env
# Edit .env with your configuration
```

### 2. Build and Run
```bash
docker-compose up -d
```

This starts:
- PostgreSQL Database (port 5432)
- Redis Cache (port 6379)
- Django Web Application (port 8000)
- Celery Worker (background tasks)
- Celery Beat (scheduled tasks)

### 3. Initialize Database
```bash
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
docker-compose exec web python manage.py loaddata initial_data
```

### 4. Access Application
- API: http://localhost:8000/api/
- Admin: http://localhost:8000/admin/
- WebSocket: ws://localhost:8000/ws/notifications/

## Detailed Setup

### Environment Variables

Create `.env` file in project root:

```env
# Django
DEBUG=False
SECRET_KEY=your-secure-random-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com

# Database
DB_NAME=cosmic_watch
DB_USER=postgres
DB_PASSWORD=secure_password
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_PASSWORD=secure_redis_password

# NASA API
NASA_API_KEY=BtS3sRoAXOeRx0YS8M5EjFUYvblVAJd6CZy3mulD

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Celery
CELERY_BROKER_URL=redis://:secure_redis_password@redis:6379/0
CELERY_RESULT_BACKEND=redis://:secure_redis_password@redis:6379/0
```

### Database Migrations

```bash
# Create migrations
docker-compose exec web python manage.py makemigrations

# Apply migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser
```

### Static Files

```bash
# Collect static files
docker-compose exec web python manage.py collectstatic --noinput
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/token/` - Login and get JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User Management
- `GET /api/user/profile/` - Get user profile
- `PUT /api/user/profile/` - Update user profile

### Asteroids
- `GET /api/asteroids/` - List all asteroids
- `GET /api/asteroids/{id}/` - Get asteroid details
- `GET /api/asteroids/upcoming-approaches/` - Get upcoming approaches
- `GET /api/asteroids/hazardous/` - Get hazardous asteroids

### Watched Asteroids
- `GET /api/watched-asteroids/` - Get user's watched asteroids
- `POST /api/watched-asteroids/` - Add asteroid to watch
- `DELETE /api/watched-asteroids/{id}/` - Remove from watch list

### Alerts & Notifications
- `GET /api/alerts/config/` - Get alert configuration
- `PUT /api/alerts/config/` - Update alert configuration
- `GET /api/notifications/` - Get user notifications
- `POST /api/notifications/{id}/mark_as_read/` - Mark notification as read
- `POST /api/notifications/mark_all_as_read/` - Mark all as read

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## Alert System

### How Alerts Work
1. User sets alert preferences (distance, velocity, hazard level)
2. Celery Beat task runs every 30 minutes
3. Checks upcoming close approaches against user preferences
4. Creates notifications for matching asteroids
5. Sends notifications via email and/or dashboard

### Alert Configuration Options

```python
{
    "alert_type": "distance",  # or "hazard", "velocity", "all"
    "min_distance_km": 10000000,
    "max_distance_km": 100000000,
    "min_velocity_kmps": 0,
    "min_days_notice": 1,
    "notification_method": "both",  # or "email", "dashboard"
    "hazard_only": false,
    "enabled": true
}
```

## WebSocket Notifications

### Real-Time Notification Connection

```javascript
const socket = new WebSocket('ws://localhost:8000/ws/notifications/');

socket.onopen = (event) => {
    console.log('Connected to notifications');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Notification:', data);
};

socket.send(JSON.stringify({
    type: 'mark_as_read',
    notification_id: 123
}));
```

## Celery Tasks

### Background Jobs
1. **fetch_asteroids_data** - Every hour: Fetch latest asteroid data from NASA API
2. **check_and_notify_close_approaches** - Every 30 minutes: Check for upcoming approaches
3. **send_pending_notifications** - Every 5 minutes: Send queued notifications
4. **cleanup_old_notifications** - Daily: Clean up old read notifications

### Monitoring Tasks

```bash
# View Celery logs
docker-compose logs celery_worker

# View Celery Beat logs
docker-compose logs celery_beat

# Connect to Celery shell
docker-compose exec web celery -A cosmic_watch shell
```

## Production Deployment

### Using Gunicorn + Nginx

1. Update `settings.py` for production:
```python
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

2. Use Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws/ {
        proxy_pass http://web:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Scaling Workers

Edit `docker-compose.yml`:
```yaml
web:
  deploy:
    replicas: 3

celery_worker:
  deploy:
    replicas: 2
```

## Troubleshooting

### Database Connection Issues
```bash
# Check database status
docker-compose exec db pg_isready

# Connect to database
docker-compose exec db psql -U postgres -d cosmic_watch
```

### Redis Connection Issues
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

### Celery Issues
```bash
# Restart Celery worker
docker-compose restart celery_worker

# View Celery tasks
docker-compose exec celery_worker celery -A cosmic_watch inspect active
```

### WebSocket Issues
- Ensure Daphne is running (should be automatic with docker-compose)
- Check Redis connection for channel layer
- Review browser console for WebSocket errors

## Monitoring & Logging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f celery_worker
docker-compose logs -f db
```

### Health Checks
```bash
# Check web service health
curl http://localhost:8000/health/

# Check database
docker-compose exec db pg_isready

# Check Redis
docker-compose exec redis redis-cli ping
```

## Backup & Recovery

### Database Backup
```bash
docker-compose exec db pg_dump -U postgres cosmic_watch > backup.sql
```

### Database Restore
```bash
docker-compose exec db psql -U postgres cosmic_watch < backup.sql
```

## Performance Optimization

1. **Enable Redis Caching**: Update settings to cache API responses
2. **Database Indexing**: Existing indexes on commonly queried fields
3. **Connection Pooling**: Use pgBouncer for PostgreSQL connections
4. **CDN**: Serve static files through CloudFront or similar
5. **Rate Limiting**: Implement API rate limiting with Django REST framework

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Set DEBUG = False
- [ ] Use HTTPS/SSL
- [ ] Secure ALLOWED_HOSTS
- [ ] Use strong database password
- [ ] Use strong Redis password
- [ ] Limit CORS origins
- [ ] Enable CSRF protection
- [ ] Use secure session cookies
- [ ] Rotate NASA API key periodically
- [ ] Enable database backups
- [ ] Monitor error logs

## Getting Help

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review Django admin: http://localhost:8000/admin/
3. Test API endpoints: Use Postman or curl
4. Check WebSocket connection in browser console
