# 🎓 Smart Campus Utility Hub

> **A unified platform for intelligent campus management** — Streamline academic operations with AI-powered timetable generation, smart elective selection, and seamless event coordination.

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![NSoC 2026](https://img.shields.io/badge/NSoC-2026-ff6b35)](https://github.com/KanavCode/smart-campus-utility-hub)
[![GitHub Issues](https://img.shields.io/github/issues/KanavCode/smart-campus-utility-hub)](https://github.com/KanavCode/smart-campus-utility-hub/issues)
[![GitHub Stars](https://img.shields.io/github/stars/KanavCode/smart-campus-utility-hub?style=social)](https://github.com/KanavCode/smart-campus-utility-hub/stargazers)
[![Repository Views](https://komarev.com/ghpvc/?username=KanavCode-smart-campus-utility-hub&label=Repository%20Views&color=blue&style=flat)](https://github.com/KanavCode/smart-campus-utility-hub)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [One-Command Setup](#-one-command-setup)
- [Documentation](#-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [Roadmap](#️-roadmap)

---

## 🎯 Problem Statement

University campuses face significant operational challenges with fragmented systems — timetable scheduling, elective allocation, and event management are handled through separate, often manual processes. This leads to:

- **Scheduling conflicts** when rooms, teachers, or time slots are double-booked
- **Unfair elective allocation** not based on objective criteria like CGPA
- **Poor event visibility** with no central place for students to discover activities
- **High administrative overhead** from managing everything in spreadsheets

**Smart Campus Utility Hub** solves these problems by providing a unified, web-based platform that automates intelligent timetable generation, CGPA-based elective allocation, and centralised event management — accessible to students, faculty, and admins from a single interface.

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
├── .github/                          # GitHub configuration
│   ├── workflows/
│   │   └── lint.yml                  # CI: lint + type-check + tests
│   └── ISSUE_TEMPLATE/               # Issue templates (bug, feature)
│
├── smart-campus-backend/             # Node.js / Express API
│   ├── src/
│   │   ├── app.js                    # Express application entry point
│   │   ├── config/
│   │   │   └── db.js                 # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT authentication
│   │   │   ├── errorHandler.js       # Global error handling
│   │   │   └── validation.js         # Request validation helpers
│   │   └── components/
│   │       ├── users/                # User registration & authentication
│   │       ├── timetable/            # Timetable generation (backtracking)
│   │       ├── electives/            # CGPA-based elective selection
│   │       └── campus-events/        # Events & club management
│   ├── sql/
│   │   ├── schema.sql                # Full database schema
│   │   └── migrate.js                # Migration runner
│   ├── __tests__/                    # Jest test suites
│   ├── .env.example                  # Environment variable template
│   └── package.json
│
├── smart-campus-frontend/            # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui base components
│   │   │   ├── landing/              # Landing page sections
│   │   │   └── animations/           # Lottie / Framer Motion components
│   │   ├── pages/
│   │   │   ├── Landing.tsx           # Public landing page
│   │   │   ├── Auth.tsx              # Login / Registration
│   │   │   ├── student/              # Student dashboard & features
│   │   │   └── admin/                # Admin panel
│   │   ├── services/                 # API service layer (Axios)
│   │   ├── contexts/                 # React context providers
│   │   ├── hooks/                    # Custom React hooks
│   │   └── lib/
│   │       └── axios.ts              # Configured Axios instance
│   ├── .env.example                  # Environment variable template
│   └── package.json
│
├── docs/
│   └── LABELS.md                     # GitHub label and NSoC points strategy
│
├── scripts/
│   └── setup.sh                      # One-command local setup script
│
├── docker-compose.yml                # Docker multi-service stack
├── CONTRIBUTING.md                   # Contribution guide
├── ROADMAP.md                        # Project roadmap (Phase 1/2/3)
└── README.md
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

# Create .env file from the example
cp .env.example .env
# Edit .env with your DB credentials and JWT_SECRET

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

3. **Frontend Setup**

```bash
# Navigate to frontend
cd ../smart-campus-frontend

# Install dependencies
npm install

# Create .env file from the example
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000/api

# Start development server
npm run dev
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

## ⚡ One-Command Setup

The quickest way to get everything running locally:

```bash
# Automated setup (Node.js + PostgreSQL required)
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Or with Docker (no local PostgreSQL needed):

```bash
# Copy and configure environment
cp smart-campus-backend/.env.example smart-campus-backend/.env
cp smart-campus-frontend/.env.example smart-campus-frontend/.env

# Start all services
docker compose up --build
```

This starts PostgreSQL, the backend API, and the frontend dev server automatically.

---

## 📖 Documentation

### Backend API Documentation

Comprehensive API documentation is available in the backend directory:

📄 [smart-campus-backend/API_DOCUMENTATION.md](./smart-campus-backend/API_DOCUMENTATION.md)  
📄 [smart-campus-backend/README.md](./smart-campus-backend/README.md)

### Frontend Documentation

📄 [smart-campus-frontend/INTEGRATION_GUIDE.md](./smart-campus-frontend/INTEGRATION_GUIDE.md)  
📄 [smart-campus-frontend/README.md](./smart-campus-frontend/README.md)

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
cd smart-campus-frontend

# TypeScript type check
npm run typecheck

# Unit tests
npm run test

# Lint
npm run lint
```

---

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for the full project roadmap across three phases:

- **Phase 1 (Q2 2026)** — Stability & open-source readiness
- **Phase 2 (Q3 2026)** — New features (iCal export, waitlists, OAuth)
- **Phase 3 (Q4 2026+)** — Scaling, Redis caching, CI/CD pipeline

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

We welcome contributions from the community! Whether it's bug fixes, feature additions, or documentation improvements. This project participates in **Nexus Spring of Code (NSoC) 2026**.

👉 Read the full contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
👉 Label and points policy: [docs/LABELS.md](docs/LABELS.md)

### NSoC Quick Rules

- Include `#NSoC2026` in the PR description for NSoC submissions.
- Work only on issues assigned to you before opening a PR.
- Use one NSoC level label per issue: `level1` (3 pts), `level2` (5 pts), `level3` (10 pts).
- PRs without assignment/linked issue are invalid for NSoC tracking.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Commit with Conventional Commits**
   ```bash
   git commit -m "feat(timetable): add iCal export endpoint"
   ```
4. **Push and open a Pull Request**
   ```bash
   git push origin feat/your-feature-name
   ```

### Good First Issues

Looking for a place to start? Check out issues labelled [`good first issue`](https://github.com/KanavCode/smart-campus-utility-hub/labels/good%20first%20issue), [`NSOC'26`](https://github.com/KanavCode/smart-campus-utility-hub/labels/NSOC%2726), and [`level1`](https://github.com/KanavCode/smart-campus-utility-hub/labels/level1).

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

For more troubleshooting, see [Backend Troubleshooting Guide](./smart-campus-backend/README.md).

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

[Report Bug](https://github.com/KanavCode/smart-campus-utility-hub/issues) · [Request Feature](https://github.com/KanavCode/smart-campus-utility-hub/issues) · [Documentation](./smart-campus-backend/README.md) · [Contributing](./CONTRIBUTING.md)

</div>
