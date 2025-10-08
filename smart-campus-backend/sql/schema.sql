-- =====================================================================
-- SMART CAMPUS UNIFIED DATABASE SCHEMA
-- =====================================================================
-- Integrated schema combining:
-- 1. Timetable Generation (Kanav_Space1)
-- 2. Elective Selection (Kavya_Space)
-- 3. Campus Events & Authentication (Kirtan_Space)
-- =====================================================================

-- Enable UUID extension for timetable module
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS saved_events CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS allocated_electives CASCADE;
DROP TABLE IF EXISTS student_choices CASCADE;
DROP TABLE IF EXISTS electives CASCADE;
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS teacher_unavailability CASCADE;
DROP TABLE IF EXISTS subject_class_assignments CASCADE;
DROP TABLE IF EXISTS teacher_subject_assignments CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================================
-- ENUM TYPES
-- =====================================================================
CREATE TYPE user_role AS ENUM ('student', 'admin', 'faculty');
CREATE TYPE course_type AS ENUM ('Theory', 'Practical', 'Lab');
CREATE TYPE room_type AS ENUM ('Classroom', 'Lab', 'Auditorium', 'Seminar_Hall');
CREATE TYPE day_of_week AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');

-- =====================================================================
-- 1. UNIFIED USERS TABLE
-- Base: Kirtan's schema + Kavya's elective fields
-- =====================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    department VARCHAR(100),
    
    -- Student-specific fields for elective selection
    cgpa DECIMAL(3,2) CHECK (cgpa IS NULL OR (cgpa >= 0 AND cgpa <= 10)),
    semester INTEGER CHECK (semester IS NULL OR (semester BETWEEN 1 AND 8)),
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 2. CLUBS (Campus Events Module)
-- =====================================================================
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    contact_email VARCHAR(100),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 3. EVENTS (Campus Events Module)
-- =====================================================================
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    club_id INTEGER REFERENCES clubs(id) ON DELETE CASCADE NOT NULL,
    target_department VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 4. SAVED EVENTS (User's saved events)
-- =====================================================================
CREATE TABLE saved_events (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);

-- =====================================================================
-- 5. ELECTIVES (Elective Selection Module)
-- =====================================================================
CREATE TABLE electives (
    id SERIAL PRIMARY KEY,
    subject_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    max_students INTEGER DEFAULT 50,
    department VARCHAR(100),
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 6. STUDENT CHOICES (Elective Preferences)
-- =====================================================================
CREATE TABLE student_choices (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    elective_id INTEGER REFERENCES electives(id) ON DELETE CASCADE,
    preference_rank INTEGER CHECK (preference_rank BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, preference_rank),
    UNIQUE (student_id, elective_id)
);

-- =====================================================================
-- 7. ALLOCATED ELECTIVES (Final Allocation Results)
-- =====================================================================
CREATE TABLE allocated_electives (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    elective_id INTEGER REFERENCES electives(id) ON DELETE CASCADE,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    allocation_round INTEGER DEFAULT 1,
    UNIQUE (student_id)
);

-- =====================================================================
-- 8. TEACHERS (Timetable Module)
-- =====================================================================
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_code VARCHAR(10) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 9. SUBJECTS (Timetable Module)
-- =====================================================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_code VARCHAR(10) UNIQUE NOT NULL,
    subject_name VARCHAR(100) NOT NULL,
    hours_per_week INTEGER NOT NULL CHECK (hours_per_week > 0),
    course_type course_type NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    is_active BOOLEAN DEFAULT true,
    requires_consecutive_periods BOOLEAN DEFAULT false,
    max_periods_per_day INTEGER DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 10. ROOMS (Timetable Module)
-- =====================================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(20) UNIQUE NOT NULL,
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

-- =====================================================================
-- 11. STUDENT GROUPS (Timetable Module)
-- =====================================================================
CREATE TABLE student_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_code VARCHAR(10) UNIQUE NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    strength INTEGER NOT NULL CHECK (strength > 0),
    department VARCHAR(50) NOT NULL,
    semester INTEGER CHECK (semester BETWEEN 1 AND 8),
    academic_year VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 12. TEACHER-SUBJECT ASSIGNMENTS (Many-to-Many)
-- =====================================================================
CREATE TABLE teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, subject_id)
);

-- =====================================================================
-- 13. SUBJECT-CLASS ASSIGNMENTS (Many-to-Many)
-- =====================================================================
CREATE TABLE subject_class_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, group_id)
);

-- =====================================================================
-- 14. TEACHER UNAVAILABILITY (Soft Constraints)
-- =====================================================================
CREATE TABLE teacher_unavailability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    reason VARCHAR(200),
    is_permanent BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 15. TIMETABLE SLOTS (Generated Timetables)
-- =====================================================================
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    day_of_week day_of_week NOT NULL,
    period_number INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    teacher_id UUID NOT NULL REFERENCES teachers(id),
    subject_id UUID NOT NULL REFERENCES subjects(id),
    group_id UUID NOT NULL REFERENCES student_groups(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    academic_year VARCHAR(10) NOT NULL,
    semester_type VARCHAR(10) DEFAULT 'odd',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Conflict prevention constraints
    UNIQUE(day_of_week, period_number, teacher_id, academic_year, semester_type),
    UNIQUE(day_of_week, period_number, group_id, academic_year, semester_type),
    UNIQUE(day_of_week, period_number, room_id, academic_year, semester_type)
);

-- =====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);

-- Events indexes
CREATE INDEX idx_events_club ON events(club_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_target_dept ON events(target_department);

-- Electives indexes
CREATE INDEX idx_electives_department ON electives(department);
CREATE INDEX idx_electives_semester ON electives(semester);
CREATE INDEX idx_student_choices_student ON student_choices(student_id);
CREATE INDEX idx_allocated_electives_student ON allocated_electives(student_id);

-- Timetable indexes
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

-- =====================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;   
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at 
    BEFORE UPDATE ON teachers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at 
    BEFORE UPDATE ON subjects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_groups_updated_at 
    BEFORE UPDATE ON student_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timetable_slots_updated_at 
    BEFORE UPDATE ON timetable_slots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- SAMPLE DATA FOR TESTING (Optional - Comment out for production)
-- =====================================================================

-- Insert sample admin user (password: admin123)
INSERT INTO users (full_name, email, password_hash, role, department) VALUES 
('Admin User', 'admin@smartcampus.edu', '$2a$10$YourHashedPasswordHere', 'admin', 'Administration');

-- Insert sample clubs
INSERT INTO clubs (name, description, category, contact_email) VALUES 
('Tech Club', 'Innovation and Technology', 'Technical', 'tech@smartcampus.edu'),
('Drama Club', 'Theater and Performing Arts', 'Cultural', 'drama@smartcampus.edu');

-- =====================================================================
-- SCHEMA CREATION COMPLETE
-- =====================================================================
