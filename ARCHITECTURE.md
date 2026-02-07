# Cosmic Watch Architecture

## System Overview

Cosmic Watch is a distributed, scalable Django application for monitoring Near-Earth Objects (NEOs). The system architecture supports real-time data fetching, user alerts, notifications, and a modern REST API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Client Applications                  │
│         (Web Frontend, Mobile App, Third-party)         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway / Load Balancer                 │
│                    (Nginx/ALB)                          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Web Services    │      │  WebSocket       │
│  (Gunicorn)      │      │  (Daphne)        │
│  Port 8000       │      │  Port 8000       │
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         └────────────┬────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
    ┌───────┐   ┌──────────┐   ┌────────┐
    │Django │   │PostgreSQL│   │ Redis  │
    │ ORM   │   │Database  │   │ Broker │
    └───────┘   └──────────┘   └────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐      ┌──────────────────┐
│  Celery Worker   │      │  Celery Beat     │
│  Background      │      │  Scheduler       │
│  Tasks           │      │  (Periodic Tasks)│
└────────┬─────────┘      └────────┬─────────┘
         │                         │
         ├────────────┬────────────┤
         ▼            ▼            ▼
    ┌──────────┐ ┌─────────┐ ┌──────────┐
    │NASA API  │ │Email    │ │Database  │
    │(Fetch    │ │Service  │ │Updates   │
    │Asteroids)│ │(Notify) │ │          │
    └──────────┘ └─────────┘ └──────────┘
```

## Component Architecture

### 1. Web Tier (HTTP/REST)

**Gunicorn WSGI Server**
- Handles HTTP requests
- Loads Django application
- Manages worker processes
- Port: 8000 (internal), 80/443 (public)

**Daphne ASGI Server**
- Handles WebSocket connections
- Real-time bidirectional communication
- Integrated with Django Channels
- Same port as Gunicorn (shared)

### 2. Application Layer (Django)

**Django Framework**
- URL routing (`cosmic_watch/urls.py`)
- Request/response handling
- ORM for database operations
- Admin interface

**Tracker App (`tracker/`)**
- Models: Data representation
- Views: REST API endpoints
- Serializers: JSON serialization
- Tasks: Background job definitions
- Consumers: WebSocket handlers
- Admin: Django admin customization

### 3. Data Layer

**PostgreSQL Database**
- Persistent storage
- ACID compliance
- Full-text search support
- JSON field support

**Database Schema**
```
Users (Django Auth)
├── UserProfile
├── AlertConfiguration
├── Notification
├── UserAsteroidWatch
└── NotificationLog

Asteroids
├── Asteroid (NASA data)
├── CloseApproach (approach events)
└── Orbital data
```

### 4. Message Queue & Cache

**Redis**
- Celery message broker
- Result backend for Celery
- Session caching (optional)
- Rate limiting cache
- WebSocket channel layer

**Celery Workers**
- Background task processing
- Task queue: FIFO with priority
- Automatic retries with backoff
- Task result storage in Redis

**Celery Beat**
- Periodic task scheduler
- Cron-like scheduling
- Database persistence
- Task state tracking

## Data Flow

### User Registration & Authentication

```
Client Request
      ↓
  REST API
      ↓
UserRegistrationView
      ↓
  Django ORM
      ↓
PostgreSQL (User + AlertConfig)
      ↓
JWT Token Response
```

### Asteroid Data Fetching

```
Celery Beat
      ↓
fetch_asteroids_data Task
      ↓
  Request NASA API
      ↓
Process Response
      ↓
  Django ORM
      ↓
PostgreSQL (Insert/Update)
      ↓
Celery Success
```

### Alert & Notification Flow

```
Celery Beat (every 30 min)
      ↓
check_and_notify_close_approaches
      ↓
Query matching alerts from DB
      ↓
Compare with user preferences
      ↓
Create Notification records
      ↓
send_pending_notifications Task
      ├─→ Email Service
      ├─→ WebSocket Broadcast
      └─→ Update DB status
```

### Real-Time Notification Delivery

```
Celery Task
      ↓
Broadcast via Channel Layer
      ↓
Redis Pub/Sub
      ↓
Daphne/WebSocket
      ↓
