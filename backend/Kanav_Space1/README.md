# Smart Campus Timetable Backend 🎓

A comprehensive, production-ready backend service for automatic timetable generation using advanced backtracking algorithms with PostgreSQL database.

## 🚀 Features

### Core Functionality
- **Intelligent Timetable Generation**: Uses backtracking algorithm to generate conflict-free timetables
- **PostgreSQL Database**: Robust data persistence with comprehensive schema
- **RESTful API**: Well-structured endpoints for all operations
- **Input Validation**: Comprehensive validation using Joi
- **Error Handling**: Professional error handling and logging
- **Security**: Rate limiting, CORS, Helmet security headers

### Smart Constraints Management
- **Hard Constraints**: No teacher/room/student conflicts, capacity checks, room type compatibility
- **Soft Constraints**: Teacher preferences, minimize gaps, consecutive lab periods
- **Business Rules**: Working hours, lunch breaks, subject distribution

### Advanced Features
- **Bulk Operations**: Create multiple entities in a single transaction
- **Real-time Statistics**: System stats and performance metrics
- **Export/Import**: Timetable data export capabilities
- **Comprehensive Logging**: Winston logger with structured logging

## 📁 Project Structure

```
Kanav_Space1/
├── config/
│   └── db.js                 # Database configuration and connection
├── sql/
│   ├── schema.sql            # Complete database schema
│   └── migrate.js            # Database migration script
├── src/
│   ├── api/
│   │   └── timetable.routes.js    # API route definitions
│   ├── controllers/
│   │   └── timetable.controller.js # Business logic controllers
│   ├── middleware/
│   │   └── validation.js          # Input validation middleware
│   ├── models/
│   │   └── index.js              # Database models and queries
│   └── services/
│       └── solver.service.js     # Core backtracking algorithm
├── tests/                    # Test files (to be implemented)
├── .env                     # Environment configuration
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies and scripts
├── server.js              # Application entry point
└── README.md             # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd Kanav_Space1
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb smart_campus_timetable

# Update .env file with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_campus_timetable
DB_USER=postgres
DB_PASSWORD=your_password_here
```

### 3. Run Database Migration
```bash
npm run db:migrate
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL: `http://localhost:5000/api/v1`

### Core Entities

#### Teachers
- `GET /teachers` - Get all teachers
- `GET /teachers/:id` - Get teacher by ID
- `POST /teachers` - Create new teacher
- `GET /teachers/:id/subjects` - Get teacher's subjects
- `GET /teachers/:id/unavailability` - Get teacher unavailability

#### Subjects
- `GET /subjects` - Get all subjects
- `GET /subjects/:id` - Get subject by ID
- `POST /subjects` - Create new subject
- `GET /subjects/:id/teachers` - Get subject teachers

#### Rooms
- `GET /rooms` - Get all rooms
- `GET /rooms/:id` - Get room by ID
- `POST /rooms` - Create new room

#### Student Groups
- `GET /groups` - Get all student groups
- `GET /groups/:id` - Get group by ID
- `POST /groups` - Create new student group
- `GET /groups/:id/subjects` - Get group subjects

### Timetable Operations

#### Generate Timetable
```http
POST /api/v1/timetable/generate
Content-Type: application/json

{
  "academic_year": "2024-25",
  "semester_type": "odd",
  "groups": ["uuid1", "uuid2"],
  "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "periods_per_day": 6,
  "lunch_break_period": 4,
  "preferences": {
    "minimize_gaps": true,
    "consecutive_labs": true,
    "balanced_distribution": true,
    "respect_teacher_preferences": true
  }
}
```

#### Get Timetable
- `GET /timetable/:academic_year/:semester_type` - Get complete timetable
- `GET /timetable/:academic_year/:semester_type/group/:group_id` - Get group-specific timetable

### Bulk Operations
- `POST /bulk` - Create multiple entities in a single transaction

### System Utilities
- `GET /stats` - Get system statistics
- `GET /sample-data` - Get sample data for testing
- `GET /health` - Health check endpoint

## 🧪 Testing with REST Client

Create a `.http` file for testing:

```http
### Health Check
GET http://localhost:5000/health

### Get Sample Data
GET http://localhost:5000/api/v1/sample-data

### Create Teacher
POST http://localhost:5000/api/v1/teachers
Content-Type: application/json

{
  "teacher_code": "T001",
  "full_name": "Dr. John Smith",
  "department": "Computer Science",
  "email": "john.smith@university.edu",
  "phone": "1234567890"
}

### Create Subject
POST http://localhost:5000/api/v1/subjects
Content-Type: application/json

{
  "subject_code": "CS501",
  "subject_name": "Advanced Algorithms",
  "hours_per_week": 4,
  "course_type": "Theory",
  "department": "Computer Science",
  "semester": 5,
  "requires_consecutive_periods": false,
  "max_periods_per_day": 2
}

### Generate Timetable
POST http://localhost:5000/api/v1/timetable/generate
Content-Type: application/json

{
  "academic_year": "2024-25",
  "semester_type": "odd",
  "groups": ["group-uuid-here"],
  "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "periods_per_day": 6,
  "lunch_break_period": 4
}
```

## 🔧 Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_campus_timetable
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your_jwt_secret_key_here
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🏗️ Database Schema

### Core Entities
- **Teachers**: Faculty information and availability
- **Subjects**: Course details and requirements
- **Rooms**: Venue information and capacity
- **Student Groups**: Class information and strength

### Relationships
- **Teacher-Subject Assignments**: Who can teach what
- **Subject-Class Assignments**: What subjects each class needs
- **Teacher Unavailability**: When teachers are not available

### Generated Data
- **Timetable Slots**: Final generated timetable entries

## 🤖 Algorithm Overview

The timetable generation uses a sophisticated backtracking algorithm:

1. **Initialization**: Set up data structures and validate constraints
2. **Constraint Checking**: Verify all hard and soft constraints
3. **Recursive Assignment**: Try to assign lectures to time slots
4. **Conflict Resolution**: Backtrack when conflicts are found
5. **Optimization**: Prefer assignments that satisfy soft constraints

### Hard Constraints (Must be satisfied)
- No teacher conflicts
- No student group conflicts  
- No room conflicts
- Room capacity requirements
- Room type compatibility
- Weekly hour requirements

### Soft Constraints (Preferred)
- Teacher availability preferences
- Minimize gaps in student schedules
- Consecutive periods for labs
- Balanced daily distribution

## 📊 Performance & Scalability

- **Connection Pooling**: PostgreSQL connection pool for efficiency
- **Rate Limiting**: Prevents API abuse
- **Compression**: Gzip compression for responses
- **Logging**: Structured logging for monitoring
- **Error Handling**: Comprehensive error management

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing control
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Parameterized queries

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up proper logging
4. Configure reverse proxy (Nginx)
5. Enable SSL/TLS

### Database Optimization
- Create appropriate indexes
- Set up connection pooling
- Configure backup strategies
- Monitor query performance

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Follow commit message conventions

## 📝 License

MIT License - see LICENSE file for details

## 🎯 Future Enhancements

- [ ] Real-time conflict detection
- [ ] Advanced optimization algorithms
- [ ] Multi-campus support
- [ ] Mobile app integration
- [ ] Advanced reporting and analytics
- [ ] Integration with existing university systems

---

**Built with ❤️ for Smart Campus Management**