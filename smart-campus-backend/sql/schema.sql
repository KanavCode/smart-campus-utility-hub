-- =====================================================================
-- SMART CAMPUS UNIFIED DATABASE SCHEMA  (v2.0 — Supabase-Ready)
-- =====================================================================
-- Refactored from v1.0 (15 tables) → v2.0 (10 tables)
--
-- Key changes:
--   • Merged 'teachers' table into 'users' (role = 'faculty')
--   • Standardized all PKs to UUID (gen_random_uuid, PG 13+ native)
--   • Compressed sparse columns into JSONB metadata columns
--   • Replaced free-text categories with ENUM types
--   • Hardened referential integrity with ON DELETE CASCADE
-- =====================================================================

-- =====================================================================
-- EXTENSIONS
-- =====================================================================
-- Enable pgcrypto for gen_random_uuid() in local/dev PostgreSQL installs.
-- Keep uuid-ossp as a fallback for older PG versions / alternate UUID funcs.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- CLEAN SLATE — Drop in dependency-safe order
-- =====================================================================
DROP TABLE IF EXISTS timetable_slots CASCADE;
DROP TABLE IF EXISTS teacher_unavailability CASCADE;
DROP TABLE IF EXISTS subject_class_assignments CASCADE;
DROP TABLE IF EXISTS teacher_subject_assignments CASCADE;
DROP TABLE IF EXISTS saved_events CASCADE;
DROP TABLE IF EXISTS allocated_electives CASCADE;
DROP TABLE IF EXISTS student_choices CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS electives CASCADE;
DROP TABLE IF EXISTS student_groups CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old ENUM types to allow idempotent re-runs
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS course_type CASCADE;
DROP TYPE IF EXISTS room_type CASCADE;
DROP TYPE IF EXISTS day_of_week CASCADE;
DROP TYPE IF EXISTS club_category CASCADE;
DROP TYPE IF EXISTS semester_type CASCADE;

-- =====================================================================
-- ENUM TYPES
-- =====================================================================
CREATE TYPE user_role       AS ENUM ('student', 'admin', 'faculty');
CREATE TYPE course_type     AS ENUM ('Theory', 'Practical', 'Lab');
CREATE TYPE room_type       AS ENUM ('Classroom', 'Lab', 'Auditorium', 'Seminar_Hall');
CREATE TYPE day_of_week     AS ENUM ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
CREATE TYPE club_category   AS ENUM ('technical', 'cultural', 'sports', 'entrepreneurship', 'social', 'academic');
CREATE TYPE semester_type   AS ENUM ('odd', 'even', 'summer');


-- =====================================================================
-- 1. USERS  (Unified: students + faculty + admins)
-- =====================================================================
-- The single identity table. Role-specific attributes live in 'metadata'.
--
-- metadata JSONB structure (varies by role):
--   Student : { "cgpa": 8.5, "semester": 3, "auth_provider": "local" }
--   Faculty : { "teacher_code": "T001", "phone": "9876543210", "auth_provider": "local" }
--   Admin   : { "auth_provider": "local" }
--   SSO     : { "auth_provider": "google", "provider_id": "abc123" }
-- =====================================================================
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role          user_role NOT NULL DEFAULT 'student',
    department    VARCHAR(100),
    is_active     BOOLEAN DEFAULT true,
    metadata      JSONB DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 2. CLUBS  (Campus Events Module)
-- =====================================================================
CREATE TABLE clubs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100) UNIQUE NOT NULL,
    description   TEXT,
    contact_email VARCHAR(100),
    category      club_category NOT NULL DEFAULT 'technical',
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 3. EVENTS  (Campus Events Module)
-- =====================================================================
CREATE TABLE events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(150) NOT NULL,
    description       TEXT,
    location          VARCHAR(255),
    start_time        TIMESTAMPTZ NOT NULL,
    end_time          TIMESTAMPTZ NOT NULL,
    club_id           UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
    target_department VARCHAR(100),
    is_featured       BOOLEAN DEFAULT FALSE,
    tags              TEXT[],
    created_at        TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 4. SAVED EVENTS  (User bookmarks — junction table)
