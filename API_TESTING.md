# Cosmic Watch API Testing Guide

Complete guide to testing the Cosmic Watch Django REST API with cURL and Postman.

## Base URL
```
http://localhost:8000/api
```

## Authentication

All endpoints (except registration and token) require JWT authentication.

### Step 1: Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "researcher1",
    "email": "researcher@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

Response:
```json
{
  "message": "User registered successfully"
}
```

### Step 2: Get JWT Token
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "researcher1",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Save the `access` token for subsequent requests.**

### Step 3: Refresh Token
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your_refresh_token_here"
  }'
```

## API Endpoints Testing

### 1. User Management

#### Get User Profile
```bash
curl -X GET http://localhost:8000/api/user/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update User Profile
```bash
curl -X PUT http://localhost:8000/api/user/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com"
  }'
```

### 2. Asteroid Management

#### List All Asteroids
```bash
curl -X GET "http://localhost:8000/api/asteroids/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### List with Pagination
```bash
curl -X GET "http://localhost:8000/api/asteroids/?page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Search Asteroids
```bash
curl -X GET "http://localhost:8000/api/asteroids/?search=Eros" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Filter Hazardous Only
```bash
curl -X GET "http://localhost:8000/api/asteroids/?is_potentially_hazardous=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get Specific Asteroid
```bash
curl -X GET "http://localhost:8000/api/asteroids/433/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response example:
```json
{
  "id": 433,
  "nasa_id": "2000433",
  "name": "Eros (433)",
  "diameter_min": 8.38,
  "diameter_max": 8.38,
  "absolute_magnitude": 10.8,
  "is_potentially_hazardous": false,
  "close_approaches": [
    {
      "id": 1,
      "approach_date": "2024-02-15T00:00:00Z",
      "miss_distance_km": 225700000.0,
      "relative_velocity_kmps": 21.5
    }
  ],
  "upcoming_approaches": [...]
}
```

#### Upcoming Approaches
```bash
curl -X GET "http://localhost:8000/api/asteroids/upcoming-approaches/?days=7" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Hazardous Asteroids
```bash
curl -X GET "http://localhost:8000/api/asteroids/hazardous/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get Close Approaches for Asteroid
```bash
curl -X GET "http://localhost:8000/api/asteroids/433/close_approaches/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Watched Asteroids

#### Get Watched List
```bash
curl -X GET "http://localhost:8000/api/watched-asteroids/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Add to Watch List
```bash
curl -X POST "http://localhost:8000/api/watched-asteroids/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "asteroid_id": 433
  }'
```

#### Remove from Watch List
```bash
curl -X DELETE "http://localhost:8000/api/watched-asteroids/1/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Update Watch Notes
```bash
curl -X PATCH "http://localhost:8000/api/watched-asteroids/1/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Interesting asteroid with eccentric orbit"
  }'
```

### 4. Alert Configuration

#### Get Alert Config
```bash
curl -X GET "http://localhost:8000/api/alerts/config/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "id": 1,
  "alert_type": "distance",
  "min_distance_km": 10000000,
  "max_distance_km": 100000000,
  "min_velocity_kmps": 0,
  "min_days_notice": 1,
  "notification_method": "both",
  "hazard_only": false,
  "enabled": true
}
```

#### Update Alert Config
```bash
curl -X PUT "http://localhost:8000/api/alerts/config/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_type": "distance",
    "min_distance_km": 5000000,
    "max_distance_km": 50000000,
    "min_velocity_kmps": 10,
    "min_days_notice": 3,
    "notification_method": "email",
    "hazard_only": true,
    "enabled": true
  }'
```

### 5. Notifications

#### Get Notifications
```bash
curl -X GET "http://localhost:8000/api/notifications/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Filter by Status
```bash
curl -X GET "http://localhost:8000/api/notifications/?status=pending" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get Unread Count
```bash
curl -X GET "http://localhost:8000/api/notifications/unread_count/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "unread_count": 5
}
```

