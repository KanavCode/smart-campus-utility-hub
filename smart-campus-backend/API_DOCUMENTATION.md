# 📚 Smart Campus Backend - Complete API Reference

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Endpoints

### 1. Register User

**POST** `/auth/register`

**Body:**

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "department": "Computer Science",
  "cgpa": 8.5,
  "semester": 5
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

**POST** `/auth/login`

**Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

### 3. Get Profile

**GET** `/auth/profile` 🔒

**Headers:** `Authorization: Bearer <token>`

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "department": "Computer Science",
      "cgpa": 8.5,
      "semester": 5
    }
  }
}
```

### 4. Update Profile

**PUT** `/auth/profile` 🔒

**Body:**

```json
{
  "full_name": "John Updated",
  "cgpa": 9.0
}
```

### 5. Change Password

**POST** `/auth/change-password` 🔒

**Body:**

```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

## 👥 User Management (Admin Only)

### 6. Get All Users

**GET** `/users` 🔒👨‍💼

**Query Params:**

- `role` - Filter by role (student/admin/faculty)
- `department` - Filter by department
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**

```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "count": 10
    }
  }
}
```

### 7. Get User by ID

**GET** `/users/:id` 🔒👨‍💼

### 8. Deactivate User

**PATCH** `/users/:id/deactivate` 🔒👨‍💼

### 9. Delete User

**DELETE** `/users/:id` 🔒👨‍💼

---

## 🎉 Events Endpoints

### 10. Get All Events

**GET** `/events`

**Query Params:**

- `search` - Search in title/description
- `tag` - Filter by tag
- `club_id` - Filter by club
- `department` - Filter by department
- `is_featured` - true/false
- `upcoming` - true (only future events)

