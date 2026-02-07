# 🎯 Quick Start - Apply JWT Migrations

## **ONE-COMMAND DEPLOYMENT**

### For Windows (PowerShell):
```powershell
.\migrate.ps1
```

### For Linux/Mac (Bash):
```bash
chmod +x migrate.sh
./migrate.sh
```

---

## **MANUAL STEP-BY-STEP (If automated script fails)**

### Step 1: Start Docker Services
```bash
docker-compose up -d
```

**Wait 10-15 seconds for PostgreSQL to initialize.**

### Step 2: Verify Services Running
```bash
docker-compose ps
```

**Expected Output:**
```
NAME                COMMAND                  STATUS              PORTS
finaliitbbsr-db-1   "docker-entrypoint.s…"   Up                  0.0.0.0:5432->5432/tcp
finaliitbbsr-redis-1 "docker-entrypoint.s…"  Up                  0.0.0.0:6379->6379/tcp
finaliitbbsr-web-1   "/usr/src/app/entryp…"  Up                  0.0.0.0:8000->8000/tcp
```

### Step 3: Apply Migrations
```bash
docker-compose exec web python manage.py migrate
```

**Expected Output:**
```
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying tracker.0001_initial... OK
  Applying rest_framework_simplejwt.blacklist... OK
```

### Step 4: Verify JWT Tables Created
```bash
docker-compose exec db psql -U postgres -d cosmic_watch_db -c "\dt jwt_*; \dt user_*"
```

**Expected Output:**
```
                List of relations
 Schema |         Name         | Type  |  Owner
--------+----------------------+-------+----------
 public | jwt_access_tokens    | table | postgres
 public | jwt_refresh_tokens   | table | postgres
 public | user_login_sessions  | table | postgres
 public | user_profiles        | table | postgres
```

### Step 5: Create Superuser (Optional)
```bash
docker-compose exec web python manage.py createsuperuser
```

**Follow prompts:**
```
Username: admin
Email: admin@example.com
Password: ********
Password (again): ********
Superuser created successfully.
```

### Step 6: Test JWT Authentication

#### Register a User:
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!"
  }'
```

#### Login to Get JWT Tokens:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### Step 7: Verify Token Stored in Database
```bash
docker-compose exec db psql -U postgres -d cosmic_watch_db -c "
SELECT 
  rt.jti, 
  rt.created_at, 
  rt.expires_at, 
  rt.device_info->>'browser' as browser,
  rt.ip_address,
  rt.is_blacklisted
FROM jwt_refresh_tokens rt
JOIN auth_user u ON rt.user_id = u.id
WHERE u.username = 'testuser'
ORDER BY rt.created_at DESC
LIMIT 1;
"
```

**Expected Output:**
```
         jti          |      created_at       |      expires_at       | browser | ip_address | is_blacklisted
----------------------+-----------------------+-----------------------+---------+------------+----------------
 a1b2c3d4-e5f6-7g8h... | 2024-01-15 10:30:00   | 2024-02-14 10:30:00   | Chrome  | 172.18.0.1 | f
```

### Step 8: Verify Login Session Tracked
```bash
docker-compose exec db psql -U postgres -d cosmic_watch_db -c "
SELECT 
  ls.login_time,
  ls.device_type,
  ls.browser,
  ls.operating_system,
  ls.ip_address,
  ls.is_active,
  ls.is_suspicious
FROM user_login_sessions ls
JOIN auth_user u ON ls.user_id = u.id
WHERE u.username = 'testuser'
ORDER BY ls.login_time DESC
LIMIT 1;
"
```

**Expected Output:**
```
     login_time      | device_type | browser | operating_system | ip_address | is_active | is_suspicious
---------------------+-------------+---------+------------------+------------+-----------+---------------
 2024-01-15 10:30:00 | desktop     | Chrome  | Windows          | 172.18.0.1 | t         | f
