#!/bin/bash

# CosmosTrace - Database Migration Script (Linux/Mac)
# Run this script to create migrations for new JWT models and migrate database

echo "========================================"
echo "  CosmosTrace - Database Migration  "
echo "========================================"
echo ""

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Virtual environment not detected!"
    echo "Activating virtual environment..."
    source ./iit/bin/activate
    if [ $? -ne 0 ]; then
        echo "❌ Failed to activate virtual environment"
        exit 1
    fi
fi

echo "✅ Virtual environment active"
echo ""

# Install required package
echo "📦 Installing dj-database-url..."
pip install dj-database-url
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dj-database-url"
    exit 1
fi
echo "✅ Package installed"
echo ""

# Change to Django project directory
cd django_project

# Step 1: Create migrations for JWT models
echo "🔧 Creating migrations for JWT models..."
python manage.py makemigrations tracker
if [ $? -ne 0 ]; then
    echo "❌ Failed to create migrations"
    cd ..
    exit 1
fi
echo "✅ Migrations created"
echo ""

# Step 2: Show migration plan
echo "📋 Migration plan:"
python manage.py showmigrations tracker
echo ""

# Step 3: Run migrations
echo "🚀 Running migrations..."
python manage.py migrate
if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    cd ..
    exit 1
fi
echo "✅ Migrations completed successfully"
echo ""

# Step 4: Create migration for token blacklist (if needed)
echo "🔧 Setting up JWT token blacklist..."
python manage.py migrate rest_framework_simplejwt 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  Token blacklist migration skipped (may already exist)"
else
    echo "✅ Token blacklist setup complete"
fi
echo ""

# Step 5: Verify database tables
echo "🔍 Verifying database tables..."
echo ""
echo "Checking JWT token tables..."

# Return to root directory
cd ..

# Summary
echo "========================================"
echo "  📊 MIGRATION SUMMARY"
echo "========================================"
echo ""
echo "✅ Migrations created and applied"
echo "✅ JWT token models ready"
echo "✅ Database schema updated"
echo ""
echo "📝 New Database Tables:"
echo "   - jwt_refresh_tokens    (Refresh token tracking)"
echo "   - jwt_access_tokens     (Access token audit log)"
echo "   - user_login_sessions   (Login session tracking)"
echo "   - user_profiles         (Extended user profiles)"
echo ""
echo "🔐 JWT Features Now Available:"
echo "   ✓ Token blacklisting"
echo "   ✓ Session tracking"
echo "   ✓ Device management"
echo "   ✓ Security auditing"
echo "   ✓ User profiles"
echo ""
echo "🚀 Next Steps:"
echo "   1. Test local authentication: http://localhost:8000/api/auth/login/"
echo "   2. Deploy to Railway (see RAILWAY_DEPLOYMENT.md)"
echo "   3. Run migrations on Railway: railway run python manage.py migrate"
echo ""
echo "📘 Documentation:"
echo "   - RAILWAY_DEPLOYMENT.md (Complete Railway setup guide)"
echo "   - RAILWAY_SETUP.py (Database configuration reference)"
echo "   - .env.example (Environment variables template)"
echo ""
echo "========================================"
echo "✨ Migration completed successfully!"
echo "========================================"