Connected Clients
```

## Security Architecture

### Authentication & Authorization

```
JWT Token Flow:
1. User sends credentials to /api/auth/token/
2. System validates and generates JWT
3. Client stores token (localStorage/secure storage)
4. Client includes token in Authorization header
5. Django REST Framework validates token
6. User permissions checked
7. Request processed with user context
```

### Database Security

- SQL injection prevention via ORM
- Password hashing with PBKDF2
- Prepared statements for all queries
- Row-level filtering by user

### API Security

- CORS configuration (allowed origins)
- CSRF protection on state changes
- Rate limiting (via Redis)
- Input validation on all endpoints
- Secure password requirements

## Scalability Design

### Horizontal Scaling

**Stateless Web Servers**
- Multiple Gunicorn workers behind load balancer
- Session stored in database (not in-memory)
- No local file storage (use S3/CDN)
- Shared Redis cache

**Database Scaling**
- Read replicas for queries
- Write replica for updates
- Connection pooling (PgBouncer)
- Index optimization

**Task Processing**
- Multiple Celery workers
- Priority queues
- Distributed task processing
- Result storage in Redis

### Caching Strategy

```
Level 1: Database Query Cache (Django ORM)
Level 2: Redis Cache (API responses)
Level 3: Browser Cache (static assets)
Level 4: CDN Cache (static files)
```

### Performance Optimization

1. **Database Indexes**
   - `approach_date` on CloseApproach
   - `user_id` on Notification
   - `asteroid_id` on CloseApproach

2. **Query Optimization**
   - Use select_related() for joins
   - Use prefetch_related() for reverse relations
   - Pagination on large result sets

3. **API Response Caching**
   - Cache asteroid listings
   - Cache statistical data
   - Invalidate on updates

## Deployment Topologies

### Development (Single Machine)

```
Docker Compose (All services on one machine)
├── Web (Gunicorn)
├── Database (PostgreSQL)
├── Cache (Redis)
├── Worker (Celery)
└── Scheduler (Celery Beat)
```

### Staging (Multiple Machines)

```
Load Balancer
├── Web Server 1 (Gunicorn)
├── Web Server 2 (Gunicorn)
└── Web Server 3 (Gunicorn)
    ↓
Shared Services
├── Database (PostgreSQL RDS)
├── Cache (Redis ElastiCache)
├── Worker Pool (Auto-scaling)
└── Scheduler (Single instance)
```

### Production (AWS)

```
CloudFront (CDN)
      ↓
ALB (Application Load Balancer)
      ↓
ECS Services (Fargate)
├── Web Tier (Auto-scaling)
├── Worker Tier (Auto-scaling)
└── Scheduler (Single instance)
      ↓
RDS (PostgreSQL)
ElastiCache (Redis)
S3 (Media/Static files)
CloudWatch (Logging)
```

## API Design Principles

### RESTful Design

```
GET    /api/asteroids/          - List all
GET    /api/asteroids/{id}/     - Get one
POST   /api/asteroids/          - Create
PUT    /api/asteroids/{id}/     - Update
DELETE /api/asteroids/{id}/     - Delete
```

### Pagination

```
GET /api/asteroids/?page=2&page_size=50

Response:
{
  "count": 1000,
  "next": "http://api/asteroids/?page=3",
  "previous": "http://api/asteroids/?page=1",
  "results": [...]
}
```

### Filtering & Search

```
GET /api/asteroids/?search=Eros
GET /api/asteroids/?is_potentially_hazardous=true
GET /api/asteroids/?ordering=-last_updated
```

### Error Responses

```json
{
  "detail": "Not found.",
  "code": "not_found"
}
```

## Monitoring & Observability

### Logging

- Application logs to stdout/stderr
- Container logs aggregated by Docker
- Production logs to CloudWatch/ELK
- Query logs for slow operations

### Metrics

- Request rate and latency
- Task execution time
- Database connection pool
- Cache hit rate
- Error rates by endpoint

### Health Checks

- Application health: `/health/`
- Database connectivity
- Redis connectivity
- Task queue depth

## Backup & Disaster Recovery

### Database Backups

```
Daily automated backups
├── Point-in-time recovery
├── Cross-region replication
└── 30-day retention
```

### Disaster Recovery Plan

```
RTO: 1 hour
RPO: 15 minutes

Failover steps:
1. Detect failure (CloudWatch)
2. Promote read replica
3. Update connection strings
4. Verify data integrity
5. Resume operations
```

## Technology Decisions

### Django vs Other Frameworks
- Mature ecosystem with extensive packages
- Excellent ORM for complex queries
- Built-in admin interface
- Strong security features

### PostgreSQL vs Other Databases
- ACID compliance for data integrity
- JSON support for flexible data
- Full-text search capabilities
- Row-level security support

### Celery vs Other Task Queues
- Distributed task processing
- Scheduled task support
- Task result tracking
- Integration with Django

### Redis vs Other Caches
- In-memory performance
- Data persistence options
- Pub/Sub for real-time features
- Connection pooling support

## Future Enhancements

1. **GraphQL API** - Alternative to REST
2. **Real-time Analytics** - Kafka for event streaming
3. **ML Predictions** - Predict close approaches
4. **Mobile App** - Native iOS/Android
5. **Advanced Filtering** - Machine learning-based recommendations
6. **Federation** - Share data with other NEO tracking systems

## References

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Django Channels](https://channels.readthedocs.io/)
