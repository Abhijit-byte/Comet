# CosmosTrace - Django Version

A production-ready Django application for real-time NEO (Near-Earth Object) monitoring with user authentication, customizable alerts, and containerized deployment.

## Features

### Core Features
- **Real-Time Asteroid Data**: Live data from NASA's NEO API
- **Asteroid Search**: Find and track specific asteroids (Eros, Apophis, Bennu, etc.)
- **Close Approach Tracking**: Monitor upcoming asteroid approaches to Earth
- **Risk Analysis**: Analyze hazardous asteroids and their potential threat levels

### User Features
- **User Authentication**: Secure JWT-based authentication
- **Watched Asteroids**: Save favorite asteroids for quick access
- **Custom Alerts**: Set personalized alert parameters for notifications
- **Alert Notifications**: Real-time notifications via email and dashboard
- **User Dashboard**: Personal statistics and upcoming approach notifications
- **WebSocket Support**: Real-time notification delivery via WebSocket

### System Features
- **Scheduled Tasks**: Automated data fetching and alert checking via Celery
- **Email Notifications**: Send alerts via email with detailed information
- **Database Persistence**: Store user data, alerts, and notification history
- **Admin Interface**: Comprehensive Django admin panel for management
- **API Documentation**: Full REST API with JWT authentication
- **Docker Deployment**: Complete containerized setup with docker-compose

## Tech Stack

### Backend
- **Django 4.2.7** - Web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support
- **Celery** - Task scheduling and background jobs
- **PostgreSQL** - Primary database
- **Redis** - Caching and message broker

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Gunicorn** - Production WSGI server
- **Daphne** - ASGI server for WebSocket support
- **nginx** - Reverse proxy (optional)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git
- NASA API Key (provided)

### Step 1: Clone and Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Step 2: Start Services

```bash
# Build and start all services
docker-compose up -d

# Initialize database
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Load initial data (optional)
docker-compose exec web python manage.py loaddata initial_data
```

### Step 3: Access Application

- **API**: http://localhost:8000/api/
- **Admin**: http://localhost:8000/admin/
- **Health Check**: http://localhost:8000/health/

## Project Structure

```
cosmic_watch/
├── django_project/
│   ├── cosmic_watch/          # Project settings
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # URL routing
│   │   ├── asgi.py            # WebSocket configuration
│   │   ├── wsgi.py            # Production WSGI
│   │   ├── celery.py          # Celery configuration
│   │   └── health.py          # Health check endpoint
│   ├── tracker/               # Main application
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API views
│   │   ├── serializers.py     # DRF serializers
│   │   ├── tasks.py           # Celery tasks
│   │   ├── consumers.py       # WebSocket consumers
│   │   ├── urls.py            # App URLs
│   │   └── admin.py           # Admin interface
│   ├── templates/             # HTML templates
│   └── manage.py              # Django management
├── docker-compose.yml         # Service orchestration
├── Dockerfile                 # Container definition
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
└── README.md                 # This file
```

## Database Models

### Asteroid
Stores asteroid information from NASA API
- `nasa_id`: Unique identifier
- `name`: Asteroid name
- `diameter_min/max`: Physical dimensions
- `is_potentially_hazardous`: Hazard classification
- `orbital_data`: Orbital parameters

### CloseApproach
Tracks close approach events
- `asteroid`: Foreign key to Asteroid
- `approach_date`: When the asteroid approaches
- `miss_distance_km`: Distance of closest approach
- `relative_velocity_kmps`: Velocity relative to Earth

### UserAsteroidWatch
User's watched asteroids
- `user`: Foreign key to User
- `asteroid`: Foreign key to Asteroid
- `notes`: User's custom notes

### AlertConfiguration
User's alert preferences
- `user`: Foreign key to User
- `alert_type`: Type of alert (distance, hazard, velocity)
- `min_distance_km`: Minimum approach distance
- `min_velocity_kmps`: Minimum velocity threshold
- `notification_method`: Email, dashboard, or both

### Notification
Stores notification messages
- `user`: Recipient
- `close_approach`: Related approach event
- `title`: Notification title
- `message`: Full message text
- `status`: Pending, sent, failed, read
- `scheduled_for`: When to send

## API Endpoints

### Authentication
```bash
# Register
POST /api/auth/register/
{
  "username": "researcher1",
  "email": "user@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}

# Login
POST /api/auth/token/
{
  "username": "researcher1",
  "password": "securepass123"
}

# Refresh Token
POST /api/auth/token/refresh/
{
  "refresh": "your_refresh_token"
}
```

### Asteroids
```bash
# List asteroids
GET /api/asteroids/

# Get asteroid details
GET /api/asteroids/{id}/

# Upcoming approaches
GET /api/asteroids/upcoming-approaches/?days=7

# Hazardous only
GET /api/asteroids/hazardous/

# Search by name
GET /api/asteroids/?search=Eros
```

### Watched Asteroids
```bash
# Get watched list
GET /api/watched-asteroids/

# Add to watch
POST /api/watched-asteroids/
{
  "asteroid_id": 433
}

# Remove from watch
DELETE /api/watched-asteroids/{id}/
```

