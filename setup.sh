#!/bin/bash

# CosmosTrace Django Setup Script
# This script automates the initial setup and deployment

set -e

echo "=========================================="
echo "CosmosTrace Django Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}.env file created. Please edit it with your configuration.${NC}"
    echo ""
    read -p "Press Enter to continue after editing .env..."
fi

# Ask for superuser details
echo ""
echo -e "${YELLOW}Django Superuser Setup${NC}"
read -p "Username: " DJANGO_SUPERUSER_USERNAME
read -p "Email: " DJANGO_SUPERUSER_EMAIL
read -sp "Password: " DJANGO_SUPERUSER_PASSWORD
echo ""

# Start services
echo ""
echo -e "${YELLOW}Starting Docker services...${NC}"
docker-compose up -d

# Wait for database to be ready
echo -e "${YELLOW}Waiting for database to be ready...${NC}"
sleep 10

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
docker-compose exec -T web python manage.py migrate

# Create superuser
echo -e "${YELLOW}Creating superuser...${NC}"
docker-compose exec -T web python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD')
    print("Superuser created successfully!")
else:
    print("Superuser already exists!")
EOF

# Collect static files
echo -e "${YELLOW}Collecting static files...${NC}"
docker-compose exec -T web python manage.py collectstatic --noinput

# Print summary
echo ""
echo -e "${GREEN}=========================================="
echo "Setup Complete!"
echo "==========================================${NC}"
echo ""
echo "Services running:"
echo "  - Django API: http://localhost:8000"
echo "  - Admin Panel: http://localhost:8000/admin/"
echo "  - Health Check: http://localhost:8000/health/"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "Superuser credentials:"
echo "  Username: $DJANGO_SUPERUSER_USERNAME"
echo "  Email: $DJANGO_SUPERUSER_EMAIL"
echo ""
echo "Next steps:"
echo "  1. Log in to admin panel with superuser credentials"
echo "  2. Configure alert preferences"
echo "  3. Add watched asteroids"
echo "  4. Enable email notifications"
echo ""
echo "View logs with:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services with:"
echo "  docker-compose down"
echo ""
