# ============================================
# COSMIC WATCH - RAILWAY DEPLOYMENT GUIDE
# ============================================

## 📦 **Step 1: Install Required Package**

Add `dj-database-url` to requirements.txt:

```bash
pip install dj-database-url
pip freeze > requirements.txt
```

Or add this line to requirements.txt:
```
dj-database-url==2.1.0
```

## 🚀 **Step 2: Create Railway Project**

1. Go to https://railway.app/
2. Sign up or login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Connect your GitHub account
6. Select your Cosmic Watch repository

## 🗄️ **Step 3: Add PostgreSQL Database**

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically provision a PostgreSQL database
4. Click on the PostgreSQL service to see connection details

## 🔑 **Step 4: Configure Environment Variables**

In Railway project → Your service → Variables tab, add:

### Required Variables:
```
DEBUG=False
SECRET_KEY=your-production-secret-key-here-generate-new-one
ALLOWED_HOSTS=${{RAILWAY_PUBLIC_DOMAIN}},${{RAILWAY_STATIC_URL}},your-custom-domain.com
```

### Database (Automatically set by Railway):
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### CORS Configuration:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://${{RAILWAY_PUBLIC_DOMAIN}}
```

### NASA API:
```
NASA_API_KEY=BtS3sRoAXOeRx0YS8M5EjFUYvblVAJd6CZy3mulD
```

## 📝 **Step 5: Run Migrations**

After deployment, run migrations in Railway:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run python manage.py migrate
```

**Option B: Using Railway Dashboard**
1. Go to your service in Railway dashboard
2. Click "Deployments" tab
3. Click "..." on latest deployment
4. Select "Run Command"
5. Enter: `python manage.py migrate`

## 👤 **Step 6: Create Superuser**

```bash
# Using Railway CLI
railway run python manage.py createsuperuser

# Or using Railway dashboard Run Command:
python manage.py createsuperuser --username admin --email admin@example.com
```

## 🔄 **Step 7: Create JWT Token Tables**

The new JWT models need to be migrated:

```bash
# Create migrations for JWT models
railway run python manage.py makemigrations tracker

# Apply migrations
railway run python manage.py migrate tracker
```

## ✅ **Step 8: Verify Deployment**

1. Check your Railway public URL (provided after deployment)
2. Visit: `https://your-app.railway.app/admin/`
3. Login with superuser credentials
4. Test API endpoints:
   - `https://your-app.railway.app/api/asteroids/`
   - `https://your-app.railway.app/api/auth/login/`

## 🔐 **Step 9: Test JWT Authentication**

```bash
# Register new user
curl -X POST https://your-app.railway.app/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Login to get tokens
curl -X POST https://your-app.railway.app/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Test authenticated endpoint
curl https://your-app.railway.app/api/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 **Step 10: Monitor Your Application**

Railway provides built-in monitoring:
1. Go to your service → Metrics tab
2. View CPU, Memory, Network usage
3. Check Logs tab for application logs
4. Set up alerts for errors

## 🔄 **Automatic Deployments**

Railway automatically deploys when you push to your GitHub repo:
1. Make changes to your code
2. Commit and push to GitHub
3. Railway detects changes and redeploys
4. Migrations run automatically (if configured in railway.json)

## 🛠️ **Troubleshooting**

### Database Connection Errors:
```bash
# Check DATABASE_URL is set correctly
railway variables

# Test database connection
railway run python manage.py dbshell --no-startup
```

### Migration Errors:
```bash
# Show current migrations
railway run python manage.py showmigrations

# Fake initial migration if needed
railway run python manage.py migrate --fake-initial
```

### Static Files Not Loading:
```bash
# Collect static files
railway run python manage.py collectstatic --noinput

# Check STATIC_ROOT setting in settings.py
```

### View Logs:
```bash
# Using Railway CLI
railway logs

# Or view in Railway dashboard → Logs tab
```

## 📱 **Connect Next.js Frontend**

Update your Next.js environment variables:

```env
# .env.local
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

Deploy frontend to:
- Vercel
- Railway (separate service)
- Netlify

## 🔒 **Security Checklist**

- ✅ DEBUG=False in production
- ✅ Strong SECRET_KEY (generate new one)
- ✅ ALLOWED_HOSTS properly configured
- ✅ CORS_ALLOWED_ORIGINS limited to your domains
- ✅ Database SSL enabled (automatic on Railway)
- ✅ No credentials in Git repository
- ✅ Use environment variables for all secrets
- ✅ Enable Django security middleware

## 📈 **Performance Optimization**

1. **Connection Pooling**: Already enabled with `conn_max_age=600`
2. **Static Files**: Use CDN or Railway's built-in static file serving
3. **Caching**: Add Redis service for caching
4. **Database Indexing**: Migrations include proper indexes

## 🎯 **Next Steps**

1. Set up custom domain in Railway
2. Configure SSL certificate (automatic with Railway)
3. Add Redis for caching and Celery tasks
4. Set up monitoring with Sentry
5. Configure S3 for media files (if needed)
6. Set up automated backups for database

## 📞 **Need Help?**

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Django Docs: https://docs.djangoproject.com/
- Your API Documentation: See API_REFERENCE.md

---

**🚀 Your Cosmic Watch backend is now live on Railway with PostgreSQL!**
