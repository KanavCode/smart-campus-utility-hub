# Intelligent College Timetable Generator - Backend

## 🚀 Overview
A robust, production-ready backend API for an Intelligent College Timetable Generator built with Node.js, Express.js, and PostgreSQL. This system uses advanced algorithms to generate clash-free timetables while managing complex constraints.

## 🎯 Features
- **JWT-based Authentication** with role-based access control (Admin/Teacher)
- **RESTful API Design** for all CRUD operations
- **Intelligent Timetable Generation** using backtracking algorithms
- **PostgreSQL Database** with optimized schema design
- **CORS-enabled** for seamless frontend integration
- **Error Handling & Validation** for production reliability
- **Transaction Support** for data consistency

## 🛠️ Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Environment Management**: dotenv
- **Development**: nodemon

## 📁 Project Structure
```
backend/Kanav_Space/
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── setupController.js    # Generic CRUD operations
│   └── timetableController.js # Timetable generation logic
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   ├── setupRoutes.js        # Data setup routes
│   └── timetableRoutes.js    # Timetable routes
├── services/
│   └── generationService.js  # Core timetable generation algorithm
├── sql/
│   └── schema.sql           # Database schema
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── app.js                  # Express app configuration
├── package.json            # Dependencies and scripts
├── server.js               # Server entry point
└── README.md               # This file
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Step 1: Clone and Install
```bash
# Navigate to the backend directory
cd backend/Kanav_Space

# Install dependencies
npm install
```

### Step 2: Database Setup
1. Create a PostgreSQL database named `timetable_db`
2. Run the SQL schema from `sql/schema.sql`
```bash
psql -U postgres -d timetable_db -f sql/schema.sql
```

### Step 3: Environment Configuration
Create a `.env` file with the following variables:
```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timetable_db
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=90d
```

### Step 4: Start the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📊 Database Schema
The system uses 7 main tables:
- `users` - Authentication and user management
- `teachers` - Teacher information
- `subjects` - Subject details
- `classes` - Class information
- `classrooms` - Classroom data
- `class_subject_map` - Mapping of classes to subjects
- `constraints` - Flexible constraint system
- `timetable_slots` - Generated timetable data

## 🔐 API Authentication
The API uses JWT-based authentication with two roles:
- **Admin**: Full access to all endpoints
- **Teacher**: Limited access to view timetables

### Authentication Flow
1. Register/Login to get JWT token
2. Include token in headers: `Authorization: Bearer <token>`
3. Access protected endpoints based on role

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Data Management (Admin Only)
- `GET/POST /api/setup/teachers` - Manage teachers
- `GET/POST /api/setup/subjects` - Manage subjects  
- `GET/POST /api/setup/classes` - Manage classes
- `GET/POST /api/setup/classrooms` - Manage classrooms
- `GET/POST /api/setup/constraints` - Manage constraints
- `GET/POST /api/setup/class_subject_map` - Manage class-subject mapping
- `PUT/DELETE /api/setup/{entity}/:id` - Update/Delete entities

### Timetable Operations
- `POST /api/timetable/generate` - Generate new timetable (Admin only)
- `GET /api/timetable/view/class/:classId` - View class timetable
- `GET /api/timetable/view/teacher/:teacherId` - View teacher timetable
- `PUT /api/timetable/slot/:slotId` - Update timetable slot (Admin only)

## 🧠 Algorithm Details
The timetable generation uses a sophisticated backtracking algorithm that:
1. **Collects Requirements**: Gathers all lectures needed based on class-subject mappings
2. **Constraint Validation**: Ensures no conflicts in teacher, classroom, or class schedules
3. **Optimized Placement**: Uses randomization to find optimal solutions
4. **Transaction Safety**: Ensures data consistency during generation

## 🌐 Frontend Integration Guide

### CORS Configuration
The backend is configured with CORS to accept requests from any origin during development. For production, update the CORS configuration in `app.js`.

### API Usage Examples

#### Authentication
```javascript
// Login
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
});
const { token } = await response.json();
```

#### Protected Requests
```javascript
// Get all teachers
const response = await fetch('http://localhost:5000/api/setup/teachers', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const teachers = await response.json();
```

#### Generate Timetable
```javascript
// Generate new timetable
const response = await fetch('http://localhost:5000/api/timetable/generate', {
  method: 'POST',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const result = await response.json();
```

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=timetable_db
JWT_SECRET=your-super-strong-production-jwt-secret
JWT_EXPIRES_IN=7d
```

### Security Considerations
- Use strong JWT secrets in production
- Configure CORS for specific frontend domains
- Enable HTTPS in production
- Use environment-specific database credentials
- Implement rate limiting for API endpoints

## 🔍 Testing the API

### Sample Data Setup
1. Register an admin user
2. Create sample teachers, subjects, classes, and classrooms
3. Set up class-subject mappings
4. Generate a timetable

### Testing Endpoints
Use Postman, Insomnia, or curl to test the API endpoints with the provided examples.

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License
This project is licensed under the MIT License.

## 📞 Support
For any issues or questions, please contact the development team or create an issue in the repository.