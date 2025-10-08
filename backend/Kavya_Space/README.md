# Smart Campus Utility Hub – Backend (Kavya_Space)

## Overview

This backend powers the **Core Elective Subject Selection** module of the Smart Campus Utility Hub. It provides RESTful APIs for user registration, elective management, and CGPA-based elective allocation. Built with Node.js, Express, Sequelize ORM, and PostgreSQL, it is designed for scalability, security, and ease of integration with frontend clients.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Allocation Logic](#allocation-logic)
- [Error Handling](#error-handling)
- [Development & Contribution](#development--contribution)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- **User Registration**: Students can register with CGPA and elective preferences.
- **Elective Management**: Admins can create and list electives.
- **Elective Allocation**: Allocates electives to students based on CGPA and preferences.
- **Error Handling**: Centralized error middleware.
- **Environment Configuration**: Uses `.env` for sensitive configs.
- **Extensible**: Modular structure for future features.

---

## Tech Stack

- **Node.js** (v18+)
- **Express.js** (v5+)
- **Sequelize ORM**
- **PostgreSQL**
- **dotenv**
- **CORS**

---

## Folder Structure

```
Kavya_Space/
│
├── server.js                # Entry point
├── package.json
├── .env
│
├── config/
│   └── db.js                # Sequelize DB config
│
├── controllers/
│   ├── allocationController.js
│   ├── electiveController.js
│   └── userController.js
│
├── middleware/
│   └── errorHandler.js      # Central error handler
│
├── models/
│   ├── electiveModel.js
│   └── userModel.js
│
├── routes/
│   ├── allocationRoutes.js
│   ├── electiveRoutes.js
│   └── userRoutes.js
│
├── Sql/
│   └── Schema.sql           # DB schema (DDL)
│
├── utils/
│   └── allocationLogic.js   # Allocation algorithm (future use)
```

---

## Setup & Installation

1. **Clone the repository**  
	 ```bash
	 git clone https://github.com/KanavCode/smart-campus-utility-hub.git
	 cd smart-campus-utility-hub/backend/Kavya_Space
	 ```

2. **Install dependencies**  
	 ```bash
	 npm install
	 ```

3. **Configure environment variables**  
	 - Copy `.env` template and fill in your DB credentials:
		 ```
		 PORT=5000
		 DB_NAME=campus_hub
		 DB_USER=postgres
		 DB_PASSWORD=your_password
		 DB_HOST=localhost
		 DB_DIALECT=postgres
		 ```

4. **Setup PostgreSQL Database**  
	 - Create the database manually or run the schema:
		 ```bash
		 psql -U postgres -f Sql/Schema.sql
		 ```

5. **Start the server**  
	 ```bash
	 npm start
	 ```
	 - Server runs on `http://localhost:5000`

---

## Environment Variables

All sensitive configs are stored in `.env`:

| Variable      | Description                |
|---------------|---------------------------|
| PORT          | Server port (default: 5000)|
| DB_NAME       | PostgreSQL DB name         |
| DB_USER       | DB username                |
| DB_PASSWORD   | DB password                |
| DB_HOST       | DB host (default: localhost)|
| DB_DIALECT    | DB dialect (postgres)      |

---

## Database Schema

See `Sql/Schema.sql` for full DDL.

- **users**: Student info, CGPA, credentials
- **electives**: Elective subjects, seat limits
- **student_choices**: Student elective preferences
- **allocated_electives**: Final allocations

---

## API Endpoints

### Users

- `POST /api/users/register`  
	Register a new student  
	**Body:** `{ name, email, password, cgpa, preferences }`

- `GET /api/users`  
	List all users

### Electives

- `POST /api/electives`  
	Create a new elective  
	**Body:** `{ subjectName, maxSeats }`

- `GET /api/electives`  
	List all electives

### Allocation

- `POST /api/allocation/allocate`  
	Trigger elective allocation (admin only)

---

## Allocation Logic

- Students are sorted by CGPA (desc).
- Each student is allocated their highest-ranked preferred elective with available seats.
- Seat counts are updated atomically.
- Unallocated students are marked as "None (No seat available)".

See `controllers/allocationController.js` for implementation.

---

## Error Handling

Centralized error middleware in `middleware/errorHandler.js` ensures consistent error responses.

---

## Development & Contribution

- **Coding Standards**: ES6+, modular imports, async/await
- **Extending Models**: Add new fields in `models/`
- **Adding Routes**: Create new route files in `routes/`
- **Testing**: Add unit/integration tests (future)
- **Contributions**: Fork, branch, PR with clear commit messages

---

## Troubleshooting

- **DB Connection Errors**: Check `.env` and PostgreSQL status.
- **Port Conflicts**: Change `PORT` in `.env`.
- **Migration Issues**: Sync models or run schema manually.

---

## References

- [Express.js Docs](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)