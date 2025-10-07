# Quick Start Script for Timetable Generator Backend

# This script helps you quickly set up and start the backend server

Write-Host "🚀 Intelligent College Timetable Generator - Quick Start" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is available
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Please configure your environment variables." -ForegroundColor Yellow
    Write-Host "   Copy .env.example to .env and update the values." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Set up PostgreSQL database 'timetable_db'" -ForegroundColor White
Write-Host "2. Run the SQL schema: psql -U postgres -d timetable_db -f sql/schema.sql" -ForegroundColor White
Write-Host "3. Update .env file with your database credentials" -ForegroundColor White
Write-Host "4. Start the server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🌐 API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📖 Documentation: README.md" -ForegroundColor Cyan
Write-Host "🔗 Frontend Integration Guide: FRONTEND_INTEGRATION.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green