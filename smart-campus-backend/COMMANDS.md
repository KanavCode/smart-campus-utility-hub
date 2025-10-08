# 🎯 Smart Campus Backend - Command Reference

## 📦 Installation & Setup

```powershell
# Install dependencies
npm install

# Automated setup (recommended)
.\setup.ps1

# Manual database migration
node sql/migrate.js

# Test database connection
node test-db.js
```

---

## 🚀 Running the Server

```powershell
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Specify custom port
PORT=3000 npm start
```

---

## 🧪 Testing

```powershell
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest __tests__/auth.test.js

# Run tests and exit (CI mode)
npx jest --forceExit
```

---

## 🗄️ Database Commands

```powershell
# PostgreSQL CLI
psql -U postgres

# Connect to specific database
psql -U postgres -d smart_campus_unified

# Run migration
node sql/migrate.js

# List all databases (in psql)
\l

# List all tables (in psql)
\dt

# Describe table structure (in psql)
\d users

# Exit psql
\q

# Drop and recreate database (CAREFUL!)
# In psql:
DROP DATABASE smart_campus_unified;
CREATE DATABASE smart_campus_unified;
```

---

## 🔍 Health Checks

```powershell
# Check server health
curl http://localhost:5000/api/health

# Or in PowerShell
Invoke-WebRequest http://localhost:5000/api/health

# Or open in browser
start http://localhost:5000/api/health
```

---

## 📝 API Testing

```powershell
# Register new user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"full_name":"Test User","email":"test@example.com","password":"password123","role":"student"}'

# Login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace YOUR_TOKEN)
curl http://localhost:5000/api/auth/profile `
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all events
curl http://localhost:5000/api/events

# Search events
curl "http://localhost:5000/api/events?search=tech&upcoming=true"
```

---

## 🛠️ Development Commands

```powershell
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PostgreSQL version
psql --version

# List installed packages
npm list --depth=0

# Update packages
npm update

# Audit for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Clean install (if issues occur)
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📊 Logs & Debugging

```powershell
# View application logs (if using winston file logging)
Get-Content logs/combined.log -Tail 20

# View error logs
Get-Content logs/error.log -Tail 20

# Run with debug output
$env:DEBUG="*"; npm run dev

# Run with verbose logging
$env:LOG_LEVEL="debug"; npm run dev
```

---

## 🔐 Environment Management

```powershell
# View current environment
echo $env:NODE_ENV

# Set to production
$env:NODE_ENV="production"

# Set to development
$env:NODE_ENV="development"

# Load .env variables (automatically loaded by app)
# No manual command needed - handled by dotenv
```

---

## 🎯 Quick Troubleshooting

```powershell
# Port already in use? Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Database connection issues? Restart PostgreSQL
net stop postgresql-x64-14
net start postgresql-x64-14

# Or restart PostgreSQL service via Services app
services.msc

# Check if PostgreSQL is running
Get-Service postgresql*

# Clear npm cache
npm cache clean --force
```

---

## 📚 Documentation Files

- `README.md` - Project overview
- `DATABASE_SETUP.md` - PostgreSQL setup guide (START HERE!)
- `API_DOCUMENTATION.md` - Complete API reference
- `INTEGRATION_GUIDE.md` - Deployment & integration guide

---

## 🚀 Production Deployment

```powershell
# Set environment to production
$env:NODE_ENV="production"

# Install production dependencies only
npm ci --production

# Run database migration
node sql/migrate.js

# Start server
npm start
```

---

## 📌 Important URLs (when server is running)

- **API Base:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health
- **Register:** http://localhost:5000/api/auth/register
- **Login:** http://localhost:5000/api/auth/login
- **Events:** http://localhost:5000/api/events
- **Clubs:** http://localhost:5000/api/clubs
- **Timetable:** http://localhost:5000/api/timetable
- **Electives:** http://localhost:5000/api/electives

---

## ⚡ Quick Test Sequence

```powershell
# 1. Install & Setup
npm install
.\setup.ps1

# 2. Start server
npm run dev

# 3. In another terminal, test health
curl http://localhost:5000/api/health

# 4. Run tests
npm test

# 5. Register a test user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"full_name":"Test Student","email":"student@test.com","password":"Test123!","role":"student","department":"Computer Science","cgpa":8.5,"semester":5}'

# ✅ All working? You're good to go!
```

---

**Need more help?** Check the documentation files or open an issue!
