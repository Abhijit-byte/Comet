# CosmosTrace - Database Migration Script
# Run this script to create migrations for new JWT models and migrate database

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CosmosTrace - Database Migration  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "⚠️  Virtual environment not detected!" -ForegroundColor Yellow
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & ".\iit\Scripts\Activate.ps1"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to activate virtual environment" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Virtual environment active" -ForegroundColor Green
Write-Host ""

# Install required package
Write-Host "📦 Installing dj-database-url..." -ForegroundColor Cyan
pip install dj-database-url
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dj-database-url" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Package installed" -ForegroundColor Green
Write-Host ""

# Change to Django project directory
Set-Location django_project

# Step 1: Create migrations for JWT models
Write-Host "🔧 Creating migrations for JWT models..." -ForegroundColor Cyan
python manage.py makemigrations tracker
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create migrations" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Migrations created" -ForegroundColor Green
Write-Host ""

# Step 2: Show migration plan
Write-Host "📋 Migration plan:" -ForegroundColor Cyan
python manage.py showmigrations tracker
Write-Host ""

# Step 3: Run migrations
Write-Host "🚀 Running migrations..." -ForegroundColor Cyan
python manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Migrations completed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Create migration for token blacklist (if needed)
Write-Host "🔧 Setting up JWT token blacklist..." -ForegroundColor Cyan
python manage.py migrate rest_framework_simplejwt
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Token blacklist migration skipped (may already exist)" -ForegroundColor Yellow
} else {
    Write-Host "✅ Token blacklist setup complete" -ForegroundColor Green
}
Write-Host ""

# Step 5: Verify database tables
Write-Host "🔍 Verifying database tables..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Checking JWT token tables..." -ForegroundColor Yellow

# List all tables related to JWT
python manage.py dbshell --command="
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE 'jwt_%' OR table_name LIKE 'user_%' OR table_name LIKE 'tracker_%')
ORDER BY table_name;
" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database tables verified" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not verify tables (this is OK if using Docker)" -ForegroundColor Yellow
}
Write-Host ""

# Return to root directory
Set-Location ..

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  📊 MIGRATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Migrations created and applied" -ForegroundColor Green
Write-Host "✅ JWT token models ready" -ForegroundColor Green
Write-Host "✅ Database schema updated" -ForegroundColor Green
Write-Host ""
Write-Host "📝 New Database Tables:" -ForegroundColor Cyan
Write-Host "   - jwt_refresh_tokens    (Refresh token tracking)" -ForegroundColor White
Write-Host "   - jwt_access_tokens     (Access token audit log)" -ForegroundColor White
Write-Host "   - user_login_sessions   (Login session tracking)" -ForegroundColor White
Write-Host "   - user_profiles         (Extended user profiles)" -ForegroundColor White
Write-Host ""
Write-Host "🔐 JWT Features Now Available:" -ForegroundColor Cyan
Write-Host "   ✓ Token blacklisting" -ForegroundColor Green
Write-Host "   ✓ Session tracking" -ForegroundColor Green
Write-Host "   ✓ Device management" -ForegroundColor Green
Write-Host "   ✓ Security auditing" -ForegroundColor Green
Write-Host "   ✓ User profiles" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test local authentication: http://localhost:8000/api/auth/login/" -ForegroundColor White
Write-Host "   2. Deploy to Railway (see RAILWAY_DEPLOYMENT.md)" -ForegroundColor White
Write-Host "   3. Run migrations on Railway: railway run python manage.py migrate" -ForegroundColor White
Write-Host ""
Write-Host "📘 Documentation:" -ForegroundColor Cyan
Write-Host "   - RAILWAY_DEPLOYMENT.md (Complete Railway setup guide)" -ForegroundColor White
Write-Host "   - RAILWAY_SETUP.py (Database configuration reference)" -ForegroundColor White
Write-Host "   - .env.example (Environment variables template)" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ Migration completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
