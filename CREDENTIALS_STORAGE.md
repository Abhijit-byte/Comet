# Cosmic Watch - Credentials Storage & Authentication Flow

Complete guide to how user credentials are stored and managed in Cosmic Watch.

---

## 🔐 Where Are Credentials Stored?

### **PostgreSQL Database (Primary Storage)**

Your credentials are stored in a **PostgreSQL database** running in Docker. The database is:

- **Container Name:** `cosmic_watch_db`
- **Database Name:** `cosmic_watch`
- **Port:** `5432` (localhost)
- **Data Volume:** `postgres_data` (persisted on disk)

---

## 📊 Database Schema: `auth_user` Table

When you register, Django creates a record in the `auth_user` table:

```sql
Table: auth_user
├── id              (Primary Key, Auto-increment)
├── username        (Unique, 150 chars max)
├── email           (254 chars max)
├── password        (128 chars - HASHED, not plain text)
├── first_name      (150 chars, optional)
├── last_name       (150 chars, optional)
├── is_active       (Boolean - account enabled/disabled)
├── is_staff        (Boolean - admin access)
├── is_superuser    (Boolean - full permissions)
├── last_login      (Timestamp)
└── date_joined     (Timestamp)
```

---

## 🔒 Password Security

### **Passwords Are NEVER Stored in Plain Text**

Django uses **PBKDF2-SHA256 hashing** with automatic salting:

**Example stored password hash:**
```
pbkdf2_sha256$600000$randomsalt123$hashvaluehere...
```

**Format breakdown:**
```
[algorithm]$[iterations]$[salt]$[hash]
```

- **Algorithm:** `pbkdf2_sha256` (highly secure)
- **Iterations:** `600,000` (computational cost - prevents brute force)
- **Salt:** Random string (prevents rainbow table attacks)
- **Hash:** Final encrypted password

**This means:**
- ✅ Your password is encrypted before storage
- ✅ Even database admins can't see your actual password
- ✅ Each password has a unique salt
- ✅ 600,000 iterations make cracking extremely difficult

---

## 🔄 Complete Registration Flow

### **Step 1: User Submits Registration Form**

**Frontend:** `app/register/page.tsx`
```tsx
// User enters:
username: "newoperator"
email: "operator@cosmic.watch"
password: "SecurePass123"
```

### **Step 2: Next.js API Proxy**

**File:** `app/api/auth/register/route.ts`
```typescript
// Receives registration data
// Validates required fields
// Forwards to Django backend at http://localhost:8000
```

### **Step 3: Django Registration Endpoint**

**File:** `django_project/tracker/auth_views.py`
```python
@api_view(['POST'])
def register_view(request):
    # 1. Validate input
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # 2. Check if user exists
    if User.objects.filter(username=username).exists():
        return error_response
    
    # 3. Create user with HASHED password
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password  # Django auto-hashes this!
    )
    
    # 4. Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {...}
    })
```

### **Step 4: Django ORM Saves to PostgreSQL**

**What Django Does:**
```python
# When you call create_user(), Django:
# 1. Generates random salt
# 2. Runs PBKDF2-SHA256 with 600,000 iterations
# 3. Creates hash in format: pbkdf2_sha256$iterations$salt$hash
# 4. Inserts record into auth_user table
```

**SQL Executed:**
```sql
INSERT INTO auth_user (
    username, 
    email, 
    password,  -- HASHED VALUE, NOT PLAIN TEXT
    is_active, 
    date_joined
) VALUES (
    'newoperator',
    'operator@cosmic.watch',
    'pbkdf2_sha256$600000$abc123$def456...',  -- Hashed!
    true,
    '2026-02-07 12:34:56'
);
```

### **Step 5: JWT Tokens Returned**

**Backend Response:**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "newoperator",
    "email": "operator@cosmic.watch"
  }
}
```

### **Step 6: Tokens Stored as HTTP-Only Cookies**

**Next.js API Sets Cookies:**
```typescript
// HTTP-Only cookies (JavaScript cannot access)
cookieStore.set('access_token', data.access, {
  httpOnly: true,        // Blocks XSS attacks
  secure: true,          // HTTPS only in production
  sameSite: 'lax',       // CSRF protection
  maxAge: 60 * 15,       // 15 minutes
  path: '/',
});

