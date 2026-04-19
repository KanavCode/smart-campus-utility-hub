const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, logger } = require('../src/config/db');

/**
 * Generate realistic sample data for Smart Campus database
 * Covers all 15 tables with appropriate relationships
 */

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    logger.info('🌱 Starting database seeding...\n');
    
    await client.query('BEGIN');
    
    // =====================================================================
    // 1. SEED USERS (Admin, Faculty, Students)
    // =====================================================================
    logger.info('👥 Seeding users...');
    
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);
    const facultyPassword = await bcrypt.hash('faculty123', 10);
    
    const usersData = [
      // Admin user
      {
        full_name: 'Admin User',
        email: 'admin@smartcampus.edu',
        password_hash: adminPassword,
        role: 'admin',
        department: 'Administration',
        cgpa: null,
        semester: null
      },
      // Faculty users
      {
        full_name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@smartcampus.edu',
        password_hash: facultyPassword,
        role: 'faculty',
        department: 'Computer Science',
        cgpa: null,
        semester: null
      },
      {
        full_name: 'Prof. Priya Singh',
        email: 'priya.singh@smartcampus.edu',
        password_hash: facultyPassword,
        role: 'faculty',
        department: 'Electronics',
        cgpa: null,
        semester: null
      },
      // Student users
      {
        full_name: 'Arjun Patel',
        email: 'arjun.patel@student.smartcampus.edu',
        password_hash: studentPassword,
        role: 'student',
        department: 'Computer Science',
        cgpa: 8.5,
        semester: 3
      },
      {
        full_name: 'Sneha Sharma',
        email: 'sneha.sharma@student.smartcampus.edu',
        password_hash: studentPassword,
        role: 'student',
        department: 'Electronics',
        cgpa: 7.8,
        semester: 3
      },
      {
        full_name: 'Vikram Desai',
        email: 'vikram.desai@student.smartcampus.edu',
        password_hash: studentPassword,
        role: 'student',
        department: 'Computer Science',
        cgpa: 8.2,
        semester: 5
      },
      {
        full_name: 'Neha Gupta',
        email: 'neha.gupta@student.smartcampus.edu',
        password_hash: studentPassword,
        role: 'student',
        department: 'Mechanical',
        cgpa: 7.5,
        semester: 5
      },
      {
        full_name: 'Rohan Verma',
        email: 'rohan.verma@student.smartcampus.edu',
        password_hash: studentPassword,
        role: 'student',
        department: 'Electronics',
        cgpa: 8.9,
        semester: 3
      },
      {
        full_name: 'Isha Nair',
        email: 'isha.nair@student.smartcampus.edu',
        password_hash: studentPassword,
        role: 'student',
        department: 'Computer Science',
        cgpa: 8.6,
        semester: 5
      },
      {
        full_name: 'Aditya Reddy',
        email: 'aditya.reddy@student.smartcampus.edu',
        password_hash: studentPassword,
        role: 'student',
        department: 'Mechanical',
        cgpa: 7.9,
        semester: 3
      }
    ];
    
    const userInsertQuery = `
      INSERT INTO users (full_name, email, password_hash, role, department, cgpa, semester)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email
    `;
    
    const userIds = {};
    for (const user of usersData) {
      const result = await client.query(userInsertQuery, [
        user.full_name,
        user.email,
        user.password_hash,
        user.role,
        user.department,
        user.cgpa,
        user.semester
      ]);
      userIds[user.email] = result.rows[0].id;
    }
    logger.info(`✓ Created ${usersData.length} users\n`);
    
    // =====================================================================
    // 2. SEED CLUBS
    // =====================================================================
    logger.info('🎭 Seeding clubs...');
    
    const clubsData = [
      {
        name: 'Tech Innovation Club',
        description: 'Exploring cutting-edge technology and software development',
        contact_email: 'tech@smartcampus.edu',
        category: 'Technical'
      },
      {
        name: 'Drama & Performing Arts',
        description: 'Theater, drama, and performing arts activities',
        contact_email: 'drama@smartcampus.edu',
        category: 'Cultural'
      },
      {
        name: 'Sports & Fitness Club',
        description: 'Physical fitness, sports tournaments, and wellness',
        contact_email: 'sports@smartcampus.edu',
        category: 'Sports'
      },
      {
        name: 'Innovation Lab',
        description: 'Entrepreneurship and startup development',
        contact_email: 'innovation@smartcampus.edu',
        category: 'Entrepreneurship'
      }
    ];
    
    const clubInsertQuery = `
      INSERT INTO clubs (name, description, contact_email, category)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    
    const clubIds = [];
    for (const club of clubsData) {
      const result = await client.query(clubInsertQuery, [
        club.name,
        club.description,
        club.contact_email,
        club.category
      ]);
      clubIds.push(result.rows[0].id);
    }
    logger.info(`✓ Created ${clubsData.length} clubs\n`);
    
    // =====================================================================
    // 3. SEED EVENTS
    // =====================================================================
    logger.info('📅 Seeding events...');
    
    const eventsData = [
      {
        title: 'Web Development Workshop',
        description: 'Learn modern web technologies - React, Node.js, MongoDB',
        location: 'Room 101, Building A',
        start_time: new Date('2026-04-25T10:00:00Z'),
        end_time: new Date('2026-04-25T12:00:00Z'),
        club_id: clubIds[0],
        target_department: 'Computer Science',
        is_featured: true,
        tags: ['web', 'development', 'technology']
      },
      {
        title: 'Startup Pitching Event',
        description: 'Present your startup ideas to investors and mentors',
        location: 'Auditorium, Building C',
        start_time: new Date('2026-04-28T14:00:00Z'),
        end_time: new Date('2026-04-28T17:00:00Z'),
        club_id: clubIds[3],
        target_department: null,
        is_featured: true,
        tags: ['entrepreneurship', 'startups', 'business']
      },
      {
        title: 'Theater Showcase 2026',
        description: 'Annual drama and theater performances by students',
        location: 'Main Stage, Building B',
        start_time: new Date('2026-05-02T18:00:00Z'),
        end_time: new Date('2026-05-02T20:30:00Z'),
        club_id: clubIds[1],
        target_department: null,
        is_featured: true,
        tags: ['drama', 'theater', 'performing arts']
      },
      {
        title: 'Annual Sports Championship',
        description: 'Inter-department sports competitions and games',
        location: 'Sports Complex',
        start_time: new Date('2026-05-05T08:00:00Z'),
        end_time: new Date('2026-05-05T17:00:00Z'),
        club_id: clubIds[2],
        target_department: null,
        is_featured: true,
        tags: ['sports', 'competition', 'fitness']
      },
      {
        title: 'AI/ML Bootcamp',
        description: 'Intensive 3-day artificial intelligence and machine learning training',
        location: 'Lab 205, Building A',
        start_time: new Date('2026-05-10T09:00:00Z'),
        end_time: new Date('2026-05-10T16:00:00Z'),
        club_id: clubIds[0],
        target_department: 'Computer Science',
        is_featured: true,
        tags: ['AI', 'machine learning', 'data science']
      },
      {
        title: 'Corporate Recruitment Drive',
        description: 'Campus recruitment by top tech companies',
        location: 'Seminar Hall, Building C',
        start_time: new Date('2026-05-15T10:00:00Z'),
        end_time: new Date('2026-05-15T15:00:00Z'),
        club_id: clubIds[0],
        target_department: null,
        is_featured: true,
        tags: ['recruitment', 'jobs', 'career']
      }
    ];
    
    const eventInsertQuery = `
      INSERT INTO events (title, description, location, start_time, end_time, club_id, target_department, is_featured, tags)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    
    const eventIds = [];
    for (const event of eventsData) {
      const result = await client.query(eventInsertQuery, [
        event.title,
        event.description,
        event.location,
        event.start_time,
        event.end_time,
        event.club_id,
        event.target_department,
        event.is_featured,
        event.tags
      ]);
      eventIds.push(result.rows[0].id);
    }
    logger.info(`✓ Created ${eventsData.length} events\n`);
    
    // =====================================================================
    // 4. SEED SAVED EVENTS (User bookmarks)
    // =====================================================================
    logger.info('⭐ Seeding saved events...');
    
    const savedEventsData = [
      {
        user_id: userIds['arjun.patel@student.smartcampus.edu'],
        event_id: eventIds[0] // Web Development Workshop
      },
      {
        user_id: userIds['arjun.patel@student.smartcampus.edu'],
        event_id: eventIds[4] // AI/ML Bootcamp
      },
      {
        user_id: userIds['sneha.sharma@student.smartcampus.edu'],
        event_id: eventIds[1] // Startup Pitching Event
      },
      {
        user_id: userIds['vikram.desai@student.smartcampus.edu'],
        event_id: eventIds[0] // Web Development Workshop
      }
    ];
    
    const savedEventInsertQuery = `
      INSERT INTO saved_events (user_id, event_id)
      VALUES ($1, $2)
    `;
    
    for (const savedEvent of savedEventsData) {
      await client.query(savedEventInsertQuery, [
        savedEvent.user_id,
        savedEvent.event_id
      ]);
    }
    logger.info(`✓ Created ${savedEventsData.length} saved events\n`);
    
    // =====================================================================
    // 5. SEED ELECTIVES
    // =====================================================================
    logger.info('📚 Seeding electives...');
    
    const electivesData = [
      {
        subject_name: 'Advanced Web Development',
        description: 'Full-stack web development with React, Node.js, and PostgreSQL',
        max_students: 50,
        department: 'Computer Science',
        semester: 3
      },
      {
        subject_name: 'Artificial Intelligence',
        description: 'Introduction to AI algorithms, neural networks, and applications',
        max_students: 45,
        department: 'Computer Science',
        semester: 3
      },
      {
        subject_name: 'Cloud Computing',
        description: 'AWS, Azure, GCP - cloud platforms and DevOps',
        max_students: 40,
        department: 'Computer Science',
        semester: 5
      },
      {
        subject_name: 'Mobile App Development',
        description: 'Android and iOS development with modern frameworks',
        max_students: 35,
        department: 'Computer Science',
        semester: 5
      },
      {
        subject_name: 'VLSI Design',
        description: 'Very Large Scale Integration circuit design',
        max_students: 30,
        department: 'Electronics',
        semester: 3
      },
      {
        subject_name: 'Embedded Systems',
        description: 'Microcontroller programming and embedded systems design',
        max_students: 35,
        department: 'Electronics',
        semester: 5
      },
      {
        subject_name: 'Mechanical System Design',
        description: 'CAD, simulation, and mechanical component design',
        max_students: 40,
        department: 'Mechanical',
        semester: 3
      },
      {
        subject_name: 'Robotics',
        description: 'Robotics control, kinematics, and automation',
        max_students: 30,
        department: 'Mechanical',
        semester: 5
      },
      {
        subject_name: 'Data Science & Analytics',
        description: 'Big data analysis, visualization, and predictive modeling',
        max_students: 45,
        department: 'Computer Science',
        semester: 3
      },
      {
        subject_name: 'Cybersecurity',
        description: 'Information security, cryptography, and network protection',
        max_students: 40,
        department: 'Computer Science',
        semester: 5
      }
    ];
    
    const electiveInsertQuery = `
      INSERT INTO electives (subject_name, description, max_students, department, semester)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const electiveIds = [];
    for (const elective of electivesData) {
      const result = await client.query(electiveInsertQuery, [
        elective.subject_name,
        elective.description,
        elective.max_students,
        elective.department,
        elective.semester
      ]);
      electiveIds.push(result.rows[0].id);
    }
    logger.info(`✓ Created ${electivesData.length} electives\n`);
    
    // =====================================================================
    // 6. SEED STUDENT CHOICES (Preferences)
    // =====================================================================
    logger.info('🎯 Seeding student elective preferences...');
    
    const studentChoicesData = [
      // Arjun (CS, Sem 3) - electives[0,1,8]
      { student_id: userIds['arjun.patel@student.smartcampus.edu'], elective_id: electiveIds[0], preference_rank: 1 },
      { student_id: userIds['arjun.patel@student.smartcampus.edu'], elective_id: electiveIds[1], preference_rank: 2 },
      { student_id: userIds['arjun.patel@student.smartcampus.edu'], elective_id: electiveIds[8], preference_rank: 3 },
      
      // Sneha (Electronics, Sem 3) - electives[4]
      { student_id: userIds['sneha.sharma@student.smartcampus.edu'], elective_id: electiveIds[4], preference_rank: 1 },
      { student_id: userIds['sneha.sharma@student.smartcampus.edu'], elective_id: electiveIds[1], preference_rank: 2 },
      
      // Vikram (CS, Sem 5) - electives[2,3,6,9]
      { student_id: userIds['vikram.desai@student.smartcampus.edu'], elective_id: electiveIds[2], preference_rank: 1 },
      { student_id: userIds['vikram.desai@student.smartcampus.edu'], elective_id: electiveIds[3], preference_rank: 2 },
      { student_id: userIds['vikram.desai@student.smartcampus.edu'], elective_id: electiveIds[9], preference_rank: 3 },
      
      // Neha (Mechanical, Sem 5) - electives[7]
      { student_id: userIds['neha.gupta@student.smartcampus.edu'], elective_id: electiveIds[7], preference_rank: 1 },
      { student_id: userIds['neha.gupta@student.smartcampus.edu'], elective_id: electiveIds[6], preference_rank: 2 },
      
      // Rohan (Electronics, Sem 3) - electives[4,5]
      { student_id: userIds['rohan.verma@student.smartcampus.edu'], elective_id: electiveIds[4], preference_rank: 1 },
      { student_id: userIds['rohan.verma@student.smartcampus.edu'], elective_id: electiveIds[5], preference_rank: 2 },
      
      // Isha (CS, Sem 5) - electives[2,9]
      { student_id: userIds['isha.nair@student.smartcampus.edu'], elective_id: electiveIds[2], preference_rank: 1 },
      { student_id: userIds['isha.nair@student.smartcampus.edu'], elective_id: electiveIds[9], preference_rank: 2 },
      
      // Aditya (Mechanical, Sem 3) - electives[6,7]
      { student_id: userIds['aditya.reddy@student.smartcampus.edu'], elective_id: electiveIds[6], preference_rank: 1 },
      { student_id: userIds['aditya.reddy@student.smartcampus.edu'], elective_id: electiveIds[7], preference_rank: 2 }
    ];
    
    const choiceInsertQuery = `
      INSERT INTO student_choices (student_id, elective_id, preference_rank)
      VALUES ($1, $2, $3)
    `;
    
    for (const choice of studentChoicesData) {
      await client.query(choiceInsertQuery, [
        choice.student_id,
        choice.elective_id,
        choice.preference_rank
      ]);
    }
    logger.info(`✓ Created ${studentChoicesData.length} student preferences\n`);
    
    // =====================================================================
    // 7. SEED ALLOCATED ELECTIVES (Results)
    // =====================================================================
    logger.info('✅ Seeding elective allocations...');
    
    const allocatedElectivesData = [
      { student_id: userIds['arjun.patel@student.smartcampus.edu'], elective_id: electiveIds[0] },
      { student_id: userIds['sneha.sharma@student.smartcampus.edu'], elective_id: electiveIds[4] },
      { student_id: userIds['vikram.desai@student.smartcampus.edu'], elective_id: electiveIds[2] },
      { student_id: userIds['neha.gupta@student.smartcampus.edu'], elective_id: electiveIds[7] },
      { student_id: userIds['rohan.verma@student.smartcampus.edu'], elective_id: electiveIds[4] },
      { student_id: userIds['isha.nair@student.smartcampus.edu'], elective_id: electiveIds[2] },
      { student_id: userIds['aditya.reddy@student.smartcampus.edu'], elective_id: electiveIds[6] }
    ];
    
    const allocatedInsertQuery = `
      INSERT INTO allocated_electives (student_id, elective_id, allocation_round)
      VALUES ($1, $2, 1)
    `;
    
    for (const allocation of allocatedElectivesData) {
      await client.query(allocatedInsertQuery, [
        allocation.student_id,
        allocation.elective_id
      ]);
    }
    logger.info(`✓ Created ${allocatedElectivesData.length} elective allocations\n`);
    
    // =====================================================================
    // 8. SEED TEACHERS (Timetable Module)
    // =====================================================================
    logger.info('👨‍🏫 Seeding teachers...');
    
    const teachersData = [
      {
        teacher_code: 'T001',
        full_name: 'Dr. Rajesh Kumar',
        department: 'Computer Science',
        email: 'rajesh.kumar@smartcampus.edu',
        phone: '9876543210'
      },
      {
        teacher_code: 'T002',
        full_name: 'Prof. Priya Singh',
        department: 'Electronics',
        email: 'priya.singh@smartcampus.edu',
        phone: '9876543211'
      },
      {
        teacher_code: 'T003',
        full_name: 'Dr. Amitabh Jain',
        department: 'Computer Science',
        email: 'amitabh.jain@smartcampus.edu',
        phone: '9876543212'
      },
      {
        teacher_code: 'T004',
        full_name: 'Prof. Aisha Khan',
        department: 'Mechanical',
        email: 'aisha.khan@smartcampus.edu',
        phone: '9876543213'
      }
    ];
    
    const teacherInsertQuery = `
      INSERT INTO teachers (teacher_code, full_name, department, email, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const teacherIds = [];
    for (const teacher of teachersData) {
      const result = await client.query(teacherInsertQuery, [
        teacher.teacher_code,
        teacher.full_name,
        teacher.department,
        teacher.email,
        teacher.phone
      ]);
      teacherIds.push(result.rows[0].id);
    }
    logger.info(`✓ Created ${teachersData.length} teachers\n`);
    
    // =====================================================================
    // 9. SEED SUBJECTS (Timetable Module)
    // =====================================================================
    logger.info('📖 Seeding subjects...');
    
    const subjectsData = [
      {
        subject_code: 'CS101',
        subject_name: 'Data Structures',
        hours_per_week: 4,
        course_type: 'Theory',
        department: 'Computer Science',
        semester: 3,
        requires_consecutive_periods: false,
        max_periods_per_day: 2
      },
      {
        subject_code: 'CS102',
        subject_name: 'Database Systems',
        hours_per_week: 3,
        course_type: 'Theory',
        department: 'Computer Science',
        semester: 3,
        requires_consecutive_periods: false,
        max_periods_per_day: 2
      },
      {
        subject_code: 'CS201',
        subject_name: 'Algorithms',
        hours_per_week: 4,
        course_type: 'Theory',
        department: 'Computer Science',
        semester: 5,
        requires_consecutive_periods: false,
        max_periods_per_day: 2
      },
      {
        subject_code: 'EC101',
        subject_name: 'Digital Logic',
        hours_per_week: 4,
        course_type: 'Theory',
        department: 'Electronics',
        semester: 3,
        requires_consecutive_periods: false,
        max_periods_per_day: 2
      },
      {
        subject_code: 'EC102',
        subject_name: 'Microprocessors',
        hours_per_week: 3,
        course_type: 'Practical',
        department: 'Electronics',
        semester: 3,
        requires_consecutive_periods: true,
        max_periods_per_day: 2
      }
    ];
    
    const subjectInsertQuery = `
      INSERT INTO subjects (subject_code, subject_name, hours_per_week, course_type, department, semester, requires_consecutive_periods, max_periods_per_day)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const subjectIds = [];
    for (const subject of subjectsData) {
      const result = await client.query(subjectInsertQuery, [
        subject.subject_code,
        subject.subject_name,
        subject.hours_per_week,
        subject.course_type,
        subject.department,
        subject.semester,
        subject.requires_consecutive_periods,
        subject.max_periods_per_day
      ]);
      subjectIds.push(result.rows[0].id);
    }
    logger.info(`✓ Created ${subjectsData.length} subjects\n`);
    
    // =====================================================================
    // 10. SEED ROOMS (Timetable Module)
    // =====================================================================
    logger.info('🏛️ Seeding rooms...');
    
    const roomsData = [
      {
        room_code: 'A101',
        room_name: 'Classroom A101',
        capacity: 60,
        room_type: 'Classroom',
        floor_number: 1,
        building: 'Building A',
        has_projector: true,
        has_computer: false
      },
      {
        room_code: 'A102',
        room_name: 'Classroom A102',
        capacity: 45,
        room_type: 'Classroom',
        floor_number: 1,
        building: 'Building A',
        has_projector: true,
        has_computer: false
      },
      {
        room_code: 'A201',
        room_name: 'Lab A201',
        capacity: 30,
        room_type: 'Lab',
        floor_number: 2,
        building: 'Building A',
        has_projector: false,
        has_computer: true
      },
      {
        room_code: 'B101',
        room_name: 'Auditorium B101',
        capacity: 200,
        room_type: 'Auditorium',
        floor_number: 1,
        building: 'Building B',
        has_projector: true,
        has_computer: true
      },
      {
        room_code: 'C101',
        room_name: 'Seminar Hall C101',
        capacity: 25,
        room_type: 'Seminar_Hall',
        floor_number: 1,
        building: 'Building C',
        has_projector: true,
        has_computer: false
      }
    ];
    
    const roomInsertQuery = `
      INSERT INTO rooms (room_code, room_name, capacity, room_type, floor_number, building, has_projector, has_computer)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    
    const roomIds = [];
    for (const room of roomsData) {
      const result = await client.query(roomInsertQuery, [
        room.room_code,
        room.room_name,
        room.capacity,
        room.room_type,
        room.floor_number,
        room.building,
        room.has_projector,
        room.has_computer
      ]);
      roomIds.push(result.rows[0].id);
    }
    logger.info(`✓ Created ${roomsData.length} rooms\n`);
    
    // =====================================================================
    // 11. SEED STUDENT GROUPS (Timetable Module)
    // =====================================================================
    logger.info('👥 Seeding student groups...');
    
    const studentGroupsData = [
      {
        group_code: 'CS3A',
        group_name: 'Computer Science 3rd Semester - A',
        strength: 50,
        department: 'Computer Science',
        semester: 3,
        academic_year: '2025-26'
      },
      {
        group_code: 'CS3B',
        group_name: 'Computer Science 3rd Semester - B',
        strength: 48,
        department: 'Computer Science',
        semester: 3,
        academic_year: '2025-26'
      },
      {
        group_code: 'EC3A',
        group_name: 'Electronics 3rd Semester - A',
        strength: 45,
        department: 'Electronics',
        semester: 3,
        academic_year: '2025-26'
      },
      {
        group_code: 'CS5A',
        group_name: 'Computer Science 5th Semester - A',
        strength: 52,
        department: 'Computer Science',
        semester: 5,
        academic_year: '2025-26'
      }
    ];
    
    const groupInsertQuery = `
      INSERT INTO student_groups (group_code, group_name, strength, department, semester, academic_year)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    
    const groupIds = [];
    for (const group of studentGroupsData) {
      const result = await client.query(groupInsertQuery, [
        group.group_code,
        group.group_name,
        group.strength,
        group.department,
        group.semester,
        group.academic_year
      ]);
      groupIds.push(result.rows[0].id);
    }
    logger.info(`✓ Created ${studentGroupsData.length} student groups\n`);
    
    // =====================================================================
    // 12. SEED TEACHER-SUBJECT ASSIGNMENTS (Many-to-Many)
    // =====================================================================
    logger.info('📝 Seeding teacher-subject assignments...');
    
    const teacherSubjectAssignmentsData = [
      { teacher_id: teacherIds[0], subject_id: subjectIds[0], priority: 1 }, // Dr. Rajesh -> Data Structures
      { teacher_id: teacherIds[0], subject_id: subjectIds[2], priority: 2 }, // Dr. Rajesh -> Algorithms
      { teacher_id: teacherIds[2], subject_id: subjectIds[1], priority: 1 }, // Dr. Amitabh -> Database Systems
      { teacher_id: teacherIds[1], subject_id: subjectIds[3], priority: 1 }, // Prof. Priya -> Digital Logic
      { teacher_id: teacherIds[1], subject_id: subjectIds[4], priority: 2 }  // Prof. Priya -> Microprocessors
    ];
    
    const tsaInsertQuery = `
      INSERT INTO teacher_subject_assignments (teacher_id, subject_id, priority)
      VALUES ($1, $2, $3)
    `;
    
    for (const tsa of teacherSubjectAssignmentsData) {
      await client.query(tsaInsertQuery, [
        tsa.teacher_id,
        tsa.subject_id,
        tsa.priority
      ]);
    }
    logger.info(`✓ Created ${teacherSubjectAssignmentsData.length} teacher-subject assignments\n`);
    
    // =====================================================================
    // 13. SEED SUBJECT-CLASS ASSIGNMENTS (Many-to-Many)
    // =====================================================================
    logger.info('📚 Seeding subject-class assignments...');
    
    const subjectClassAssignmentsData = [
      { subject_id: subjectIds[0], group_id: groupIds[0] }, // Data Structures -> CS3A
      { subject_id: subjectIds[0], group_id: groupIds[1] }, // Data Structures -> CS3B
      { subject_id: subjectIds[1], group_id: groupIds[0] }, // Database Systems -> CS3A
      { subject_id: subjectIds[1], group_id: groupIds[1] }, // Database Systems -> CS3B
      { subject_id: subjectIds[2], group_id: groupIds[3] }, // Algorithms -> CS5A
      { subject_id: subjectIds[3], group_id: groupIds[2] }, // Digital Logic -> EC3A
      { subject_id: subjectIds[4], group_id: groupIds[2] }  // Microprocessors -> EC3A
    ];
    
    const scaInsertQuery = `
      INSERT INTO subject_class_assignments (subject_id, group_id)
      VALUES ($1, $2)
    `;
    
    for (const sca of subjectClassAssignmentsData) {
      await client.query(scaInsertQuery, [
        sca.subject_id,
        sca.group_id
      ]);
    }
    logger.info(`✓ Created ${subjectClassAssignmentsData.length} subject-class assignments\n`);
    
    // =====================================================================
    // 14. SEED TEACHER UNAVAILABILITY
    // =====================================================================
    logger.info('📅 Seeding teacher unavailability...');
    
    const teacherUnavailabilityData = [
      {
        teacher_id: teacherIds[0],
        day_of_week: 'Wednesday',
        period_number: 5,
        reason: 'Department meeting',
        is_permanent: false
      },
      {
        teacher_id: teacherIds[1],
        day_of_week: 'Friday',
        period_number: 8,
        reason: 'Research work',
        is_permanent: true
      },
      {
        teacher_id: teacherIds[2],
        day_of_week: 'Monday',
        period_number: 1,
        reason: 'Late arrival',
        is_permanent: false
      }
    ];
    
    const unavailInsertQuery = `
      INSERT INTO teacher_unavailability (teacher_id, day_of_week, period_number, reason, is_permanent)
      VALUES ($1, $2, $3, $4, $5)
    `;
    
    for (const unavail of teacherUnavailabilityData) {
      await client.query(unavailInsertQuery, [
        unavail.teacher_id,
        unavail.day_of_week,
        unavail.period_number,
        unavail.reason,
        unavail.is_permanent
      ]);
    }
    logger.info(`✓ Created ${teacherUnavailabilityData.length} teacher unavailability records\n`);
    
    // =====================================================================
    // 15. SEED TIMETABLE SLOTS (Full week schedule)
    // =====================================================================
    logger.info('⏰ Seeding timetable slots...');
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timetableSlots = [];
    let slotCount = 0;
    
    // Create a realistic weekly timetable
    const timetableData = [
      // Monday - CS3A
      {
        day_of_week: 'Monday',
        period_number: 1,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[0],
        group_id: groupIds[0],
        room_id: roomIds[0]
      },
      {
        day_of_week: 'Monday',
        period_number: 2,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[0],
        group_id: groupIds[0],
        room_id: roomIds[0]
      },
      // Monday - CS3B
      {
        day_of_week: 'Monday',
        period_number: 3,
        teacher_id: teacherIds[2],
        subject_id: subjectIds[1],
        group_id: groupIds[1],
        room_id: roomIds[1]
      },
      {
        day_of_week: 'Monday',
        period_number: 4,
        teacher_id: teacherIds[2],
        subject_id: subjectIds[1],
        group_id: groupIds[1],
        room_id: roomIds[1]
      },
      // Tuesday - EC3A
      {
        day_of_week: 'Tuesday',
        period_number: 1,
        teacher_id: teacherIds[1],
        subject_id: subjectIds[3],
        group_id: groupIds[2],
        room_id: roomIds[1]
      },
      {
        day_of_week: 'Tuesday',
        period_number: 2,
        teacher_id: teacherIds[1],
        subject_id: subjectIds[3],
        group_id: groupIds[2],
        room_id: roomIds[1]
      },
      // Tuesday - CS5A
      {
        day_of_week: 'Tuesday',
        period_number: 4,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[2],
        group_id: groupIds[3],
        room_id: roomIds[0]
      },
      {
        day_of_week: 'Tuesday',
        period_number: 5,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[2],
        group_id: groupIds[3],
        room_id: roomIds[0]
      },
      // Wednesday - CS3A Lab
      {
        day_of_week: 'Wednesday',
        period_number: 2,
        teacher_id: teacherIds[2],
        subject_id: subjectIds[1],
        group_id: groupIds[0],
        room_id: roomIds[2]
      },
      {
        day_of_week: 'Wednesday',
        period_number: 3,
        teacher_id: teacherIds[2],
        subject_id: subjectIds[1],
        group_id: groupIds[0],
        room_id: roomIds[2]
      },
      // Thursday - EC3A Lab
      {
        day_of_week: 'Thursday',
        period_number: 4,
        teacher_id: teacherIds[1],
        subject_id: subjectIds[4],
        group_id: groupIds[2],
        room_id: roomIds[2]
      },
      {
        day_of_week: 'Thursday',
        period_number: 5,
        teacher_id: teacherIds[1],
        subject_id: subjectIds[4],
        group_id: groupIds[2],
        room_id: roomIds[2]
      },
      // Thursday - CS3B
      {
        day_of_week: 'Thursday',
        period_number: 1,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[0],
        group_id: groupIds[1],
        room_id: roomIds[1]
      },
      {
        day_of_week: 'Thursday',
        period_number: 2,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[0],
        group_id: groupIds[1],
        room_id: roomIds[1]
      },
      // Friday - CS5A
      {
        day_of_week: 'Friday',
        period_number: 1,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[2],
        group_id: groupIds[3],
        room_id: roomIds[0]
      },
      {
        day_of_week: 'Friday',
        period_number: 2,
        teacher_id: teacherIds[0],
        subject_id: subjectIds[2],
        group_id: groupIds[3],
        room_id: roomIds[0]
      }
    ];
    
    const slotInsertQuery = `
      INSERT INTO timetable_slots (day_of_week, period_number, teacher_id, subject_id, group_id, room_id, academic_year, semester_type)
      VALUES ($1, $2, $3, $4, $5, $6, '2025-26', 'odd')
    `;
    
    for (const slot of timetableData) {
      await client.query(slotInsertQuery, [
        slot.day_of_week,
        slot.period_number,
        slot.teacher_id,
        slot.subject_id,
        slot.group_id,
        slot.room_id
      ]);
      slotCount++;
    }
    logger.info(`✓ Created ${slotCount} timetable slots\n`);
    
    // =====================================================================
    // COMMIT TRANSACTION
    // =====================================================================
    await client.query('COMMIT');
    
    logger.info('\n' + '='.repeat(70));
    logger.info('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    logger.info('='.repeat(70) + '\n');
    
    logger.info('📊 Summary of seeded data:');
    logger.info(`   • Users: ${usersData.length} (1 admin, 2 faculty, 7 students)`);
    logger.info(`   • Clubs: ${clubsData.length}`);
    logger.info(`   • Events: ${eventsData.length}`);
    logger.info(`   • Saved Events: ${savedEventsData.length}`);
    logger.info(`   • Electives: ${electivesData.length}`);
    logger.info(`   • Student Preferences: ${studentChoicesData.length}`);
    logger.info(`   • Elective Allocations: ${allocatedElectivesData.length}`);
    logger.info(`   • Teachers: ${teachersData.length}`);
    logger.info(`   • Subjects: ${subjectsData.length}`);
    logger.info(`   • Rooms: ${roomsData.length}`);
    logger.info(`   • Student Groups: ${studentGroupsData.length}`);
    logger.info(`   • Teacher-Subject Assignments: ${teacherSubjectAssignmentsData.length}`);
    logger.info(`   • Subject-Class Assignments: ${subjectClassAssignmentsData.length}`);
    logger.info(`   • Teacher Unavailability: ${teacherUnavailabilityData.length}`);
    logger.info(`   • Timetable Slots: ${slotCount}`);
    logger.info('\n🚀 Ready for development and testing!\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('❌ Seeding failed:', error.message);
    logger.error(error.stack);
    throw error;
  } finally {
    client.release();
  }
}

// Run seeding
seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));