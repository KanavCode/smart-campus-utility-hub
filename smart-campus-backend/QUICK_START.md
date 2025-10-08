# ⚡ Quick Start Guide - Common Mistakes & Solutions

## ❌ Common Error: Running PowerShell Script in psql

### The Problem:

```
smart_campus_unified=# .\setup.ps1
invalid command \setup.ps1
```

**Why this happens:** You're inside the PostgreSQL command line (`psql`), which only understands SQL commands, not PowerShell scripts!

### ✅ Solution:

**Step 1: Exit PostgreSQL**

```powershell
# If you see this prompt: smart_campus_unified=#
# Just type:
\q

# Or press: Ctrl+C
```

**Step 2: Make sure you're in the right directory**

```powershell
# Check where you are
pwd

# Should show: M:\smarthub\smart-campus-utility-hub\smart-campus-backend
# If not, navigate there:
cd M:\smarthub\smart-campus-utility-hub\smart-campus-backend
```

**Step 3: Run the setup script**

```powershell
# Now run the setup script (in PowerShell, NOT in psql!)
.\setup.ps1
```

---

## 📋 Complete Setup Process (From Scratch)

### 1️⃣ Create Database (One-time setup)

```powershell
# Open PostgreSQL command line
psql -U postgres

# You'll see: postgres=#

# Create database
CREATE DATABASE smart_campus_unified;

# Should see: CREATE DATABASE

# Exit PostgreSQL
\q

# Now you're back in PowerShell
```

### 2️⃣ Configure Environment

```powershell
# Open .env file and update your password
# Look for this line:
DB_PASSWORD=your_password_here

# Change it to your actual PostgreSQL password
DB_PASSWORD=YourActualPassword
```

### 3️⃣ Run Setup Script

```powershell
# Make sure you're in the backend directory
cd M:\smarthub\smart-campus-utility-hub\smart-campus-backend

# Run setup
.\setup.ps1
```

### 4️⃣ Start the Server

```powershell
# Development mode
npm run dev

# You should see:
# ✅ Database connection established successfully
# 🚀 Smart Campus Backend server running on port 5000
```

---

## 🎯 Quick Commands Reference

### PostgreSQL Commands (use in `psql` terminal)

```sql
-- Create database (if not exists)
CREATE DATABASE smart_campus_unified;

-- List all databases
\l

-- Connect to database
\c smart_campus_unified

-- List all tables (after migration)
\dt

-- Exit PostgreSQL
\q
```

### PowerShell Commands (use in normal terminal)

```powershell
# Navigate to backend
cd M:\smarthub\smart-campus-utility-hub\smart-campus-backend

# Install dependencies
npm install

# Test database connection
node test-db.js

# Run migrations
node sql/migrate.js

# Run setup script (does all above)
.\setup.ps1

# Start development server
npm run dev

# Run tests
npm test
```

---

## 🔍 How to Know Which Terminal You're In?

### PostgreSQL Terminal (`psql`)

```
postgres=#           ← You're in default database
smart_campus_unified=#   ← You're in your database
```

**Use SQL commands here:** `CREATE DATABASE`, `\l`, `\dt`, `\q`

### PowerShell Terminal

```
PS M:\smarthub\smart-campus-utility-hub\smart-campus-backend>
```

**Use PowerShell/Node commands here:** `npm`, `node`, `.\setup.ps1`

---

## 📊 Step-by-Step Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: Open PowerShell (Windows Terminal)            │
├─────────────────────────────────────────────────────────┤
│  PS M:\>                                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Step 2: Connect to PostgreSQL to create database      │
├─────────────────────────────────────────────────────────┤
│  PS M:\> psql -U postgres                               │
│  postgres=# CREATE DATABASE smart_campus_unified;       │
│  postgres=# \q                                          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Step 3: Navigate to backend directory                 │
├─────────────────────────────────────────────────────────┤
│  PS M:\> cd smart-campus-utility-hub\smart-campus-backend│
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Step 4: Update .env file with your password           │
├─────────────────────────────────────────────────────────┤
│  Edit .env: DB_PASSWORD=your_actual_password            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Step 5: Run setup script (in PowerShell!)             │
├─────────────────────────────────────────────────────────┤
│  PS M:\...\smart-campus-backend> .\setup.ps1            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  Step 6: Start the server                              │
├─────────────────────────────────────────────────────────┤
│  PS M:\...\smart-campus-backend> npm run dev            │
└─────────────────────────────────────────────────────────┘
                          ↓
                    ✅ SUCCESS!
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: ".\setup.ps1 : File cannot be loaded"

**Solution:** PowerShell execution policy. Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

### Issue 2: "Database connection failed"

**Solutions:**

- Check PostgreSQL is running: `Get-Service postgresql*`
- Verify password in `.env` is correct
- Ensure database exists: `psql -U postgres -c "\l"`

### Issue 3: "npm command not found"

**Solution:** Install Node.js from https://nodejs.org/

### Issue 4: "psql command not found"

**Solution:** Add PostgreSQL to PATH:

1. Find: `C:\Program Files\PostgreSQL\14\bin`
2. Add to System Environment Variables → Path
3. Restart PowerShell

---

## 🎯 One-Command Setup (After Database Created)

If you have database created and .env configured:

```powershell
cd M:\smarthub\smart-campus-utility-hub\smart-campus-backend; .\setup.ps1; npm run dev
```

This will:

1. Navigate to backend directory
2. Run setup (install, migrate, test)
3. Start the server

---

## 📞 Still Having Issues?

Check these files for detailed help:

- `DATABASE_SETUP.md` - Complete PostgreSQL setup
- `COMMANDS.md` - All available commands
- `API_DOCUMENTATION.md` - API endpoint reference
- `INTEGRATION_GUIDE.md` - Deployment guide

---

**Remember:**

- Use `psql` for **database creation** (SQL commands)
- Use **PowerShell** for **everything else** (npm, node, scripts)

Good luck! 🚀
