-- Intelligent College Timetable Generator Database Schema
-- PostgreSQL Database: timetable_db

-- Enable UUID extension (optional, for future use)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS constraints CASCADE;
DROP TABLE IF EXISTS class_subject_map CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- User table for authentication (Admins, Teachers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'teacher')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teachers table
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    department VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subjects/Courses table
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    credits INTEGER DEFAULT 3,
    type VARCHAR(50) CHECK (type IN ('Theory', 'Practical', 'Lab')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Classes/Sections table
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    year INTEGER CHECK (year IN (1, 2, 3, 4)),
    semester INTEGER CHECK (semester IN (1, 2, 3, 4, 5, 6, 7, 8)),
    department VARCHAR(100),
    strength INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Classrooms table
CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100),
    floor INTEGER,
    capacity INTEGER NOT NULL DEFAULT 60,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Lecture', 'Lab', 'Tutorial')),
    facilities TEXT[], -- Array of facilities like 'Projector', 'AC', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Class-Subject mapping (many-to-many relationship)
CREATE TABLE class_subject_map (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    lectures_per_week INTEGER NOT NULL CHECK (lectures_per_week > 0 AND lectures_per_week <= 10),
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL,
    preferred_classroom_type VARCHAR(50) CHECK (preferred_classroom_type IN ('Lecture', 'Lab', 'Tutorial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id)
);

-- Constraints table (flexible design using JSONB)
CREATE TABLE constraints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    details JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1, -- Higher number = higher priority
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- The final timetable output table
CREATE TABLE timetable_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 10),
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    classroom_id INTEGER NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure no conflicts
    UNIQUE (day_of_week, period_number, class_id),
    UNIQUE (day_of_week, period_number, teacher_id),
    UNIQUE (day_of_week, period_number, classroom_id)
);

-- Create indexes for better performance
CREATE INDEX idx_timetable_day_period ON timetable_slots(day_of_week, period_number);
CREATE INDEX idx_timetable_class ON timetable_slots(class_id);
CREATE INDEX idx_timetable_teacher ON timetable_slots(teacher_id);
CREATE INDEX idx_timetable_classroom ON timetable_slots(classroom_id);
CREATE INDEX idx_class_subject_map_class ON class_subject_map(class_id);
CREATE INDEX idx_class_subject_map_subject ON class_subject_map(subject_id);

-- Insert sample data for testing

-- Sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('System Admin', 'admin@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwqrXLKCG8uCY4K', 'admin');