#### Mark as Read
```bash
curl -X POST "http://localhost:8000/api/notifications/1/mark_as_read/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Mark All as Read
```bash
curl -X POST "http://localhost:8000/api/notifications/mark_all_as_read/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Get Upcoming Notifications
```bash
curl -X GET "http://localhost:8000/api/notifications/upcoming/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Dashboard

#### Get Dashboard Stats
```bash
curl -X GET "http://localhost:8000/api/dashboard/stats/?days=7" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response:
```json
{
  "total_asteroids": 5432,
  "hazardous_asteroids": 234,
  "safe_asteroids": 5198,
  "upcoming_approaches": 45,
  "user_watched_asteroids": 8,
  "unread_notifications": 3,
  "closest_approach": {
    "asteroid": "Apophis (99942)",
    "approach_date": "2024-04-13T10:30:00Z",
    "distance_km": 31397000
  }
}
```

## Using Postman

### 1. Import Collection

Create a new Postman collection with the following requests:

**Environment Variables:**
```json
{
  "base_url": "http://localhost:8000/api",
  "token": ""
}
```

### 2. Authentication Request

Set up a request that automatically saves the token:

```
POST {{base_url}}/auth/token/
Body (raw JSON):
{
  "username": "researcher1",
  "password": "SecurePass123"
}

Tests (Script):
if (pm.response.code === 200) {
  var jsonData = pm.response.json();
  pm.environment.set("token", jsonData.access);
}
```

### 3. All Requests Use Token

Set Authorization header in all requests:
```
Type: Bearer Token
Token: {{token}}
```

### 4. Save Responses as Examples

For each request, save successful responses as examples for documentation.

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "field_name": [
    "This field is required.",
    "Another error message"
  ]
}
```

#### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

#### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

#### 404 Not Found
```json
{
  "detail": "Not found."
}
```

#### 429 Too Many Requests
```json
{
  "detail": "Request was throttled. Expected available in 60 seconds."
}
```

#### 500 Server Error
```json
{
  "detail": "Internal server error occurred. Please contact support."
}
```

## Performance Testing

### Test Large Result Sets
```bash
time curl -X GET "http://localhost:8000/api/asteroids/?page_size=1000" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Concurrent Requests
```bash
# Using Apache Bench
ab -n 1000 -c 100 -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/asteroids/
```

### Test WebSocket Connection
```javascript
// In browser console
const socket = new WebSocket(
  `ws://localhost:8000/ws/notifications/?token=YOUR_ACCESS_TOKEN`
);

socket.onopen = () => console.log("Connected");
socket.onmessage = (e) => console.log("Message:", JSON.parse(e.data));
socket.onerror = (e) => console.log("Error:", e);
socket.onclose = () => console.log("Disconnected");
```

## Batch Testing Script

Create `test_api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api"

# Register
echo "Registering user..."
REGISTER=$(curl -s -X POST "$BASE_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "password_confirm": "TestPass123"
  }')

# Login
echo "Logging in..."
LOGIN=$(curl -s -X POST "$BASE_URL/auth/token/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123"
  }')

TOKEN=$(echo $LOGIN | jq -r '.access')
echo "Token: $TOKEN"

# Get asteroids
echo "Fetching asteroids..."
curl -s -X GET "$BASE_URL/asteroids/?page_size=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get stats
echo "Fetching dashboard stats..."
curl -s -X GET "$BASE_URL/dashboard/stats/" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

Run with:
```bash
chmod +x test_api.sh
./test_api.sh
```

## Troubleshooting

### CORS Errors
Check CORS_ALLOWED_ORIGINS in .env:
```bash
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

### Token Expired
Get a new token:
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "your_refresh_token"
  }'
```

### 404 Errors
Verify the asteroid ID:
```bash
curl -X GET "http://localhost:8000/api/asteroids/?search=Eros" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Slow Responses
Check Celery tasks and Redis:
```bash
docker-compose logs celery_worker
docker-compose logs redis
```

## Load Testing with Locust

Create `locustfile.py`:

```python
from locust import HttpUser, task, between
import json

class AsteroidUser(HttpUser):
    wait_time = between(1, 5)
    
    def on_start(self):
        response = self.client.post("/auth/token/", json={
            "username": "researcher1",
            "password": "SecurePass123"
        })
        self.token = response.json()["access"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    @task(1)
    def list_asteroids(self):
        self.client.get("/asteroids/", headers=self.headers)
    
    @task(2)
    def search_asteroids(self):
        self.client.get("/asteroids/?search=Eros", headers=self.headers)
    
    @task(1)
    def get_stats(self):
        self.client.get("/dashboard/stats/", headers=self.headers)
```

Run:
```bash
locust -f locustfile.py --host=http://localhost:8000
```

Then visit http://localhost:8089 in your browser.
