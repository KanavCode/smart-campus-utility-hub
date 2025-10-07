# Campus Events & Club Management API By Kirtan 

A robust, secure, and modular backend service designed to power a university's central hub for extracurricular activities. This API provides all the necessary functionality for managing users, clubs, and events with a role-based authentication system.

---

## ✨ Core Features

* **Role-Based Authentication:** Secure user registration and login system using JSON Web Tokens (JWT). Differentiates between `student` and `admin` roles to protect sensitive endpoints.
* **Club Management:** Full CRUD (Create, Read, Update, Delete) functionality for campus clubs, restricted to admin users.
* **Event Management:** Full CRUD functionality for events, which are linked to clubs. Includes advanced features like tagging, featured events, and department-specific targeting.
* **Personalized Feeds:** Logged-in students can view events targeted to their specific academic department.
* **Powerful Filtering & Search:** Public event endpoints support filtering by custom tags and searching by keywords in the title.

---

## 🛠️ Technology Stack

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **Authentication:** JSON Web Tokens (`jsonwebtoken`)
* **Password Security:** `bcryptjs` for password hashing
* **Environment Variables:** `dotenv`
* **Development:** `nodemon` for live server reloading

---

## 🚀 Getting Started

Follow these instructions to get the project set up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have the following software installed on your machine:
* [Node.js](https://nodejs.org/) (LTS version recommended)
* [PostgreSQL](https://www.postgresql.org/download/)
* An API Client like [Postman](https://www.postman.com/downloads/)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd kirtan_space
    ```

3.  **Install NPM packages:**
    ```bash
    npm install
    ```

4.  **Database Setup:**
    * Open your PostgreSQL client (e.g., pgAdmin).
    * Create a new, empty database named `campus_events`.
    * Open the Query Tool for the `campus_events` database.
    * Copy the entire content of the `sql/schema.sql` file and run it. This will create all the necessary tables (`Users`, `Clubs`, `Events`, `SavedEvents`).

5.  **Environment Variables:**
    * Create a file named `.env` in the root of the project (`kirtan_space`).
    * Copy the content of `.env.example` (or the structure below) into it and fill in your details.

    ```
    # .env file content
    PORT=5001

    # Your PostgreSQL connection string
    DATABASE_URL="postgresql://YOUR_POSTGRES_USER:YOUR_PASSWORD@localhost:5432/campus_events"

    # A strong, secret phrase for signing JWTs
    JWT_SECRET="YOUR_SUPER_SECRET_KEY"
    ```

### Running the Server

* **For development (with auto-reload):**
    ```bash
    npm run dev
    ```

* **For production:**
    ```bash
    npm start
    ```
The server will start on `http://localhost:5001`.

---

##  API Endpoint Documentation

Here is a complete list of all available API endpoints.

### Authentication (`/api/auth`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register`| Public | Creates a new user account. |
| `POST` | `/login` | Public | Logs in a user and returns a JWT. |
| `GET` | `/me` | **Token Required** | Returns the profile of the logged-in user. |

### Clubs (`/api/clubs`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Returns a list of all clubs. |
| `GET` | `/:id` | Public | Returns a single club by its ID. |
| `POST` | `/` | **Admin Only** | Creates a new club. |
| `PUT` | `/:id` | **Admin Only** | Updates an existing club. |
| `DELETE` | `/:id` | **Admin Only** | Deletes a club. |

### Events (`/api/events`)

| Method | Endpoint | Protection | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Returns all events. Supports `?search=` and `?tag=` query parameters. |
| `GET` | `/personalized`| **Token Required** | Returns public events + events for the user's department. |
| `GET` | `/live` | Public | Returns events that are currently in progress. |
| `GET` | `/featured` | Public | Returns the latest "featured" event for special announcements. |
| `POST` | `/` | **Admin Only** | Creates a new event. |
| `PUT` | `/:id` | **Admin Only** | Updates an existing event. |
| `DELETE` | `/:id` | **Admin Only** | Deletes an event. |

---

## 🔮 Future Enhancements

* **Save/Bookmark Events:** Implement the endpoints (`/api/events/:id/save`) for students to save events they are interested in.
* **Real-time Notifications:** Integrate WebSockets to provide real-time notifications for new events.
* **Image Uploads:** Add functionality for clubs to upload a profile picture.
* **Comprehensive Testing:** Write unit and integration tests using a framework like Jest.
* **Full Frontend Integration:** Connect this backend to a fully-featured React frontend application.