-- =====================================================================
CREATE TABLE saved_events (
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    saved_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, event_id)
);


-- =====================================================================
-- 5. ELECTIVES  (Elective Selection Module)
-- =====================================================================
CREATE TABLE electives (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_name  VARCHAR(100) UNIQUE NOT NULL,
    description   TEXT,
    max_students  INTEGER DEFAULT 50,
    department    VARCHAR(100),
    semester      INTEGER CHECK (semester BETWEEN 1 AND 8),
    created_at    TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 6. STUDENT CHOICES  (Elective Preferences)
-- =====================================================================
CREATE TABLE student_choices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    elective_id     UUID NOT NULL REFERENCES electives(id) ON DELETE CASCADE,
    preference_rank INTEGER CHECK (preference_rank BETWEEN 1 AND 5),
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, preference_rank),
    UNIQUE (student_id, elective_id)
);


-- =====================================================================
-- 7. ALLOCATED ELECTIVES  (Final Allocation Results)
-- =====================================================================
CREATE TABLE allocated_electives (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    elective_id      UUID NOT NULL REFERENCES electives(id) ON DELETE CASCADE,
    allocated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    allocation_round INTEGER DEFAULT 1,
    UNIQUE (student_id)
);


-- =====================================================================
-- 8. SUBJECTS  (Timetable Module)
-- =====================================================================
-- scheduling JSONB structure:
--   { "requires_consecutive": false, "max_periods_per_day": 2 }
-- =====================================================================
CREATE TABLE subjects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code    VARCHAR(10) UNIQUE NOT NULL,
    subject_name    VARCHAR(100) NOT NULL,
    hours_per_week  INTEGER NOT NULL CHECK (hours_per_week > 0),
    course_type     course_type NOT NULL,
    department      VARCHAR(50) NOT NULL,
    semester        INTEGER CHECK (semester BETWEEN 1 AND 8),
    is_active       BOOLEAN DEFAULT true,
    scheduling      JSONB DEFAULT '{"requires_consecutive": false, "max_periods_per_day": 2}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 9. ROOMS  (Timetable Module)
-- =====================================================================
-- amenities JSONB structure:
--   { "has_projector": true, "has_computer": false, "floor_number": 1, "building": "Building A" }
-- =====================================================================
CREATE TABLE rooms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code   VARCHAR(20) UNIQUE NOT NULL,
    room_name   VARCHAR(100) NOT NULL,
    capacity    INTEGER NOT NULL CHECK (capacity > 0),
    room_type   room_type NOT NULL,
    is_active   BOOLEAN DEFAULT true,
    amenities   JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 10. STUDENT GROUPS  (Timetable Module)
-- =====================================================================
CREATE TABLE student_groups (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_code     VARCHAR(10) UNIQUE NOT NULL,
    group_name     VARCHAR(100) NOT NULL,
    strength       INTEGER NOT NULL CHECK (strength > 0),
    department     VARCHAR(50) NOT NULL,
    semester       INTEGER CHECK (semester BETWEEN 1 AND 8),
    academic_year  VARCHAR(10),
    is_active      BOOLEAN DEFAULT true,
    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 11. TEACHER-SUBJECT ASSIGNMENTS  (Many-to-Many)
--     teacher_id now references users.id WHERE role = 'faculty'
-- =====================================================================
CREATE TABLE teacher_subject_assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    priority    INTEGER DEFAULT 1,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (teacher_id, subject_id)
);


-- =====================================================================
-- 12. SUBJECT-CLASS ASSIGNMENTS  (Many-to-Many)
-- =====================================================================
CREATE TABLE subject_class_assignments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    group_id    UUID NOT NULL REFERENCES student_groups(id) ON DELETE CASCADE,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (subject_id, group_id)
);