-- Sample teacher user (password: teacher123)
INSERT INTO users (name, email, password, role) VALUES 
('John Teacher', 'teacher@college.edu', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher');

-- Sample teachers
INSERT INTO teachers (name, email, department, phone) VALUES 
('Dr. Alice Johnson', 'alice.johnson@college.edu', 'Computer Science', '+1-555-0101'),
('Prof. Bob Smith', 'bob.smith@college.edu', 'Mathematics', '+1-555-0102'),
('Dr. Carol Brown', 'carol.brown@college.edu', 'Physics', '+1-555-0103'),
('Prof. David Wilson', 'david.wilson@college.edu', 'Computer Science', '+1-555-0104'),
('Dr. Emma Davis', 'emma.davis@college.edu', 'Mathematics', '+1-555-0105');

-- Sample subjects
INSERT INTO subjects (name, code, department, credits, type) VALUES 
('Data Structures and Algorithms', 'CS201', 'Computer Science', 4, 'Theory'),
('Database Management Systems', 'CS301', 'Computer Science', 3, 'Theory'),
('Operating Systems', 'CS302', 'Computer Science', 3, 'Theory'),
('Computer Networks', 'CS401', 'Computer Science', 3, 'Theory'),
('Software Engineering', 'CS402', 'Computer Science', 3, 'Theory'),
('Calculus I', 'MATH101', 'Mathematics', 4, 'Theory'),
('Linear Algebra', 'MATH201', 'Mathematics', 3, 'Theory'),
('Statistics', 'MATH301', 'Mathematics', 3, 'Theory'),
('Physics I', 'PHY101', 'Physics', 4, 'Theory'),
('Database Lab', 'CS301L', 'Computer Science', 1, 'Lab');

-- Sample classes
INSERT INTO classes (name, year, semester, department, strength) VALUES 
('CS-A (3rd Year)', 3, 5, 'Computer Science', 55),
('CS-B (3rd Year)', 3, 5, 'Computer Science', 52),
('CS-A (4th Year)', 4, 7, 'Computer Science', 48),
('MATH-A (2nd Year)', 2, 3, 'Mathematics', 45),
('PHY-A (1st Year)', 1, 1, 'Physics', 60);

-- Sample classrooms
INSERT INTO classrooms (room_number, building, floor, capacity, type, facilities) VALUES 
('101', 'Main Building', 1, 60, 'Lecture', ARRAY['Projector', 'Whiteboard', 'AC']),
('102', 'Main Building', 1, 50, 'Lecture', ARRAY['Projector', 'Whiteboard']),
('201', 'Main Building', 2, 40, 'Tutorial', ARRAY['Whiteboard', 'AC']),
('301', 'Tech Building', 3, 30, 'Lab', ARRAY['Computers', 'Projector', 'AC']),
('302', 'Tech Building', 3, 25, 'Lab', ARRAY['Computers', 'Whiteboard']),
('401', 'Science Building', 4, 80, 'Lecture', ARRAY['Projector', 'Sound System', 'AC']),
('501', 'Science Building', 5, 35, 'Lab', ARRAY['Equipment', 'Projector']);

-- Sample class-subject mappings
INSERT INTO class_subject_map (class_id, subject_id, lectures_per_week, teacher_id, preferred_classroom_type) VALUES 
-- CS-A (3rd Year) subjects
(1, 2, 3, 1, 'Lecture'), -- DBMS with Dr. Alice Johnson
(1, 3, 3, 4, 'Lecture'), -- Operating Systems with Prof. David Wilson
(1, 8, 2, 5, 'Lecture'), -- Statistics with Dr. Emma Davis
(1, 10, 2, 1, 'Lab'),    -- Database Lab with Dr. Alice Johnson

-- CS-B (3rd Year) subjects  
(2, 2, 3, 4, 'Lecture'), -- DBMS with Prof. David Wilson
(2, 3, 3, 1, 'Lecture'), -- Operating Systems with Dr. Alice Johnson
(2, 7, 3, 5, 'Lecture'), -- Linear Algebra with Dr. Emma Davis
(2, 10, 2, 4, 'Lab'),    -- Database Lab with Prof. David Wilson

-- CS-A (4th Year) subjects
(3, 4, 4, 1, 'Lecture'), -- Computer Networks with Dr. Alice Johnson
(3, 5, 3, 4, 'Lecture'), -- Software Engineering with Prof. David Wilson

-- MATH-A (2nd Year) subjects
(4, 6, 4, 2, 'Lecture'), -- Calculus I with Prof. Bob Smith
(4, 7, 3, 5, 'Lecture'), -- Linear Algebra with Dr. Emma Davis

-- PHY-A (1st Year) subjects
(5, 9, 4, 3, 'Lecture'), -- Physics I with Dr. Carol Brown
(5, 6, 3, 2, 'Lecture'); -- Calculus I with Prof. Bob Smith

-- Sample constraints
INSERT INTO constraints (name, type, details, description, priority) VALUES 
('No Early Morning Heavy Subjects', 'avoid_time_slots', 
 '{"subject_ids": [2, 3, 4], "avoid_periods": [1]}', 
 'Avoid scheduling heavy subjects in the first period', 2),

('Lab Sessions Preference', 'preferred_time_slots', 
 '{"subject_types": ["Lab"], "preferred_periods": [6, 7, 8]}', 
 'Schedule lab sessions in later periods', 1),

('Maximum Consecutive Lectures', 'no_consecutive_lectures', 
 '{"max_consecutive": 2, "applies_to": "all"}', 
 'No more than 2 consecutive lectures for any class', 3),

('Lunch Break', 'avoid_time_slots', 
 '{"avoid_periods": [5], "reason": "lunch_break"}', 
 'Keep 5th period free for lunch break', 1);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON DATABASE timetable_db TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Display sample data counts
SELECT 'Setup Complete!' as status,
       (SELECT COUNT(*) FROM users) as users,
       (SELECT COUNT(*) FROM teachers) as teachers,
       (SELECT COUNT(*) FROM subjects) as subjects,
       (SELECT COUNT(*) FROM classes) as classes,
       (SELECT COUNT(*) FROM classrooms) as classrooms,
       (SELECT COUNT(*) FROM class_subject_map) as mappings,
       (SELECT COUNT(*) FROM constraints) as constraints;