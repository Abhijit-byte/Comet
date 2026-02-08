@echo off
REM CosmosTrace Django Setup Script for Windows

echo ==========================================
echo CosmosTrace Django Setup
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Docker Compose is not installed or not in PATH
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo .env file created. Please edit it with your configuration.
    echo.
    pause
)

REM Start services
echo.
echo Starting Docker services...
docker-compose up -d

REM Wait for database
echo Waiting for database to be ready...
timeout /t 10

REM Run migrations
echo.
echo Running database migrations...
docker-compose exec -T web python manage.py migrate

REM Create superuser
echo Creating superuser...
echo.
set /p DJANGO_SUPERUSER_USERNAME=Enter superuser username: 
set /p DJANGO_SUPERUSER_EMAIL=Enter superuser email: 
set /p DJANGO_SUPERUSER_PASSWORD=Enter superuser password: 

docker-compose exec -T web python manage.py shell <<EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='%DJANGO_SUPERUSER_USERNAME%').exists():
    User.objects.create_superuser('%DJANGO_SUPERUSER_USERNAME%', '%DJANGO_SUPERUSER_EMAIL%', '%DJANGO_SUPERUSER_PASSWORD%')
    print("Superuser created successfully!")
else:
    print("Superuser already exists!")
EOF

REM Collect static files
echo.
echo Collecting static files...
docker-compose exec -T web python manage.py collectstatic --noinput

REM Print summary
echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Services running:
echo   - Django API: http://localhost:8000
echo   - Admin Panel: http://localhost:8000/admin/
echo   - Health Check: http://localhost:8000/health/
echo   - PostgreSQL: localhost:5432
echo   - Redis: localhost:6379
echo.
echo Superuser credentials:
echo   Username: %DJANGO_SUPERUSER_USERNAME%
echo   Email: %DJANGO_SUPERUSER_EMAIL%
echo.
echo Next steps:
echo   1. Log in to admin panel with superuser credentials
echo   2. Configure alert preferences
echo   3. Add watched asteroids
echo   4. Enable email notifications
echo.
echo View logs with:
echo   docker-compose logs -f
echo.
echo Stop services with:
echo   docker-compose down
echo.
pause
