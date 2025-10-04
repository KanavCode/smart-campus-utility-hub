# Smart Campus Utility Hub

## Overview
The **Smart Campus Utility Hub** is a comprehensive platform designed to streamline and enhance campus operations. It integrates multiple utilities such as a Core Elective Tracker, Placement Tracker, and TimeTable Generator into a single, user-friendly hub. Built with modern technologies like React, JavaScript, Node.js, and Python, this project aims to provide a seamless experience for students, faculty, and administrators.

## Features

### 1. Core Elective Tracker (CET)
- **Frontend**: React.js
- **Backend**: Python
- **Description**: Helps students track and manage their core elective courses efficiently.

### 2. Placement Tracker (PT)
- **Frontend**: React.js
- **Backend**: Python
- **Description**: A tool for students to track placement opportunities and applications.

### 3. TimeTable Generator (TG)
- **Frontend**: React.js
- **Backend**: Python
- **Description**: Automatically generates optimized timetables for students and faculty.

## Tech Stack

### Frontend
- React.js
- JavaScript

### Backend
- Node.js
- Python

### Database
- To be integrated (e.g., MongoDB, PostgreSQL, or MySQL)

## Folder Structure
```
smart-campus-utility-hub/
├── Core_Elective_Tracker/
│   ├── Backend/
│   │   └── CET
│   ├── Frontend/
│       └── CET
├── Placement_Tracker/
│   ├── Backend/
│   │   └── PT
│   ├── Frontend/
│       └── PT
├── TimeTable_Generator/
│   ├── Backend/
│   │   └── TG
│   ├── Frontend/
│       └── TG
```

## Installation

### Prerequisites
- Node.js
- Python 3.x
- npm or yarn

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/KanavCode/smart-campus-utility-hub.git
   ```
2. Navigate to the project directory:
   ```bash
   cd smart-campus-utility-hub
   ```
3. Install dependencies for the frontend:
   ```bash
   cd src
   npm install
   ```
4. Set up the backend:
   - Navigate to the respective backend folders (e.g., `Core_Elective_Tracker/Backend/CET`) and set up Python virtual environments.
   - Install required Python packages using `requirements.txt` (if available).

5. Start the development servers:
   - Frontend:
     ```bash
     npm start
     ```
   - Backend:
     ```bash
     python app.py
     ```

## Usage
- Access the frontend at `http://localhost:3000`.
- Ensure the backend servers are running for full functionality.

## Contributing
Contributions are welcome ! Please follow these steps:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.