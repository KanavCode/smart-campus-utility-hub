# 🗄️ PostgreSQL Database Setup Guide

## Step 1: Install PostgreSQL

### Windows Installation:

1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (recommended version: PostgreSQL 14 or higher)
3. During installation, remember the **password** you set for the `postgres` user
4. Default port is **5432** (keep it unless you have conflicts)
5. Install pgAdmin 4 (GUI tool for managing PostgreSQL)

### Verify Installation:

```powershell
# Check PostgreSQL version
psql --version

# Should output something like: psql (PostgreSQL) 14.x
```

---

## Step 2: Access PostgreSQL

### Option A: Using Command Line (psql)

```powershell
# Connect to PostgreSQL
psql -U postgres

# You'll be prompted for the password you set during installation
```

### Option B: Using pgAdmin 4 (GUI)

1. Open pgAdmin 4
2. Right-click "Servers" → Register → Server
3. Name: `Smart Campus Local`
4. Connection tab:
   - Host: `localhost`
   - Port: `5432`
   - Username: `postgres`
   - Password: (your postgres password)
5. Click "Save"

---

## Step 3: Create Database

### Using psql:

```sql
-- Connect to PostgreSQL (if not already connected)
psql -U postgres

-- Create the database
CREATE DATABASE smart_campus_unified;

-- Verify database creation
\l

-- Connect to the new database
\c smart_campus_unified

-- You should see: "You are now connected to database "smart_campus_unified""
```

### Using pgAdmin 4:

1. Right-click "Databases" → Create → Database
2. Database name: `smart_campus_unified`
3. Owner: `postgres`
4. Click "Save"

---

## Step 4: Run Database Migration

Now that the database exists, run the schema migration:

```powershell
# Navigate to your backend directory (if not already there)
cd M:\smarthub\smart-campus-utility-hub\smart-campus-backend

# Run the migration script to create all tables
node sql/migrate.js
```

**Expected Output:**

```
✅ Database connection successful
✅ Smart Campus database schema created successfully
✅ Migration completed
```

---

## Step 5: Update .env File

Open `.env` and update the database credentials:

```env
# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_campus_unified
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE  # ⚠️ Change this to your postgres password
```

**Important:** Replace `YOUR_ACTUAL_PASSWORD_HERE` with the password you set during PostgreSQL installation.

---

## Step 6: Test Database Connection

Run the database connection test:

```powershell
node test-db.js
```

**Expected Output:**

```
✅ Database connection successful!
Database: smart_campus_unified
User: postgres
Host: localhost
Port: 5432
```

---

## 🚀 Final Run Commands

### Development Mode (with auto-restart):

```powershell
npm run dev
```

### Production Mode:

```powershell
npm start
```

### Run Tests:

```powershell
npm test
```

### Run Tests with Coverage:

```powershell
npm run test:coverage
```

---

## 📋 Complete Setup Checklist

- [ ] PostgreSQL installed on your system
- [ ] Database `smart_campus_unified` created
- [ ] `.env` file updated with correct password
- [ ] Database migration completed (`node sql/migrate.js`)
- [ ] Database connection tested (`node test-db.js`)
- [ ] Backend server started (`npm run dev`)
- [ ] Test endpoint: http://localhost:5000/api/health

---

## 🔍 Verify Everything is Working

1. **Start the server:**

   ```powershell
   npm run dev
   ```

2. **Expected output:**

   ```
   ✅ Database connection established successfully
   🚀 Smart Campus Backend server running on port 5000
   📚 API Documentation: http://localhost:5000/api
   🏥 Health Check: http://localhost:5000/api/health
   ```

3. **Test the API:**
   Open your browser or use curl:

   ```powershell
   curl http://localhost:5000/api/health
   ```

   Should return:

   ```json
   {
     "success": true,
     "status": "OK",
     "message": "Smart Campus Backend is running",
     "database": "Connected"
   }
   ```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "psql: command not found"

**Solution:** Add PostgreSQL to your PATH:

1. Find PostgreSQL bin folder (usually `C:\Program Files\PostgreSQL\14\bin`)
2. Add to System Environment Variables → Path
3. Restart terminal

### Issue 2: "password authentication failed"

**Solution:**

- Double-check your password in `.env`
- Reset postgres password:
  ```sql
  ALTER USER postgres PASSWORD 'new_password';
  ```

### Issue 3: "database does not exist"

**Solution:**

- Make sure you created the database: `CREATE DATABASE smart_campus_unified;`
- Check database name spelling in `.env`

### Issue 4: "port 5432 already in use"

**Solution:**

- Another PostgreSQL instance might be running
- Check Task Manager → Services → postgresql-x64-14
- Restart the PostgreSQL service

### Issue 5: "ECONNREFUSED ::1:5432"

**Solution:**

- PostgreSQL might not be running
- Start PostgreSQL service:
  ```powershell
  # Windows
  net start postgresql-x64-14
  ```

### Issue 6: Migration script fails

**Solution:**

- Make sure database is empty or drop existing tables
- Run in psql:
  ```sql
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  ```
- Then run migration again

---

## 🔐 Security Best Practices

1. **Never commit `.env` file** (already in .gitignore)
2. **Use strong passwords** for production
3. **Change JWT_SECRET** to a random string (min 32 characters)
4. **Create separate database user** for production:
   ```sql
   CREATE USER smart_campus_app WITH PASSWORD 'strong_password';
   GRANT ALL PRIVILEGES ON DATABASE smart_campus_unified TO smart_campus_app;
   ```

---

## 📊 Database Schema Overview

After migration, you'll have **15 tables**:

| Table                         | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `users`                       | Unified user authentication & profiles |
| `clubs`                       | Campus clubs/organizations             |
| `events`                      | Campus events                          |
| `saved_events`                | Student saved events                   |
| `electives`                   | Available elective courses             |
| `student_choices`             | Student elective preferences           |
| `allocated_electives`         | Final elective allocations             |
| `teachers`                    | Faculty information                    |
| `subjects`                    | Course catalog                         |
| `rooms`                       | Classroom/lab information              |
| `student_groups`              | Class groups/sections                  |
| `teacher_subject_assignments` | Teacher-subject mapping                |
| `subject_class_assignments`   | Subject-group mapping                  |
| `teacher_unavailability`      | Teacher schedule constraints           |
| `timetable_slots`             | Generated timetable entries            |

---

## 🎯 Next Steps

After successful database setup:

1. ✅ Start the backend server: `npm run dev`
2. 📝 Test API endpoints using the provided `API_DOCUMENTATION.md`
3. 🧪 Run the test suite: `npm test`
4. 🎨 Begin frontend integration
5. 📊 Populate sample data (optional)

---

**Need Help?** Check `INTEGRATION_GUIDE.md` and `API_DOCUMENTATION.md` for more details.