**Response:**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "title": "Tech Conference 2024",
        "description": "Annual technology conference",
        "location": "Main Auditorium",
        "start_time": "2024-12-01T10:00:00Z",
        "end_time": "2024-12-01T17:00:00Z",
        "club_id": 1,
        "club_name": "Tech Club",
        "target_department": "Computer Science",
        "is_featured": true,
        "tags": ["technology", "conference", "networking"]
      }
    ],
    "count": 1
  }
}
```

### 11. Get Event by ID

**GET** `/events/:id`

### 12. Create Event

**POST** `/events` 🔒👨‍💼

**Body:**

```json
{
  "title": "Workshop on AI",
  "description": "Introduction to Artificial Intelligence",
  "location": "Lab 301",
  "start_time": "2024-12-15T14:00:00Z",
  "end_time": "2024-12-15T16:00:00Z",
  "club_id": 1,
  "target_department": "Computer Science",
  "is_featured": false,
  "tags": ["workshop", "AI", "machine-learning"]
}
```

### 13. Update Event

**PUT** `/events/:id` 🔒👨‍💼

### 14. Delete Event

**DELETE** `/events/:id` 🔒👨‍💼

### 15. Save Event

**POST** `/events/:id/save` 🔒

Allows students to save events to their personal list.

### 16. Unsave Event

**DELETE** `/events/:id/save` 🔒

### 17. Get My Saved Events

**GET** `/events/saved/my-events` 🔒

---

## 🏛️ Clubs Endpoints

### 18. Get All Clubs

**GET** `/clubs`

**Query Params:**

- `category` - Filter by category
- `search` - Search in name/description

**Response:**

```json
{
  "success": true,
  "data": {
    "clubs": [
      {
        "id": 1,
        "name": "Tech Club",
        "description": "Technology and Innovation",
        "contact_email": "tech@campus.edu",
        "category": "Technical"
      }
    ],
    "count": 1
  }
}
```

### 19. Get Club by ID

**GET** `/clubs/:id`

Returns club details with all its events.

### 20. Create Club

**POST** `/clubs` 🔒👨‍💼

**Body:**

```json
{
  "name": "Photography Club",
  "description": "Capture moments, create memories",
  "contact_email": "photo@campus.edu",
  "category": "Cultural"
}
```

### 21. Update Club

**PUT** `/clubs/:id` 🔒👨‍💼

### 22. Delete Club

**DELETE** `/clubs/:id` 🔒👨‍💼

---

## 📅 Timetable Endpoints

### 23. Get All Teachers

**GET** `/timetable/teachers`

**Query Params:**

- `department` - Filter by department

**Response:**

```json
{
  "success": true,
  "data": {
    "teachers": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "teacher_code": "T001",
        "full_name": "Dr. Smith",
        "department": "Computer Science",
        "email": "smith@campus.edu"
      }
    ],
    "count": 1
  }
}
```

### 24. Get All Subjects

**GET** `/timetable/subjects`

**Query Params:**

- `department` - Filter by department
- `semester` - Filter by semester (1-8)

### 25. Get All Rooms

**GET** `/timetable/rooms`

**Query Params:**

- `room_type` - Filter by type (Classroom/Lab/Auditorium/Seminar_Hall)

### 26. Get All Groups

**GET** `/timetable/groups`

**Query Params:**

- `department` - Filter by department
- `semester` - Filter by semester

### 27. Get Timetable for Group

**GET** `/timetable/group/:groupId`

**Query Params:**

- `academic_year` - e.g., "2024-25"
- `semester_type` - odd/even

**Response:**

```json
{
  "success": true,
  "data": {
    "timetable": [
      {
        "day_of_week": "Monday",
        "period_number": 1,
        "subject_name": "Data Structures",
        "subject_code": "CS301",
        "teacher_name": "Dr. Smith",
        "room_name": "Room 301"
      }
    ],
    "group_id": "...",
    "count": 30
  }
}
```

### 28. Get Teacher Schedule

**GET** `/timetable/teacher/:teacherId`

Returns weekly schedule for a specific teacher.

### 29. Create Teacher

**POST** `/timetable/teachers` 🔒👨‍💼

**Body:**

```json
{
  "teacher_code": "T001",
  "full_name": "Dr. John Smith",
  "department": "Computer Science",
  "email": "smith@campus.edu",
  "phone": "1234567890"
}
```

### 30. Create Subject

**POST** `/timetable/subjects` 🔒👨‍💼

**Body:**

```json
{
  "subject_code": "CS301",
  "subject_name": "Data Structures",
  "hours_per_week": 4,
  "course_type": "Theory",
  "department": "Computer Science",
  "semester": 3
}
```

### 31. Create Room

**POST** `/timetable/rooms` 🔒👨‍💼

**Body:**

```json
{
  "room_code": "R301",
  "room_name": "Room 301",
  "capacity": 60,
  "room_type": "Classroom",
  "floor_number": 3,
  "building": "Main Building"
}
```

---

## 📚 Electives Endpoints

### 32. Get All Electives

**GET** `/electives`

**Query Params:**

- `department` - Filter by department
- `semester` - Filter by semester

**Response:**

```json
{
  "success": true,
  "data": {
    "electives": [
      {
        "id": 1,
        "subject_name": "Machine Learning",
        "description": "Introduction to ML algorithms",
        "max_students": 50,
        "department": "Computer Science",
        "semester": 6
      }
    ],
    "count": 1
  }
}
```

### 33. Get Elective by ID

**GET** `/electives/:id`

### 34. Create Elective

**POST** `/electives` 🔒👨‍💼

**Body:**

```json
{
  "subject_name": "Machine Learning",
  "description": "Introduction to ML",
  "max_students": 50,
  "department": "Computer Science",
  "semester": 6
}
```

### 35. Update Elective

**PUT** `/electives/:id` 🔒👨‍💼

### 36. Delete Elective

**DELETE** `/electives/:id` 🔒👨‍💼

### 37. Submit Elective Choices

**POST** `/electives/choices` 🔒🎓

**Body:**

```json
{
  "choices": [
    { "elective_id": 1, "preference_rank": 1 },
    { "elective_id": 2, "preference_rank": 2 },
    { "elective_id": 3, "preference_rank": 3 }
  ]
}
```

Students can submit 1-5 preferences.

### 38. Get My Choices

**GET** `/electives/my/choices` 🔒🎓

Returns student's submitted elective preferences.

### 39. Get My Allocation

**GET** `/electives/my/allocation` 🔒🎓

**Response:**

```json
{
  "success": true,
  "data": {
    "allocation": {
      "student_id": 1,
      "elective_id": 1,
      "subject_name": "Machine Learning",
      "department": "Computer Science",
      "allocated_at": "2024-11-01T10:00:00Z",
      "allocation_round": 1
    }
  }
}
```

### 40. Run Allocation Algorithm

**POST** `/electives/allocate` 🔒👨‍💼

Runs the CGPA-based allocation algorithm.

**Response:**

```json
{
  "success": true,
  "message": "Elective allocation completed successfully",
  "data": {
    "allocationResults": [
      {
        "student_name": "Alice Johnson",
        "cgpa": 9.5,
        "allocated_elective": "Machine Learning",
        "preference_rank": 1
      },
      {
        "student_name": "Bob Smith",
        "cgpa": 8.7,
        "allocated_elective": "Quantum Computing",
        "preference_rank": 2
      }
    ]
  }
}
```

---

## ⚡ Utility Endpoints

### 41. Health Check

**GET** `/health`

**Response:**

```json
{
  "success": true,
  "status": "OK",
  "message": "Smart Campus Backend is running",
  "timestamp": "2024-11-01T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development",
  "database": "Connected"
}
```

### 42. Root Endpoint

**GET** `/`

Returns API information and links.

---

## 🚨 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "stack": "Error stack trace (development only)",
    "details": "Additional error details"
  }
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - No/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

---

## 🎯 Query Examples

### Example 1: Search Events

```bash
curl "http://localhost:5000/api/events?search=tech&upcoming=true"
```

### Example 2: Get User Profile

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/auth/profile
```

### Example 3: Create Event (Admin)

```bash
curl -X POST \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Event",
    "club_id": 1,
    "start_time": "2024-12-01T10:00:00Z",
    "end_time": "2024-12-01T12:00:00Z"
  }' \
  http://localhost:5000/api/events
```

### Example 4: Submit Elective Choices (Student)

```bash
curl -X POST \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "choices": [
      {"elective_id": 1, "preference_rank": 1},
      {"elective_id": 2, "preference_rank": 2}
    ]
  }' \
  http://localhost:5000/api/electives/choices
```

---

## 🔑 Legend

- 🔒 - Authentication required
- 👨‍💼 - Admin role required
- 🎓 - Student role required

---

## 📝 Notes

1. All timestamps use ISO 8601 format
2. Dates are stored in UTC
3. JWTs expire after 7 days (configurable)
4. Rate limit: 100 requests per 15 minutes per IP
5. Maximum request body size: 10MB

---

**Last Updated:** October 8, 2025  
**API Version:** 1.0.0