### Alerts & Notifications
```bash
# Get alert config
GET /api/alerts/config/

# Update alert config
PUT /api/alerts/config/
{
  "alert_type": "distance",
  "min_distance_km": 10000000,
  "notification_method": "both"
}

# Get notifications
GET /api/notifications/

# Mark as read
POST /api/notifications/{id}/mark_as_read/

# Unread count
GET /api/notifications/unread_count/
```

### Dashboard
```bash
# Dashboard stats
GET /api/dashboard/stats/
```

## Celery Tasks

Automatic background jobs:

1. **fetch_asteroids_data** (Every hour)
   - Fetches latest asteroid data from NASA API
   - Updates database with new close approaches

2. **check_and_notify_close_approaches** (Every 30 minutes)
   - Checks for upcoming close approaches
   - Creates notifications based on user preferences

3. **send_pending_notifications** (Every 5 minutes)
   - Sends queued notifications via email
   - Updates notification status

4. **cleanup_old_notifications** (Daily)
   - Removes old read notifications (>30 days)
   - Maintains database performance

### Monitoring Celery
```bash
# View active tasks
docker-compose exec web celery -A cosmic_watch inspect active

# View registered tasks
docker-compose exec web celery -A cosmic_watch inspect registered

# View worker stats
docker-compose exec web celery -A cosmic_watch inspect stats
```

## Real-Time WebSocket Notifications

Connect to WebSocket for live updates:

```javascript
const token = 'your_jwt_token';
const socket = new WebSocket(
  `ws://localhost:8000/ws/notifications/?token=${token}`
);

socket.onopen = () => {
  console.log('Connected to notifications');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'notification') {
    console.log(`Alert: ${data.title}`);
    console.log(`${data.message}`);
  }
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = () => {
  console.log('Disconnected from notifications');
};
```

## Configuration

### Environment Variables

See `.env.example` for all available variables:

```env
# Django Settings
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=cosmic_watch
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_PASSWORD=your_redis_password

# NASA API
NASA_API_KEY=BtS3sRoAXOeRx0YS8M5EjFUYvblVAJd6CZy3mulD

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

## Development

### Local Setup (without Docker)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python django_project/manage.py migrate

# Create superuser
python django_project/manage.py createsuperuser

# Start development server
python django_project/manage.py runserver

# In another terminal, start Celery worker
celery -A cosmic_watch worker -l info
```

### Running Tests

```bash
# Run all tests
docker-compose exec web python manage.py test

# Run specific app tests
docker-compose exec web python manage.py test tracker

# With coverage
docker-compose exec web coverage run manage.py test
docker-compose exec web coverage report
```

## Production Deployment

### Using AWS

1. **RDS PostgreSQL**: Replace local database
2. **ElastiCache Redis**: Replace local Redis
3. **ECS/Fargate**: Deploy containerized services
4. **ALB**: Load balancer for web service
5. **CloudWatch**: Monitoring and logging

### Using DigitalOcean

1. Deploy Docker containers to App Platform
2. Use Managed Database for PostgreSQL
3. Use Redis as managed service
4. Configure custom domain with SSL

### Using Heroku

```bash
# Create app
heroku create cosmic-watch

# Add buildpacks
heroku buildpacks:add heroku/python
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set SECRET_KEY=your_key
heroku config:set NASA_API_KEY=your_key

# Deploy
git push heroku main
```

## Troubleshooting

### Database Errors
```bash
# Check database connection
docker-compose exec db psql -U postgres -d cosmic_watch -c "SELECT 1"

# View database logs
docker-compose logs db
```

### Celery Issues
```bash
# Check Celery worker status
docker-compose exec web celery -A cosmic_watch inspect ping

# Clear all tasks
docker-compose exec redis redis-cli FLUSHALL

# Restart worker
docker-compose restart celery_worker
```

### WebSocket Issues
- Check Redis is running: `docker-compose ps`
- Verify Daphne is installed: Check requirements.txt
- Test WebSocket: Use browser DevTools Network tab

### Memory Issues
- Increase Docker resource limits
- Reduce Celery concurrency
- Enable database query caching

## Performance Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f web
docker-compose logs -f celery_worker
docker-compose logs -f db
```

### Database Performance
```bash
# Check slow queries
docker-compose exec db psql -U postgres -d cosmic_watch \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10"
```

### API Response Times
Use Django Debug Toolbar in development or check response headers.

## Security

- JWT tokens expire after 1 hour
- Refresh tokens valid for 24 hours
- Password validation enforced
- CORS properly configured
- SQL injection prevention via ORM
- CSRF protection on state-changing operations
- Secure password hashing with PBKDF2

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/awesome-feature`
3. Make changes and commit: `git commit -am 'Add awesome feature'`
4. Push to branch: `git push origin feature/awesome-feature`
5. Submit pull request

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review Django admin: http://localhost:8000/admin/
3. Test API with curl or Postman
4. Review documentation in DJANGO_DEPLOYMENT.md

## License

MIT License - See LICENSE file for details

## Changelog

### v1.0.0 (Initial Release)
- User authentication with JWT
- Asteroid data from NASA API
- Custom alert system
- Email notifications
- Dashboard with statistics
- WebSocket real-time notifications
- Celery background tasks
- Docker containerization
- Admin interface
