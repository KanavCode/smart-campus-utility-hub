# 🎓 Smart Campus Utility Hub

> **A unified platform for intelligent campus management** - Streamline academic operations with AI-powered timetable generation, smart elective selection, and seamless event coordination.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-316192.svg)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Documentation](#-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Smart Campus Utility Hub** is a comprehensive, full-stack campus management platform designed to revolutionize how educational institutions handle scheduling, electives, and events. Built with modern web technologies, it provides a seamless experience for students, faculty, and administrators.

### Key Highlights

- 🤖 **AI-Powered Scheduling** - Intelligent timetable generation with automatic conflict detection
- 🎯 **Smart Allocation** - CGPA-based elective selection with fair distribution algorithms
- 🎉 **Event Management** - Unified platform for campus events and club activities
- 🔒 **Secure & Scalable** - JWT authentication with enterprise-grade security
- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations

### Platform Statistics

- **5,000+** Students Connected
- **100+** Campus Events Managed
- **50+** Active Clubs

---

## ✨ Features

### 📅 Timetable Management

- **Automated Generation** - Backtracking algorithm for optimal scheduling
- **Conflict Detection** - Real-time validation of scheduling conflicts
- **Room Allocation** - Intelligent resource optimization
- **Export Options** - Download timetables in multiple formats
- **Multi-View Support** - Day, week, and month views

### 📚 Elective Selection System

- **CGPA-Based Allocation** - Fair distribution based on academic performance
- **Preference Ranking** - Students can prioritize their choices
- **Real-Time Availability** - Live seat count updates
- **Subject Management** - Comprehensive subject catalog with:
  - Artificial Intelligence
  - Data Warehousing & Data Mining
  - Big Data Analytics
  - Cloud Computing
  - Machine Learning
  - Network Security
  - And more...

### 🎪 Campus Events & Clubs

- **Event Discovery** - Browse and search campus events
- **RSVP Management** - Easy registration and tracking
- **Club Activities** - Manage club memberships and activities
- **Event Creation** - Simple event posting interface
- **Notifications** - Real-time updates for upcoming events

### 🔐 Authentication & Security

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access** - Student, Faculty, and Admin roles
- **Password Encryption** - bcrypt hashing for user credentials
- **Rate Limiting** - Protection against brute-force attacks
- **CORS & Helmet** - Enhanced security headers

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19+ | UI Framework |
| **TypeScript** | 5.x | Type Safety |
| **Vite** | 7.x | Build Tool |
| **Tailwind CSS** | 3.x/4.x | Styling |
| **Framer Motion** | 12.x | Animations |
| **React Router** | 7.x | Routing |
| **TanStack Query** | 5.x | Data Fetching |
| **Axios** | 1.12+ | HTTP Client |
| **Zustand** | 5.x | State Management |
| **Radix UI** | Latest | Accessible Components |
| **Lucide React** | 0.4+ | Icons |
| **Lottie React** | 2.4+ | Animations |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 5.x | Web Framework |
| **PostgreSQL** | 13+ | Database |
| **JWT** | 9.x | Authentication |
| **bcryptjs** | 3.x | Password Hashing |
| **Joi** | 17.x | Validation |
| **Winston** | 3.x | Logging |
| **Helmet** | 7.x | Security |
| **CORS** | 2.x | Cross-Origin Resource Sharing |

### DevOps & Tools

- **Bun** - Fast JavaScript runtime (frontend alternative)
- **Jest** - Testing framework
- **Supertest** - API testing
- **Nodemon** - Development server
- **ESLint** - Code linting

---

## 📁 Project Structure

```
smart-campus-utility-hub/
│
├── FinalFrontend/                    # Production Frontend (TypeScript + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components
│   │   │   ├── landing/              # Landing page sections
│   │   │   └── animations/           # Animation components
│   │   ├── pages/
│   │   │   ├── Landing.tsx           # Landing page
│   │   │   ├── Auth.tsx              # Authentication
│   │   │   ├── student/              # Student dashboard
│   │   │   └── admin/                # Admin dashboard
│   │   ├── lib/
│   │   │   └── axios.ts              # Configured API client
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── store/                    # Zustand stores
│   │   └── App.tsx                   # Main application
│   ├── public/                       # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── INTEGRATION_GUIDE.md          # Integration documentation
│
├── smart-campus-backend/             # Node.js Backend API
│   ├── src/
│   │   ├── app.js                    # Express application
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT authentication
│   │   │   ├── errorHandler.js       # Error handling
│   │   │   └── validation.js         # Request validation
│   │   └── components/
│   │       ├── users/                # User authentication
│   │       ├── timetable/            # Timetable generation
│   │       ├── electives/            # Elective selection
│   │       └── campus-events/        # Events & clubs
│   ├── sql/
│   │   ├── schema.sql                # Database schema
│   │   └── migrate.js                # Migration script
│   ├── __tests__/                    # Test suites
│   ├── package.json
│   └── README.md                     # Backend documentation
│
├── smart-campus-frontend/            # Alternative Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── lib/
│   ├── package.json
│   └── README.md                     # Frontend documentation
│
└── test-connection.html              # Backend connectivity test
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/))
- **npm** 9+ or **bun** (optional)
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/KanavCode/smart-campus-utility-hub.git
cd smart-campus-utility-hub
```

2. **Backend Setup**

```bash
# Navigate to backend
cd smart-campus-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL
# - JWT_SECRET
# - PORT

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

3. **Frontend Setup**

```bash
# Navigate to frontend (choose one)
cd FinalFrontend
# or
cd smart-campus-frontend

# Install dependencies
npm install
# or with bun
bun install

# Create .env file
cp .env.example .env

# Configure your .env file with:
# VITE_API_URL=http://localhost:5000

# Start development server
npm run dev
# or with bun
bun run dev
```

The frontend will run on `http://localhost:5173`

### Database Configuration

Create a PostgreSQL database and run the schema:

```bash
psql -U your_username -d your_database -f smart-campus-backend/sql/schema.sql
```

Or use the migration script:

```bash
cd smart-campus-backend
npm run db:migrate
```

---

## 📖 Documentation

### Backend API Documentation

Comprehensive API documentation is available in the backend README:

📄 [smart-campus-backend/README.md](./smart-campus-backend/README.md)

### Frontend Documentation

Detailed frontend guides:

📄 [smart-campus-frontend/README.md](./smart-campus-frontend/README.md)  
📄 [FinalFrontend/INTEGRATION_GUIDE.md](./FinalFrontend/INTEGRATION_GUIDE.md)

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Timetable
- `GET /api/timetable` - Get timetable
- `POST /api/timetable/generate` - Generate timetable
- `GET /api/timetable/conflicts` - Check conflicts

#### Electives
- `GET /api/electives` - Get available electives
- `POST /api/electives/select` - Submit preferences
- `POST /api/electives/allocate` - Admin allocation

#### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `GET /api/events/:id` - Get event details
- `POST /api/events/:id/rsvp` - RSVP to event

For detailed request/response examples, see [Backend API Documentation](./smart-campus-backend/README.md#-api-endpoints).

---

## 🎨 Screenshots

### Landing Page
Modern, animated landing page with feature highlights and testimonials.

### Student Dashboard
Comprehensive dashboard with timetable, electives, and events management.

### Admin Panel
Powerful admin interface for managing users, subjects, timetables, and events.

### Timetable View
Interactive timetable with drag-and-drop functionality and conflict detection.

### Elective Selection
Intuitive elective selection interface with preference ranking.

---

## 🧪 Testing

### Backend Tests

```bash
cd smart-campus-backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd FinalFrontend

# Run tests (if configured)
npm test
```

---

## 🏗️ Architecture

### Backend Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Express.js │ ◄── Middleware (Auth, CORS, Helmet)
└──────┬──────┘
       │
       ├─── /api/auth ──► User Authentication
       ├─── /api/timetable ──► Timetable Generation
       ├─── /api/electives ──► Elective Selection
       └─── /api/events ──► Event Management
              │
              ▼
       ┌──────────────┐
       │  PostgreSQL  │
       └──────────────┘
```

### Frontend Architecture

```
┌─────────────┐
│   Router    │
└──────┬──────┘
       │
       ├─── Landing ──► Public landing page
       ├─── Auth ──► Login/Register
       ├─── Student Dashboard ──► Student features
       └─── Admin Dashboard ──► Admin features
              │
              ├─── TanStack Query ──► Data fetching
              ├─── Zustand ──► State management
              └─── Axios ──► API communication
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, feature additions, or documentation improvements.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit with descriptive messages**
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Code Style

- **Backend**: Follow ESLint configuration
- **Frontend**: Use TypeScript strict mode
- **Comments**: Add JSDoc comments for functions
- **Testing**: Write tests for new features

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify .env DATABASE_URL is correct
# Format: postgresql://user:password@localhost:5432/database
```

**Frontend API Connection Failed**
```bash
# Ensure backend is running on correct port
# Verify VITE_API_URL in .env matches backend port
# Check CORS configuration in backend
```

**Port Already in Use**
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env file
```

For more troubleshooting, see [Backend Troubleshooting Guide](./smart-campus-backend/README.md#-troubleshooting).

---

## 📞 Support

### Team

**Smart Campus Team** 
- Mann
- Kanav
- Kavya
- Kirtan

### Contact

- **GitHub Issues**: [Report a bug](https://github.com/KanavCode/smart-campus-utility-hub/issues)
- **Discussions**: [Ask questions](https://github.com/KanavCode/smart-campus-utility-hub/discussions)

---

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Framework
- [Express.js](https://expressjs.com/) - Backend Framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Radix UI](https://www.radix-ui.com/) - Component Primitives
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

---

<div align="center">

**Made with ❤️ by the Smart Campus Team**

⭐ Star this repository if you find it helpful!

[Report Bug](https://github.com/mannshah24/smart-campus-utility-hub/issues) · [Request Feature](https://github.com/mannshah24/smart-campus-utility-hub/issues) · [Documentation](./smart-campus-backend/README.md)

</div>
