# CosmosTrace API Reference & Testing Guide

Complete documentation and testing examples for all CosmosTrace Next.js API endpoints.

---

## 🚀 Quick Start Testing

### Prerequisites
```bash
# Ensure Docker containers are running
docker compose up -d

# Ensure Next.js dev server is running
npm run dev
```

### Test Credentials
```
Email: test@cosmic.watch
Password: TestPass123
```

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method | Auth Required | Description |
|----------|----------|--------|---------------|-------------|
| **Authentication** | `/api/auth/login` | POST | No | Obtain JWT tokens |
| | `/api/auth/register` | POST | No | Create new account |
| | `/api/auth/refresh` | POST | No | Refresh access token |
| | `/api/auth/me` | GET | Yes | Get current user profile |
| | `/api/auth/logout` | POST | Yes | Terminate session |
| **NASA Asteroids** | `/api/asteroids` | GET | No | List asteroids (7 days default) |
| | `/api/asteroid-lookup` | GET | No | Search by ID or name |
| | `/api/search-asteroid` | GET | No | Full-text search asteroids |
| | `/api/stats` | GET | No | Dashboard statistics |
| | `/api/chat` | POST | No | AI chat about asteroids |

---

## 🔐 Authentication Endpoints

### 1. Login - Obtain JWT Tokens

**Endpoint:** `POST /api/auth/login`  
**Description:** Authenticate user and receive access + refresh tokens

**Request Body:**
```json
{
  "email": "test@cosmic.watch",
  "password": "TestPass123"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cosmic.watch","password":"TestPass123"}'
```

**PowerShell Example:**
```powershell
$body = @{
    email = 'test@cosmic.watch'
    password = 'TestPass123'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json'
```

**Success Response (200):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "test",
    "email": "test@cosmic.watch",
    "first_name": "",
    "last_name": ""
  }
}
```

---

### 2. Register - Create New Account

**Endpoint:** `POST /api/auth/register`  
**Description:** Create new operator account with auto-login

**Request Body:**
```json
{
  "username": "newoperator",
  "email": "operator@cosmic.watch",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Operator"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username":"newoperator",
    "email":"operator@cosmic.watch",
    "password":"SecurePass123",
    "first_name":"John",
    "last_name":"Operator"
  }'
