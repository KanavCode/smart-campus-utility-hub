-- Smart Campus Timetable Database Schema
-- PostgreSQL Database Schema for Comprehensive Timetable Generation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS teacher_unavailability CASCADE;
DROP TABLE IF EXISTS subject_class_assignments CASCADE;
DROP TABLE IF EXISTS teacher_subject_assignments CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;

-- Create ENUM types
CREATE TYPE course_type AS ENUM ('Theory', 'Practical', 'Lab');
CREATE TYPE room_type AS ENUM ('Classroom', 'Lab', 'Auditorium', 'Seminar_Hall');
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- 1. Teachers Table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'T01'
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subjects Table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'CS501'
    subject_name VARCHAR(100) NOT NULL,
    hours_per_week INTEGER NOT NULL CHECK (hours_per_week > 0),
    course_type course_type NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    is_active BOOLEAN DEFAULT true,
    requires_consecutive_periods BOOLEAN DEFAULT false, -- For labs
    max_periods_per_day INTEGER DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rooms Table
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'R301'
    room_name VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    room_type room_type NOT NULL,
    floor_number INTEGER,
    building VARCHAR(50),
    has_projector BOOLEAN DEFAULT false,
    has_computer BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Student Groups Table
CREATE TABLE student_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_code VARCHAR(10) UNIQUE NOT NULL, -- e.g., 'CSE5'
    group_name VARCHAR(100) NOT NULL,
    strength INTEGER NOT NULL CHECK (strength > 0),
    department VARCHAR(50) NOT NULL,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    academic_year VARCHAR(10), -- e.g., '2024-25'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Teacher-Subject Assignments (Many-to-Many)
CREATE TABLE teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1, -- 1 = Primary, 2 = Secondary (for backup)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, subject_id)
);

-- 6. Subject-Class Assignments (Many-to-Many)
CREATE TABLE subject_class_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, group_id)
);

-- 7. Teacher Unavailability (Soft Constraints)
CREATE TABLE teacher_unavailability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    reason VARCHAR(200),
    is_permanent BOOLEAN DEFAULT true, -- false for temporary unavailability
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Timetable Slots (Generated Timetable)
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week day_of_week NOT NULL,
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    group_id UUID NOT NULL REFERENCES student_groups(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    academic_year VARCHAR(10) NOT NULL,
    semester_type VARCHAR(10) DEFAULT 'odd', -- odd/even
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure no conflicts
    UNIQUE(day_of_week, period_number, teacher_id, academic_year, semester_type),
    UNIQUE(day_of_week, period_number, group_id, academic_year, semester_type),
    UNIQUE(day_of_week, period_number, room_id, academic_year, semester_type)
);

-- Create indexes for better performance
CREATE INDEX idx_teachers_department ON teachers(department);
CREATE INDEX idx_teachers_active ON teachers(is_active);
CREATE INDEX idx_subjects_department ON subjects(department);
CREATE INDEX idx_subjects_semester ON subjects(semester);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_capacity ON rooms(capacity);
CREATE INDEX idx_student_groups_department ON student_groups(department);
CREATE INDEX idx_student_groups_semester ON student_groups(semester);
CREATE INDEX idx_timetable_day_period ON timetable_slots(day_of_week, period_number);
CREATE INDEX idx_timetable_teacher ON timetable_slots(teacher_id);
CREATE INDEX idx_timetable_group ON timetable_slots(group_id);
CREATE INDEX idx_timetable_room ON timetable_slots(room_id);
CREATE INDEX idx_teacher_unavailable ON teacher_unavailability(teacher_id, day_of_week, period_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;   
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_groups_updated_at BEFORE UPDATE ON student_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timetable_slots_updated_at BEFORE UPDATE ON timetable_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();