```

### Step 9: Test Protected Endpoint
```bash
# Save access token from login response
ACCESS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Access protected endpoint
curl -X GET http://localhost:8000/api/asteroids/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "count": 150,
  "next": "http://localhost:8000/api/asteroids/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "(2024 AA)",
      "is_potentially_hazardous": false,
      ...
    }
  ]
}
```

### Step 10: Test Logout (Token Blacklist)
```bash
# Logout to blacklist refresh token
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }'
```

**Expected Response:**
```json
{
  "message": "Logout successful"
}
```

#### Verify Token Blacklisted:
```bash
docker-compose exec db psql -U postgres -d cosmic_watch_db -c "
SELECT jti, is_blacklisted, created_at, expires_at
FROM jwt_refresh_tokens
WHERE user_id = (SELECT id FROM auth_user WHERE username='testuser')
ORDER BY created_at DESC
LIMIT 1;
"
```

**Expected Output:**
```
         jti          | is_blacklisted |      created_at       |      expires_at
----------------------+----------------+-----------------------+-----------------------
 a1b2c3d4-e5f6-7g8h... | t              | 2024-01-15 10:30:00   | 2024-02-14 10:30:00
```

---

## ✅ **SUCCESS CRITERIA**

After completing these steps, you should have:

- ✅ Docker services running (PostgreSQL + Django + Redis)
- ✅ All migrations applied (`tracker.0001_initial`)
- ✅ 4 JWT tables created:
  - `jwt_refresh_tokens` (Token storage with blacklist)
  - `jwt_access_tokens` (Audit trail)
  - `user_login_sessions` (Session tracking)
  - `user_profiles` (Extended user info)
- ✅ JWT authentication working (register, login, logout)
- ✅ Tokens stored in database with device/IP tracking
- ✅ Login sessions recorded with device fingerprinting
- ✅ Token blacklisting working on logout
- ✅ Protected endpoints accessible with Bearer token

---

## 🚀 **NEXT: Deploy to Railway**

Once local testing is complete, follow **RAILWAY_DEPLOYMENT.md** for production deployment:

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login to Railway
railway login

# 3. Initialize project
railway init

# 4. Add PostgreSQL service in Railway dashboard

# 5. Set environment variables (see .env.example)

# 6. Deploy
railway up

# 7. Run migrations on Railway
railway run python manage.py migrate

# 8. Create superuser on Railway
railway run python manage.py createsuperuser

# 9. Test production JWT authentication
curl -X POST https://your-app.up.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

---

## 🔧 **Troubleshooting**

### Issue: "docker-compose command not found"
**Solution:**
```bash
# Install Docker Desktop (Windows/Mac)
# Or install docker-compose (Linux)
sudo apt-get install docker-compose
```

### Issue: "Permission denied: docker"
**Solution:**
```bash
# Linux/Mac - Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up -d
```

### Issue: "Port 5432 already in use"
**Solution:**
```bash
# Stop conflicting PostgreSQL service
sudo systemctl stop postgresql

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

### Issue: "Migration failed: relation already exists"
**Solution:**
```bash
# Fake initial migration (if tables already exist)
docker-compose exec web python manage.py migrate --fake-initial

# Or reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
docker-compose exec web python manage.py migrate
```

### Issue: "Token not found in database"
**Solution:**
```bash
# Check if JWT models are imported in tracker/models.py
# File should contain:
from .jwt_models import RefreshToken, AccessToken, LoginSession, UserProfile

# Verify migrations applied
docker-compose exec web python manage.py showmigrations tracker
```

---

## 📚 **Documentation Reference**

| Document | Purpose |
|----------|---------|
| [RAILWAY_MIGRATION_STATUS.md](RAILWAY_MIGRATION_STATUS.md) | Complete status report with all details |
| [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) | Production deployment guide |
| [RAILWAY_SETUP.py](RAILWAY_SETUP.py) | Database configuration reference |
| [.env.example](.env.example) | Environment variables template |
| [API_REFERENCE.md](API_REFERENCE.md) | API endpoints documentation |

---

## ✨ **You're All Set!**

JWT authentication is now configured with:
- ✅ Token storage in PostgreSQL
- ✅ Device fingerprinting  
- ✅ Session tracking
- ✅ Token blacklisting on logout
- ✅ User profiles with 2FA support
- ✅ Security audit trail

**Next steps:** Deploy to Railway for production! 🚀
