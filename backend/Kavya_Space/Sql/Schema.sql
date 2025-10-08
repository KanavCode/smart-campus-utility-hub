-- schema.sql
-- =========================================
-- DATABASE: campus_hub
-- FEATURE: Core Elective Subject Selection
-- =========================================

-- =========================
-- 1️⃣  USERS (Students)
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    cgpa DECIMAL(3,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2️⃣  ELECTIVES
-- =========================
CREATE TABLE IF NOT EXISTS electives (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    max_students INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 3️⃣  STUDENT ELECTIVE CHOICES
-- =========================
CREATE TABLE IF NOT EXISTS student_choices (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    elective_id INT REFERENCES electives(id) ON DELETE CASCADE,
    preference_rank INT CHECK (preference_rank BETWEEN 1 AND 5),
    UNIQUE (student_id, preference_rank)
);

-- =========================
-- 4️⃣  ALLOCATED ELECTIVES
-- =========================
CREATE TABLE IF NOT EXISTS allocated_electives (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    elective_id INT REFERENCES electives(id) ON DELETE CASCADE,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id)
);