cookieStore.set('refresh_token', data.refresh, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 30,  // 30 days
  path: '/',
});
```

---

## 🔍 Login Flow (How Verification Works)

### **Step 1: User Submits Login Form**

**Frontend:** `app/login/page.tsx`
```tsx
// User enters:
email: "test@cosmic.watch"
password: "TestPass123"
```

### **Step 2: Django Verifies Credentials**

**File:** `django_project/tracker/auth_views.py`
```python
@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # 1. Find user by email
    user = User.objects.get(email=email)
    
    # 2. Authenticate - Django compares hashes
    user = authenticate(username=user.username, password=password)
    
    # Django internally does:
    # - Takes provided password
    # - Extracts salt from stored hash
    # - Re-runs PBKDF2-SHA256 with same salt
    # - Compares new hash with stored hash
    # - Returns user if match, None if not
    
    if user is None:
        return error_response
    
    # 3. Generate new JWT tokens
    refresh = RefreshToken.for_user(user)
    return tokens
```

**Password Verification Process:**
```python
# Stored in DB:
stored_hash = "pbkdf2_sha256$600000$salt123$originalhash..."

# User provides password: "TestPass123"

# Django extracts algorithm, iterations, and salt
algorithm, iterations, salt, hash = stored_hash.split('$')

# Hashes provided password with SAME salt and iterations
new_hash = pbkdf2_sha256(password="TestPass123", salt="salt123", iterations=600000)

# Compares hashes
if new_hash == hash:
    # ✅ Login successful
else:
    # ❌ Invalid password
```

---

## 💾 Data Persistence & Location

### **Docker Volume (Your Machine)**

**Location on Windows:**
```
C:\ProgramData\Docker\volumes\finaliitbbsr_postgres_data\_data
```

**Volume Definition in docker-compose.yml:**
```yaml
volumes:
  postgres_data:  # Named volume, persisted on host

services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Maps to container
```

**This means:**
- ✅ Data survives container restarts
- ✅ Data survives Docker Desktop restarts
- ✅ Data persists until you run `docker-compose down -v`
- ✅ You can backup this volume

---

## 🛠️ How to View Your Credentials

### **Method 1: Query Database Directly**

```powershell
# Connect to PostgreSQL container
docker-compose exec db psql -U postgres -d cosmic_watch

# List all users
SELECT id, username, email, is_active FROM auth_user;

# View password hashes (first 50 chars)
SELECT username, LEFT(password, 50) as password_hash FROM auth_user;
```

### **Method 2: Django Admin Panel**

```bash
# Create superuser
docker-compose exec web python manage.py createsuperuser

# Access admin at: http://localhost:8000/admin
# View all users under "Authentication and Authorization"
```

### **Method 3: Django Shell**

```bash
# Open Django shell
docker-compose exec web python manage.py shell

# Query users
from django.contrib.auth.models import User
users = User.objects.all()
for user in users:
    print(f"{user.username} - {user.email}")
