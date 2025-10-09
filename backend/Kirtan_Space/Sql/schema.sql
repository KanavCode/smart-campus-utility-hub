-- =================================================================
-- Schema for the Campus Events & Club Management API
-- =================================================================


-- Drop tables if they exist to start with a clean slate (optional, but good for testing)
DROP TABLE IF EXISTS "SavedEvents";
DROP TABLE IF EXISTS "Events";
DROP TABLE IF EXISTS "Clubs";
DROP TABLE IF EXISTS "Users"; 
-- =================================================================
-- Table: Users
-- Purpose: Stores information for both students and admins.
-- =================================================================
CREATE TABLE "Users" (
    "id" SERIAL PRIMARY KEY,
    "fullName" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) UNIQUE NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL DEFAULT 'student', -- Can be 'student' or 'admin'
    "department" VARCHAR(100) -- User's academic department for personalization
);
-- =================================================================
-- Table: Clubs
-- Purpose: Stores the central directory of all campus clubs.
-- =================================================================
CREATE TABLE "Clubs" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT,
    "contactEmail" VARCHAR(100),
    "category" VARCHAR(50) -- e.g., 'Technical', 'Cultural', 'Sports'
);

-- =================================================================
-- Table: Events
-- Purpose: Stores details for all events, linked to a host club.
-- =================================================================
CREATE TABLE "Events" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "startTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endTime" TIMESTAMP WITH TIME ZONE NOT NULL,
    "clubId" INTEGER REFERENCES "Clubs"("id") ON DELETE CASCADE NOT NULL,
    "targetDepartment" VARCHAR(100), -- For department-specific events
    "isFeatured" BOOLEAN DEFAULT FALSE, -- For spotlight announcements
    "tags"  TEXT[] -- PostgreSQL array for filterable tags like {'Workshop', 'Competition'}
);
-- =================================================================
-- Table: SavedEvents
-- Purpose: A join table to track which users have saved which events.
-- =================================================================
CREATE TABLE "SavedEvents" (
    "userId" INTEGER REFERENCES "Users"("id") ON DELETE CASCADE,
    "eventId " INTEGER REFERENCES "Events"("id") ON DELETE CASCADE,
     
     PRIMARY KEY ("userId", "eventId") -- Prevents a user from saving the same event twice
);