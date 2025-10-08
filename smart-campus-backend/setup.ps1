# Smart Campus Backend - Quick Setup Script
# Run this script after installing PostgreSQL and creating the database

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Smart Campus Backend - Quick Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and configure your database credentials" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Test database connection
Write-Host ""
Write-Host "🔍 Testing database connection..." -ForegroundColor Yellow
node test-db.js
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. PostgreSQL is running" -ForegroundColor White
    Write-Host "  2. Database 'smart_campus_unified' exists" -ForegroundColor White
    Write-Host "  3. Credentials in .env are correct" -ForegroundColor White
    Write-Host ""
    Write-Host "See DATABASE_SETUP.md for detailed instructions" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Database connection successful" -ForegroundColor Green

# Run migrations
Write-Host ""
Write-Host "📋 Running database migrations..." -ForegroundColor Yellow
node sql/migrate.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host "See sql/migrate.js output for details" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Database schema created" -ForegroundColor Green

# Run tests
Write-Host ""
Write-Host "🧪 Running test suite..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Some tests failed, but setup is complete" -ForegroundColor Yellow
} else {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
}

# Success message
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Start the development server:" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 API Documentation:" -ForegroundColor Cyan
Write-Host "   API_DOCUMENTATION.md" -ForegroundColor White
Write-Host ""
Write-Host "🏥 Health Check:" -ForegroundColor Cyan
Write-Host "   http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