```

**PowerShell Example:**
```powershell
$body = @{
    username = 'newoperator'
    email = 'operator@cosmic.watch'
    password = 'SecurePass123'
    first_name = 'John'
    last_name = 'Operator'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/register' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json'
```

**Success Response (201):**
```json
{
  "user": {
    "id": 2,
    "username": "newoperator",
    "email": "operator@cosmic.watch",
    "first_name": "John",
    "last_name": "Operator"
  },
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Refresh Token

**Endpoint:** `POST /api/auth/refresh`  
**Description:** Obtain new access token using refresh token

**Request Body:**
```json
{
  "refresh": "YOUR_REFRESH_TOKEN"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh":"YOUR_REFRESH_TOKEN"}'
```

**PowerShell Example:**
```powershell
$refresh_token = "YOUR_REFRESH_TOKEN"
$body = @{ refresh = $refresh_token } | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/refresh' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json'
```

**Success Response (200):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Get Current User Profile

**Endpoint:** `GET /api/auth/me`  
**Description:** Retrieve authenticated user's profile information  
**Authentication:** Required (Bearer Token)

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**PowerShell Example:**
```powershell
$token = "YOUR_ACCESS_TOKEN"
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/me' `
  -Method Get `
  -Headers $headers
```

**Success Response (200):**
```json
{
  "id": 1,
  "username": "test",
  "email": "test@cosmic.watch",
  "first_name": "",
  "last_name": ""
}
```

---

### 5. Logout - Terminate Session

**Endpoint:** `POST /api/auth/logout`  
**Description:** Blacklist refresh token and terminate session  
**Authentication:** Required (Bearer Token)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**PowerShell Example:**
```powershell
$token = "YOUR_ACCESS_TOKEN"
$headers = @{ Authorization = "Bearer $token" }

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/logout' `
  -Method Post `
  -Headers $headers `
  -Body '{}' `
  -ContentType 'application/json'
```

**Success Response (200):**
```json
{
  "detail": "SESSION TERMINATED. All authentication tokens invalidated."
}
```

---

## 🌌 NASA Asteroid Data Endpoints

### 6. List Asteroids

**Endpoint:** `GET /api/asteroids`  
**Description:** Fetch list of Near-Earth Objects with enhanced data  
**Query Parameters:**
- `days` (optional): Number of days to fetch (default: 7)

**cURL Example:**
```bash
# Default 7 days
curl http://localhost:3000/api/asteroids

# Custom duration (14 days)
curl http://localhost:3000/api/asteroids?days=14
```

**PowerShell Example:**
```powershell
# Default 7 days
Invoke-RestMethod -Uri 'http://localhost:3000/api/asteroids'

# Custom duration
Invoke-RestMethod -Uri 'http://localhost:3000/api/asteroids?days=14'
```

**Success Response (200):**
```json
[
  {
    "id": "3542519",
    "name": "433 Eros",
    "designation": "433",
    "diameter": {
      "estimated_diameter_min": 22428.44,
      "estimated_diameter_max": 50147.85
    },
    "hazardous": false,
    "url": "http://www.neowsapp.com/rest/v1/neo/3542519?api_key=DEMO_KEY",
    "absolute_magnitude_h": 10.4,
    "close_approach_data": {
      "close_approach_date": "2026-02-15",
      "relative_velocity": {
        "kilometers_per_second": "18.75"
      },
      "miss_distance": {
        "kilometers": "25000000"
      }
    }
  }
]
```

---

### 7. Asteroid Lookup (By ID or Name)

**Endpoint:** `GET /api/asteroid-lookup`  
**Description:** Search for specific asteroid by ID or name  
**Query Parameters:**
- `id` (optional): NASA asteroid ID
- `name` (optional): Asteroid name or partial name

**cURL Examples:**
```bash
# Search by ID
curl 'http://localhost:3000/api/asteroid-lookup?id=3542519'

# Search by name
curl 'http://localhost:3000/api/asteroid-lookup?name=Apophis'
```

**PowerShell Examples:**
```powershell
# Search by ID
Invoke-RestMethod -Uri 'http://localhost:3000/api/asteroid-lookup?id=3542519'

# Search by name
Invoke-RestMethod -Uri 'http://localhost:3000/api/asteroid-lookup?name=Apophis'
```

**Success Response (200):**
```json
{
  "id": "3542519",
  "name": "433 Eros",
  "designation": "433",
  "diameter": {
    "estimated_diameter_min": 22428.44,
    "estimated_diameter_max": 50147.85
  },
  "hazardous": false,
  "url": "http://www.neowsapp.com/rest/v1/neo/3542519?api_key=DEMO_KEY",
  "absolute_magnitude_h": 10.4,
  "close_approach_data": [
    {
      "close_approach_date": "2026-02-15",
      "relative_velocity": {
        "kilometers_per_second": "18.75"
      },
      "miss_distance": {
        "kilometers": "25000000"
      }
    }
  ],
  "orbital_data": {
    "orbit_id": "145",
    "orbit_determination_date": "2024-11-20 12:23:45.123",
    "first_observation_date": "1893-10-29",
    "last_observation_date": "2024-10-15"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Provide either id or name parameter"
}
```

**Error Response (404):**
```json
{
  "error": "Asteroid not found",
  "query": "NonExistentAsteroid"
}
```

---

### 8. Search Asteroids (Full-Text Search)

**Endpoint:** `GET /api/search-asteroid`  
**Description:** Full-text search across asteroid names and designations  
**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)
- `page` (optional): Page number for pagination (default: 0)

**cURL Examples:**
```bash
# Basic search
curl 'http://localhost:3000/api/search-asteroid?q=Apophis'

# Paginated search
curl 'http://localhost:3000/api/search-asteroid?q=asteroid&page=1'
```

**PowerShell Examples:**
```powershell
# Basic search
Invoke-RestMethod -Uri 'http://localhost:3000/api/search-asteroid?q=Apophis'

# Paginated search
Invoke-RestMethod -Uri 'http://localhost:3000/api/search-asteroid?q=asteroid&page=1'
```

**Success Response (200):**
```json
{
  "asteroids": [
    {
      "id": "2099942",
      "name": "99942 Apophis (2004 MN4)",
      "designation": "2004 MN4",
      "diameter": {
        "estimated_diameter_min": 320.5,
        "estimated_diameter_max": 716.8
      },
      "hazardous": false,
      "url": "http://www.neowsapp.com/rest/v1/neo/2099942?api_key=DEMO_KEY",
      "absoluteMagnitude": 19.7,
      "closeApproachDate": "2029-04-13",
      "velocity": "7.42",
      "distance": "38000"
    }
  ],
  "total": 1
}
```

**Error Response (400):**
```json
{
  "error": "Query too short (minimum 2 characters)"
}
```

---

### 9. Dashboard Statistics

**Endpoint:** `GET /api/stats`  
**Description:** Comprehensive statistics for NEO tracking dashboard

**cURL Example:**
```bash
curl http://localhost:3000/api/stats
```

**PowerShell Example:**
```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/stats'
```

**Success Response (200):**
```json
{
  "total_asteroids_tracked": 142,
  "hazardous_asteroids_count": 12,
  "total_approaches": 142,
  "date_range": {
    "start": "2026-02-07",
    "end": "2026-02-14"
  },
  "max_diameter_meters": 2845.67,
  "max_velocity_kmh": 125432.89,
  "avg_velocity_kmh": 64238.45,
  "min_distance_km": 1234567.89,
  "last_updated": "2026-02-07T12:34:56.789Z"
}
```

---

### 10. AI Chat - Asteroid Assistant

**Endpoint:** `POST /api/chat`  
**Description:** Interactive AI assistant for asteroid information and queries

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Tell me about Apophis"
    }
  ]
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role":"user","content":"Tell me about Apophis"}
    ]
  }'
