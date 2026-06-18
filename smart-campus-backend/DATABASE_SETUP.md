# 🗄️ Database Setup Guide

Smart Campus Utility Hub uses **Supabase** as its hosted PostgreSQL database. This guide covers both the recommended Supabase setup and the optional local PostgreSQL setup for development.

---

## 🌟 Option A: Supabase (Recommended)

Supabase is a hosted PostgreSQL platform. No local database installation needed.

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (free tier available)
2. Click **"New project"** → choose your organization
3. Fill in:
   - **Project name**: `smart-campus-utility-hub`
   - **Database password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click **"Create new project"** — wait ~2 minutes for setup

### Step 2: Get Your Connection String

1. In your Supabase project, go to **Settings → Database**
2. Scroll to **Connection string** → click the **"Transaction pooler"** tab
3. Copy the URI — it looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

> [!IMPORTANT]
> Use the **Transaction pooler** URI (port 6543), NOT the direct connection (port 5432).
> The Transaction pooler is required for serverless/hosted environments.

### Step 3: Run the Schema

1. In Supabase, go to **SQL Editor → New query**
2. Open the file `smart-campus-backend/sql/schema_supabase.sql` from this project
3. Paste the entire contents into the SQL editor
4. Click **"Run"** — all tables, indexes, and triggers will be created
5. You should see a success message at the bottom

### Step 4: Configure Environment

In `smart-campus-backend/.env`, add your connection string:

```env
# Uncomment and fill in your Supabase connection string
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Optional — for Supabase Storage / Edge Functions in the future
# SUPABASE_URL=https://[project-ref].supabase.co
# SUPABASE_ANON_KEY=your-anon-key
```

> [!NOTE]
> Comment out or remove the individual `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` vars when using `DATABASE_URL`.

### Step 5: Start the Backend

```powershell
cd smart-campus-backend
npm install
npm run dev
```

**Expected output:**
```
✅ Database connected successfully
📅 Server time: 2025-xx-xxTxx:xx:xx.xxxZ
🗄️  Database: postgres
🏢 Host: aws-0-[region].pooler.supabase.com
🚀 Smart Campus Backend server running on port 5000
```

---

## 🏠 Option B: Local PostgreSQL (Dev Only)

Use this if you want a fully local setup without Supabase.

### Step 1: Install PostgreSQL

**Windows:**
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer (recommended: PostgreSQL 14 or higher)
3. Remember the **password** you set for the `postgres` user
4. Default port is **5432**

**Verify:**
```powershell
psql --version
```

### Step 2: Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE smart_campus_unified;
\q
```

### Step 3: Run the Schema

```powershell
# Connect to the new database
psql -U postgres -d smart_campus_unified -f sql/schema.sql
```

### Step 4: Configure Environment

In `smart-campus-backend/.env`, ensure `DATABASE_URL` is commented out and fill in the individual vars:

```env
# Local PostgreSQL (DATABASE_URL must be commented out or absent)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_campus_unified
DB_USER=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
```

### Step 5: Start the Backend

```powershell
npm run dev
```

---

## 📋 Complete Setup Checklist

### Supabase
- [ ] Supabase project created
- [ ] Schema executed in SQL Editor (`schema_supabase.sql`)
- [ ] `DATABASE_URL` set in `.env`
- [ ] Backend starts with "✅ Database connected successfully"
- [ ] Test endpoint: http://localhost:5000/api/health

### Local PostgreSQL
- [ ] PostgreSQL installed and running
- [ ] Database `smart_campus_unified` created
- [ ] Schema applied (`sql/schema.sql`)
- [ ] `.env` updated with correct credentials
- [ ] Backend starts successfully

---

## 🔍 Test the API

```powershell
curl http://localhost:5000/api/health
```

Expected response:
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

### "SSL connection required"
**Solution:** Make sure your `DATABASE_URL` includes a Supabase pooler URI. The `db.js` config automatically enables SSL when `DATABASE_URL` contains `supabase`.

### "password authentication failed"
**Solution:** Double-check the password in your `DATABASE_URL` or `DB_PASSWORD`. Reset in Supabase: Settings → Database → Reset database password.

### "port 5432 already in use"
**Solution:** Another PostgreSQL instance is running. Use port `6543` (Transaction pooler) for Supabase instead.

### "database does not exist"
**Solution:** For local setup, run `CREATE DATABASE smart_campus_unified;` in psql first.

### Migration fails ("relation already exists")
**Solution:** Drop and recreate:
```sql
-- In Supabase SQL Editor or psql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run schema_supabase.sql
```

---

## 🔐 Security Best Practices

1. **Never commit `.env`** — already in `.gitignore`
2. **Use strong JWT_SECRET** — minimum 32 characters, random
3. **Use Supabase Row Level Security (RLS)** for production (see Supabase docs)
4. **Rotate credentials** if accidentally exposed

---

## 📊 Database Schema Overview

After setup, you'll have **19 tables**:

| Table                         | Purpose                                |
| ----------------------------- | -------------------------------------- |
| `users`                       | Unified user authentication & profiles |
| `user_sessions`               | Active session tracking                |
| `system_settings`             | Admin-configurable campus settings     |
| `clubs`                       | Campus clubs/organizations             |
| `events`                      | Campus events                          |
| `event_rsvps`                 | Event RSVP tracking                    |
| `saved_events`                | Student saved events                   |
| `electives`                   | Available elective courses             |
| `student_choices`             | Student elective preferences           |
| `allocated_electives`         | Final elective allocations             |
| `elective_waitlist`           | Waitlist management                    |
| `notifications`               | User notifications                     |
| `activities`                  | User activity log                      |
| `teachers`                    | Faculty information                    |
| `subjects`                    | Course catalog                         |
| `rooms`                       | Classroom/lab information              |
| `student_groups`              | Class groups/sections                  |
| `teacher_subject_assignments` | Teacher-subject mapping                |
| `subject_class_assignments`   | Subject-group mapping                  |
| `teacher_unavailability`      | Teacher schedule constraints           |
| `timetable_slots`             | Generated timetable entries            |

---

**Need Help?** Check `API_DOCUMENTATION.md` for endpoint details.