-- =====================================================================
-- 13. TEACHER UNAVAILABILITY  (Soft Constraints for Scheduling)
--     teacher_id now references users.id WHERE role = 'faculty'
-- =====================================================================
CREATE TABLE teacher_unavailability (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week    day_of_week NOT NULL,
    period_number  INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    reason         VARCHAR(200),
    is_permanent   BOOLEAN DEFAULT true,
    start_date     DATE,
    end_date       DATE,
    created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- =====================================================================
-- 14. TIMETABLE SLOTS  (Generated Timetables)
--     teacher_id now references users.id WHERE role = 'faculty'
-- =====================================================================
CREATE TABLE timetable_slots (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week     day_of_week NOT NULL,
    period_number   INTEGER NOT NULL CHECK (period_number BETWEEN 1 AND 8),
    teacher_id      UUID NOT NULL REFERENCES users(id),
    subject_id      UUID NOT NULL REFERENCES subjects(id),
    group_id        UUID NOT NULL REFERENCES student_groups(id),
    room_id         UUID NOT NULL REFERENCES rooms(id),
    academic_year   VARCHAR(10) NOT NULL,
    semester_type   semester_type DEFAULT 'odd',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Conflict prevention constraints
    UNIQUE (day_of_week, period_number, teacher_id, academic_year, semester_type),
    UNIQUE (day_of_week, period_number, group_id, academic_year, semester_type),
    UNIQUE (day_of_week, period_number, room_id, academic_year, semester_type)
);


-- =====================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================================

-- Users
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_users_department     ON users(department);
CREATE INDEX idx_users_metadata       ON users USING GIN (metadata);

-- Clubs
CREATE INDEX idx_clubs_category       ON clubs(category);

-- Events
CREATE INDEX idx_events_club          ON events(club_id);
CREATE INDEX idx_events_start_time    ON events(start_time);
CREATE INDEX idx_events_target_dept   ON events(target_department);
CREATE INDEX idx_events_tags          ON events USING GIN (tags);

-- Electives
CREATE INDEX idx_electives_department ON electives(department);
CREATE INDEX idx_electives_semester   ON electives(semester);
CREATE INDEX idx_student_choices_student    ON student_choices(student_id);
CREATE INDEX idx_allocated_electives_student ON allocated_electives(student_id);

-- Subjects
CREATE INDEX idx_subjects_department  ON subjects(department);
CREATE INDEX idx_subjects_semester    ON subjects(semester);
CREATE INDEX idx_subjects_scheduling  ON subjects USING GIN (scheduling);

-- Rooms
CREATE INDEX idx_rooms_type           ON rooms(room_type);
CREATE INDEX idx_rooms_capacity       ON rooms(capacity);
CREATE INDEX idx_rooms_amenities      ON rooms USING GIN (amenities);

-- Student Groups
CREATE INDEX idx_student_groups_department ON student_groups(department);
CREATE INDEX idx_student_groups_semester   ON student_groups(semester);

-- Timetable
CREATE INDEX idx_timetable_day_period ON timetable_slots(day_of_week, period_number);
CREATE INDEX idx_timetable_teacher    ON timetable_slots(teacher_id);
CREATE INDEX idx_timetable_group      ON timetable_slots(group_id);
CREATE INDEX idx_timetable_room       ON timetable_slots(room_id);
CREATE INDEX idx_teacher_unavailable  ON teacher_unavailability(teacher_id, day_of_week, period_number);


-- =====================================================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- =====================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
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
-- SCHEMA v2.0 CREATION COMPLETE
-- =====================================================================
-- Table count: 14 (down from 15 — teachers merged into users)
-- JSONB columns: users.metadata, rooms.amenities, subjects.scheduling
-- New ENUMs: club_category, semester_type
-- All PKs: UUID via gen_random_uuid()
-- All timestamps: TIMESTAMPTZ (timezone-aware)
-- =====================================================================
