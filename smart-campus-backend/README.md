# 🎓 Smart Campus Backend - Unified API

## 📋 Overview

**Smart Campus Backend** is a comprehensive, unified Node.js API that integrates three core campus management systems into a single, scalable backend:

1. **Timetable Generation** - Intelligent scheduling using backtracking algorithms
2. **Elective Selection** - CGPA-based elective allocation system
3. **Campus Events & Clubs** - Event management with JWT authentication

## 🏗️ Architecture

This is a **modular monorepo** designed for scalability, maintainability, and seamless integration with React frontends.

### Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest + Supertest
- **Security**: Helmet, CORS, Rate Limiting

## 📁 Project Structure

```
smart-campus-backend/
├── __tests__/                      # Automated test suite
│   ├── events.test.js
│   ├── timetable.test.js
│   ├── electives.test.js
│   └── integration.test.js
│
├── src/
│   ├── app.js                      # Main Express application
│   │
│   ├── config/
│   │   └── db.js                   # PostgreSQL connection pool
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── errorHandler.js         # Global error handler
│   │   └── validation.js           # Request validation
│   │
│   └── components/                 # Feature modules
│       ├── users/                  # User & Authentication
│       │   ├── user.routes.js
│       │   ├── user.controller.js
│       │   └── user.model.js
│       │
│       ├── campus-events/          # Events & Clubs
│       │   ├── events.routes.js
│       │   ├── events.controller.js
│       │   └── clubs.controller.js
│       │
│       ├── timetable/              # Timetable Generation
│       │   ├── timetable.routes.js
│       │   ├── timetable.controller.js
│       │   └── timetable.service.js
│       │
│       └── electives/              # Elective Selection
│           ├── elective.routes.js
│           ├── elective.controller.js
│           └── allocation.controller.js
│
├── sql/
│   ├── schema.sql                  # Unified database schema
│   └── migrate.js                  # Database migration script
│
├── .env                            # Environment variables
├── .gitignore
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm >= 9.0.0

### Step 1: Install PostgreSQL

1. Download from https://www.postgresql.org/download/
2. Install and remember your `postgres` user password
3. Verify: `psql --version`

### Step 2: Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE smart_campus_unified;

# Exit
\q
```

### Step 3: Clone & Configure

```powershell
# Navigate to backend directory
cd smart-campus-backend

# Install dependencies
npm install

# Update .env file with your PostgreSQL password
# DB_PASSWORD=your_postgres_password_here
```

### Step 4: Run Setup Script (Automated)

```powershell
# This will test connection, run migrations, and run tests
.\setup.ps1
```

**OR Manual Setup:**

```powershell
# Test database connection
node test-db.js

# Run database migrations
node sql/migrate.js

# Run tests
npm test
```

### Step 5: Start the Server

```powershell
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### Step 6: Verify

Open your browser: http://localhost:5000/api/health

**Expected Response:**

```json
{
  "success": true,
  "status": "OK",
  "message": "Smart Campus Backend is running",
  "database": "Connected"
}
```

✅ **You're ready to go!**

📖 **Detailed Setup Guide:** See `DATABASE_SETUP.md` for comprehensive instructions

### Installation

1. **Clone the repository**

```bash
cd smart-campus-backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
# Copy the .env file and update with your database credentials
cp .env.example .env
```

4. **Set up the database**

```bash
# Create database in PostgreSQL
createdb smart_campus_unified

# Run migrations
psql -U postgres -d smart_campus_unified -f sql/schema.sql
```

5. **Start the server**

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📡 API Endpoints

### Authentication & Users

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
GET    /api/auth/profile           # Get user profile (protected)
PUT    /api/auth/profile           # Update profile (protected)
```

### Campus Events

```
GET    /api/events                 # Get all events
GET    /api/events/:id             # Get event by ID
POST   /api/events                 # Create event (admin only)
PUT    /api/events/:id             # Update event (admin only)
DELETE /api/events/:id             # Delete event (admin only)
POST   /api/events/:id/save        # Save event (protected)
```

### Clubs

```
GET    /api/clubs                  # Get all clubs
GET    /api/clubs/:id              # Get club by ID
POST   /api/clubs                  # Create club (admin only)
PUT    /api/clubs/:id              # Update club (admin only)
DELETE /api/clubs/:id              # Delete club (admin only)
```

### Timetable

```
POST   /api/timetable/generate     # Generate timetable (admin only)
GET    /api/timetable/:groupId     # Get timetable for group
GET    /api/teachers               # Get all teachers
GET    /api/subjects               # Get all subjects
GET    /api/rooms                  # Get all rooms
```

### Electives

```
GET    /api/electives              # Get all electives
POST   /api/electives              # Create elective (admin only)
POST   /api/electives/choices      # Submit elective choices (protected)
POST   /api/electives/allocate     # Run allocation algorithm (admin only)
GET    /api/electives/my-allocation # Get user's allocation (protected)
```

## 🔒 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **student**: Can view and save events, submit elective choices, view timetables
- **admin**: Full access to create/update/delete resources

## 🗄️ Database Schema

The unified schema integrates:

- **Users** (with role, CGPA, and elective preferences)
- **Clubs & Events** (with saved events tracking)
- **Teachers, Subjects, Rooms** (for timetable generation)
- **Electives & Allocations** (with CGPA-based logic)
- **Timetable Slots** (generated schedules with conflict resolution)

## 🤝 Contributing

This project was built by:

- **Kanav** - Timetable Generation Module
- **Kavya** - Elective Selection Module
- **Kirtan** - Campus Events & Authentication Module

## 📄 License

MIT License - See LICENSE file for details

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U postgres -d smart_campus_unified -c "SELECT version();"
```

### Port Already in Use

```bash
# Change PORT in .env file or kill existing process
lsof -ti:5000 | xargs kill -9  # macOS/Linux
```

### JWT Token Errors

Ensure `JWT_SECRET` in `.env` is set and matches across environments

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ by the Smart Campus Team**
