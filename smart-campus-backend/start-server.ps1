# Start Backend Server Script
Write-Host "🚀 Starting Smart Campus Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location "m:\smarthub\smart-campus-utility-hub\smart-campus-backend"

# Start the server
node src/app.js
