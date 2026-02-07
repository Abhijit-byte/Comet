"""
Railway PostgreSQL Database Configuration
=========================================

This file contains the settings needed to connect your Django app to Railway PostgreSQL.

STEP 1: Get your Railway PostgreSQL credentials
------------------------------------------------
1. Go to https://railway.app/
2. Create a new project or open existing project
3. Add PostgreSQL database service
4. Go to the PostgreSQL service → Variables tab
5. Copy the following variables:
   - DATABASE_URL (full connection string)
   OR individual variables:
   - PGHOST
   - PGPORT  
   - PGUSER
   - PGPASSWORD
   - PGDATABASE

STEP 2: Set Environment Variables
----------------------------------
You have two options:

Option A: Use DATABASE_URL (Recommended)
Add this to your Railway environment variables or .env file:

DATABASE_URL=postgresql://user:password@host:port/database

Option B: Use individual variables
Add these to your Railway environment variables or .env file:

DB_HOST=your-railway-db-host.railway.app
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your-password

STEP 3: Additional Railway Settings
------------------------------------
Add these to your Railway environment variables:

SECRET_KEY=your-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-app.railway.app,your-custom-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.railway.app,https://your-custom-domain.com

STEP 4: Deploy to Railway
--------------------------
1. Create railway.json (or use railway.toml)
2. Push your code to GitHub
3. Connect GitHub repo to Railway
4. Railway will automatically:
   - Install dependencies from requirements.txt
   - Run migrations
   - Collect static files
   - Start your app

STEP 5: Run Migrations on Railway
----------------------------------
After first deployment, run migrations:

railway run python manage.py migrate

Or use Railway's built-in Deployments → Run Command feature.

STEP 6: Create Superuser on Railway
------------------------------------
railway run python manage.py createsuperuser

TROUBLESHOOTING
---------------
If you get connection errors:
1. Check Railway PostgreSQL is running (green status)
2. Verify all environment variables are set correctly
3. Check ALLOWED_HOSTS includes your Railway domain
4. Ensure DATABASE_URL or individual DB variables are correct
5. Check Railway logs for detailed error messages

SECURITY NOTES
--------------
- Never commit credentials to Git
- Use Railway's environment variables for all secrets
- Set DEBUG=False in production
- Use strong SECRET_KEY
- Enable SSL for database connections
- Set secure CORS_ALLOWED_ORIGINS
"""

# Example Django settings configuration for Railway
RAILWAY_DATABASE_CONFIG = """
# Add this to your settings.py

import os
import dj_database_url

# Option 1: Use DATABASE_URL (Railway default)
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Option 2: Use individual environment variables
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DB_NAME', 'cosmic_watch'),
            'USER': os.environ.get('DB_USER', 'postgres'),
            'PASSWORD': os.environ.get('DB_PASSWORD', 'postgres'),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'OPTIONS': {
                'sslmode': 'require' if not DEBUG else 'prefer',
            },
        }
    }
"""

print(__doc__)