```

---

## 🔐 Token Storage (After Login)

### **Access Token (15 minutes)**

**Stored in:** HTTP-Only Cookie `access_token`
```http
Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HttpOnly: true
Secure: true
SameSite: lax
Max-Age: 900 (15 minutes)
```

**Contains (JWT Payload):**
```json
{
  "user_id": 1,
  "username": "test",
  "email": "test@cosmic.watch",
  "exp": 1738953600,  // Expiration timestamp
  "token_type": "access"
}
```

### **Refresh Token (30 days)**

**Stored in:** HTTP-Only Cookie `refresh_token`
```http
Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
HttpOnly: true
Secure: true
SameSite: lax
Max-Age: 2592000 (30 days)
```

**Purpose:** 
- Used to obtain new access tokens when they expire
- Stored in Django `token_blacklist` when logout occurs

---

## 📂 Summary: Where Everything Is Stored

| **Data Type** | **Storage Location** | **Format** | **Access** |
|--------------|---------------------|-----------|-----------|
| **Username** | PostgreSQL `auth_user.username` | Plain text | Database |
| **Email** | PostgreSQL `auth_user.email` | Plain text | Database |
| **Password** | PostgreSQL `auth_user.password` | PBKDF2-SHA256 Hash | Database |
| **User Details** | PostgreSQL `auth_user.*` | Plain text | Database |
| **Access Token** | Browser Cookie | JWT (signed) | HTTP-Only |
| **Refresh Token** | Browser Cookie | JWT (signed) | HTTP-Only |
| **Database Files** | Docker Volume `postgres_data` | Binary files | Host filesystem |

---

## 🔒 Security Features

### **1. Password Hashing**
- ✅ PBKDF2-SHA256 with 600,000 iterations
- ✅ Automatic salt generation
- ✅ Constant-time comparison (prevents timing attacks)

### **2. JWT Token Security**
- ✅ Signed with SECRET_KEY (tampering detection)
- ✅ Short expiration (15 minutes for access)
- ✅ Stored in HTTP-Only cookies (XSS protection)

### **3. Cookie Security**
- ✅ `HttpOnly` flag (JavaScript can't read)
- ✅ `Secure` flag in production (HTTPS only)
- ✅ `SameSite=lax` (CSRF protection)

### **4. Database Security**
- ✅ Credentials in environment variables
- ✅ Network isolation (Docker internal network)
- ✅ PostgreSQL authentication required

---

## 🧪 Test Your Credentials

### **Check Database Directly**

```powershell
# View all registered users
docker-compose exec -T db psql -U postgres -d cosmic_watch -c "
SELECT 
    id,
    username,
    email,
    LEFT(password, 60) as password_hash_preview,
    is_active,
    date_joined
FROM auth_user
ORDER BY date_joined DESC;
"
```

### **Test Login via API**

```powershell
# Test with your credentials
$body = @{
    email = 'test@cosmic.watch'
    password = 'TestPass123'
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method Post `
  -Body $body `
  -ContentType 'application/json'
```

---

## 🔄 How to Reset Your Password

### **Method 1: Django Admin**

```bash
# Access admin panel at http://localhost:8000/admin
# Login with superuser credentials
# Navigate to Users → Select user → Change password
```

### **Method 2: Django Shell**

```bash
docker-compose exec web python manage.py shell

# In shell:
from django.contrib.auth.models import User
user = User.objects.get(email='test@cosmic.watch')
user.set_password('NewPassword123')
user.save()
```

### **Method 3: Command Line**

```bash
docker-compose exec web python manage.py changepassword test
# Follow prompts to enter new password
```

---

## 💡 Key Takeaways

1. **Passwords are SAFE** - Stored as cryptographic hashes, not plain text
2. **Database is PERSISTENT** - Data survives restarts via Docker volumes
3. **Tokens are SECURE** - HTTP-Only cookies prevent JavaScript access
4. **Location is LOCAL** - Everything stored on your machine in Docker volumes
5. **You CAN'T login without database** - Authentication requires PostgreSQL running
6. **Hashing is AUTOMATIC** - Django handles all encryption transparently

---

## 🆘 Troubleshooting

### **"Can't login" - Database might be down**

```bash
# Check database status
docker-compose ps

# Restart database
docker-compose restart db

# Check logs
docker-compose logs db
```

### **"Lost all users" - Volume might be deleted**

```bash
# Check if volume exists
docker volume ls | Select-String postgres_data

# Recreate test user
docker-compose exec web python manage.py shell
# In shell:
from django.contrib.auth.models import User
User.objects.create_user('test', 'test@cosmic.watch', 'TestPass123')
```

### **"Database connection error"**

```bash
# Check database is healthy
docker-compose exec db pg_isready -U postgres

# Check connection settings
docker-compose exec web env | Select-String DB_
```

---

**Last Updated:** February 7, 2026  
**Security Level:** Production-Grade Encryption  
**Storage:** PostgreSQL 15 + Docker Volumes  
**Hashing:** PBKDF2-SHA256 (600,000 iterations)