```

**PowerShell Example:**
```powershell
$body = @{
    messages = @(
        @{
            role = 'user'
            content = 'Tell me about Apophis'
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri 'http://localhost:3000/api/chat' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json'
```

**Success Response (200):**
```json
{
  "message": "Found 1 asteroid:\n\n**99942 Apophis (2004 MN4)**\n• Status: ✓ Not hazardous\n• Size: 320.50m - 716.80m diameter\n• Absolute Magnitude: 19.70\n• Closest Approach Date: 2029-04-13\n• Velocity: 7.42 km/s\n• Miss Distance: 38,000 km\n\nApophis will make an extremely close approach to Earth in 2029, passing closer than some satellites!"
}
```

**Chat Query Examples:**
```json
// Greeting
{"messages":[{"role":"user","content":"hello"}]}

// Search specific asteroid
{"messages":[{"role":"user","content":"Tell me about Bennu"}]}

// Get largest asteroids
{"messages":[{"role":"user","content":"What are the largest asteroids?"}]}

// Get hazardous asteroids
{"messages":[{"role":"user","content":"Show me hazardous asteroids"}]}
```

---

## 🧪 Complete Testing Script (PowerShell)

Save this as `test-api.ps1`:

```powershell
# CosmosTrace API Testing Script
Write-Host "🌌 CosmosTrace API Testing Suite" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"
$token = $null
$refresh = $null

# Test 1: Login
Write-Host "`n[TEST 1] Login Authentication" -ForegroundColor Yellow
try {
    $body = @{
        email = 'test@cosmic.watch'
        password = 'TestPass123'
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
        -Method Post -Body $body -ContentType 'application/json'
    
    $token = $response.access
    $refresh = $response.refresh
    Write-Host "✅ Login successful - Token received" -ForegroundColor Green
    Write-Host "   User: $($response.user.email)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 2: Get User Profile
Write-Host "`n[TEST 2] Get Current User Profile" -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $user = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" `
        -Method Get -Headers $headers
    Write-Host "✅ Profile retrieved" -ForegroundColor Green
    Write-Host "   Username: $($user.username)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Profile fetch failed: $_" -ForegroundColor Red
}

# Test 3: Get Asteroids List
Write-Host "`n[TEST 3] List Asteroids (7 days)" -ForegroundColor Yellow
try {
    $asteroids = Invoke-RestMethod -Uri "$baseUrl/api/asteroids"
    Write-Host "✅ Asteroids retrieved: $($asteroids.Count) objects" -ForegroundColor Green
    if ($asteroids.Count -gt 0) {
        Write-Host "   First: $($asteroids[0].name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Asteroids fetch failed: $_" -ForegroundColor Red
}

# Test 4: Search Asteroid
Write-Host "`n[TEST 4] Search for 'Apophis'" -ForegroundColor Yellow
try {
    $search = Invoke-RestMethod -Uri "$baseUrl/api/search-asteroid?q=Apophis"
    Write-Host "✅ Search completed: $($search.total) results" -ForegroundColor Green
} catch {
    Write-Host "❌ Search failed: $_" -ForegroundColor Red
}

# Test 5: Dashboard Stats
Write-Host "`n[TEST 5] Get Dashboard Statistics" -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "$baseUrl/api/stats"
    Write-Host "✅ Statistics retrieved" -ForegroundColor Green
    Write-Host "   Total Tracked: $($stats.total_asteroids_tracked)" -ForegroundColor Gray
    Write-Host "   Hazardous: $($stats.hazardous_asteroids_count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Stats fetch failed: $_" -ForegroundColor Red
}

# Test 6: Chat API
Write-Host "`n[TEST 6] Chat - Ask about largest asteroids" -ForegroundColor Yellow
try {
    $chatBody = @{
        messages = @(
            @{
                role = 'user'
                content = 'What are the largest asteroids?'
            }
        )
    } | ConvertTo-Json -Depth 3
    
    $chatResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat" `
        -Method Post -Body $chatBody -ContentType 'application/json'
    Write-Host "✅ Chat response received" -ForegroundColor Green
    Write-Host "   Response preview: $($chatResponse.message.Substring(0, [Math]::Min(100, $chatResponse.message.Length)))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Chat failed: $_" -ForegroundColor Red
}

# Test 7: Refresh Token
Write-Host "`n[TEST 7] Refresh Access Token" -ForegroundColor Yellow
try {
    $refreshBody = @{ refresh = $refresh } | ConvertTo-Json
    $newToken = Invoke-RestMethod -Uri "$baseUrl/api/auth/refresh" `
        -Method Post -Body $refreshBody -ContentType 'application/json'
    Write-Host "✅ Token refreshed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Token refresh failed: $_" -ForegroundColor Red
}

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "🎯 Testing Complete!" -ForegroundColor Cyan
```

**Run the test script:**
```powershell
.\test-api.ps1
```

---

## 🧪 Complete Testing Script (Bash/cURL)

Save this as `test-api.sh`:

```bash
#!/bin/bash

# CosmosTrace API Testing Script
echo "🌌 CosmosTrace API Testing Suite"
echo "================================="

BASE_URL="http://localhost:3000"
TOKEN=""
REFRESH=""

# Test 1: Login
echo -e "\n[TEST 1] Login Authentication"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cosmic.watch","password":"TestPass123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access')
REFRESH=$(echo $LOGIN_RESPONSE | jq -r '.refresh')

if [ "$TOKEN" != "null" ]; then
  echo "✅ Login successful - Token received"
  echo "   User: $(echo $LOGIN_RESPONSE | jq -r '.user.email')"
else
  echo "❌ Login failed"
  exit 1
fi

# Test 2: Get User Profile
echo -e "\n[TEST 2] Get Current User Profile"
USER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if [ "$(echo $USER_RESPONSE | jq -r '.id')" != "null" ]; then
  echo "✅ Profile retrieved"
  echo "   Username: $(echo $USER_RESPONSE | jq -r '.username')"
else
  echo "❌ Profile fetch failed"
fi

# Test 3: Get Asteroids List
echo -e "\n[TEST 3] List Asteroids (7 days)"
ASTEROIDS=$(curl -s "$BASE_URL/api/asteroids")
COUNT=$(echo $ASTEROIDS | jq '. | length')
echo "✅ Asteroids retrieved: $COUNT objects"
if [ "$COUNT" -gt 0 ]; then
  echo "   First: $(echo $ASTEROIDS | jq -r '.[0].name')"
fi

# Test 4: Search Asteroid
echo -e "\n[TEST 4] Search for 'Apophis'"
SEARCH=$(curl -s "$BASE_URL/api/search-asteroid?q=Apophis")
TOTAL=$(echo $SEARCH | jq -r '.total')
echo "✅ Search completed: $TOTAL results"

# Test 5: Dashboard Stats
echo -e "\n[TEST 5] Get Dashboard Statistics"
STATS=$(curl -s "$BASE_URL/api/stats")
echo "✅ Statistics retrieved"
echo "   Total Tracked: $(echo $STATS | jq -r '.total_asteroids_tracked')"
echo "   Hazardous: $(echo $STATS | jq -r '.hazardous_asteroids_count')"

# Test 6: Chat API
echo -e "\n[TEST 6] Chat - Ask about largest asteroids"
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What are the largest asteroids?"}]}')
echo "✅ Chat response received"
echo "   Response preview: $(echo $CHAT_RESPONSE | jq -r '.message' | cut -c1-100)..."

# Test 7: Refresh Token
echo -e "\n[TEST 7] Refresh Access Token"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh\":\"$REFRESH\"}")
NEW_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.access')

if [ "$NEW_TOKEN" != "null" ]; then
  echo "✅ Token refreshed successfully"
else
  echo "❌ Token refresh failed"
fi

echo -e "\n================================="
echo "🎯 Testing Complete!"
```

**Run the test script:**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## 📊 Response Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created (registration) |
| 400 | Bad Request | Invalid parameters or missing data |
| 401 | Unauthorized | Invalid or missing authentication token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal server error |

---

## 🔧 Common Error Responses

### Missing Authentication
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### Invalid Token
```json
{
  "error": "Token invalid or expired"
}
```

### NASA API Error
```json
{
  "error": "NASA_API_KEY not configured"
}
```

---

## 💡 Pro Tips

1. **Token Expiration**: Access tokens expire after 15 minutes. Use refresh endpoint before expiry.
2. **Rate Limiting**: NASA API has rate limits. Cache responses when possible.
3. **Pagination**: Use `page` parameter for large result sets in search endpoints.
4. **Error Handling**: Always check status codes and handle errors gracefully.
5. **Date Ranges**: Asteroid data is most accurate within 7-30 day windows.

---

## 📝 Quick Reference Commands

```bash
# Login and save token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cosmic.watch","password":"TestPass123"}' \
  | jq -r '.access')

# Use token for authenticated requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/auth/me

# Get asteroid data
curl http://localhost:3000/api/asteroids?days=14

# Search asteroids
curl 'http://localhost:3000/api/search-asteroid?q=Bennu'

# Dashboard stats
curl http://localhost:3000/api/stats
```

---

## 🔗 Related Documentation

- [README.md](README.md) - Project overview and setup
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [Postman Collection](postman/CosmicWatch.postman_collection.json) - Import-ready API collection
- [NASA NEO API Documentation](https://api.nasa.gov/) - Official NASA API reference

---

**Last Updated:** February 7, 2026  
**API Version:** 1.0.0  
**Next.js Version:** 14+  
**Django Backend:** 4.2
