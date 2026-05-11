const bcrypt = require('bcryptjs');
const { pool, logger } = require('../src/config/db');

/**
 * Seed script (v2.0 — Supabase-Ready)
 * All PKs are UUID, teachers merged into users, JSONB metadata columns.
 */
async function seedDatabase() {
  const client = await pool.connect();
  try {
    logger.info('🌱 Starting database seeding (v2.0)...\n');
    await client.query('BEGIN');

    // ── 1. USERS ──────────────────────────────────────────────────────
    logger.info('👥 Seeding users...');
    const adminPw = await bcrypt.hash('admin123', 10);
    const studentPw = await bcrypt.hash('student123', 10);
    const facultyPw = await bcrypt.hash('faculty123', 10);

    const usersData = [
      { full_name: 'Admin User', email: 'admin@smartcampus.edu', pw: adminPw, role: 'admin', dept: 'Administration', meta: { auth_provider: 'local' } },
      { full_name: 'Dr. Rajesh Kumar', email: 'rajesh.kumar@smartcampus.edu', pw: facultyPw, role: 'faculty', dept: 'Computer Science', meta: { auth_provider: 'local', teacher_code: 'T001', phone: '9876543210' } },
      { full_name: 'Prof. Priya Singh', email: 'priya.singh@smartcampus.edu', pw: facultyPw, role: 'faculty', dept: 'Electronics', meta: { auth_provider: 'local', teacher_code: 'T002', phone: '9876543211' } },
      { full_name: 'Dr. Amitabh Jain', email: 'amitabh.jain@smartcampus.edu', pw: facultyPw, role: 'faculty', dept: 'Computer Science', meta: { auth_provider: 'local', teacher_code: 'T003', phone: '9876543212' } },
      { full_name: 'Prof. Aisha Khan', email: 'aisha.khan@smartcampus.edu', pw: facultyPw, role: 'faculty', dept: 'Mechanical', meta: { auth_provider: 'local', teacher_code: 'T004', phone: '9876543213' } },
      { full_name: 'Arjun Patel', email: 'arjun.patel@student.smartcampus.edu', pw: studentPw, role: 'student', dept: 'Computer Science', meta: { auth_provider: 'local', cgpa: 8.5, semester: 3 } },
      { full_name: 'Sneha Sharma', email: 'sneha.sharma@student.smartcampus.edu', pw: studentPw, role: 'student', dept: 'Electronics', meta: { auth_provider: 'local', cgpa: 7.8, semester: 3 } },
      { full_name: 'Vikram Desai', email: 'vikram.desai@student.smartcampus.edu', pw: studentPw, role: 'student', dept: 'Computer Science', meta: { auth_provider: 'local', cgpa: 8.2, semester: 5 } },
      { full_name: 'Neha Gupta', email: 'neha.gupta@student.smartcampus.edu', pw: studentPw, role: 'student', dept: 'Mechanical', meta: { auth_provider: 'local', cgpa: 7.5, semester: 5 } },
      { full_name: 'Rohan Verma', email: 'rohan.verma@student.smartcampus.edu', pw: studentPw, role: 'student', dept: 'Electronics', meta: { auth_provider: 'local', cgpa: 8.9, semester: 3 } },
      { full_name: 'Isha Nair', email: 'isha.nair@student.smartcampus.edu', pw: studentPw, role: 'student', dept: 'Computer Science', meta: { auth_provider: 'local', cgpa: 8.6, semester: 5 } },
      { full_name: 'Aditya Reddy', email: 'aditya.reddy@student.smartcampus.edu', pw: studentPw, role: 'student', dept: 'Mechanical', meta: { auth_provider: 'local', cgpa: 7.9, semester: 3 } },
    ];

    const userIds = {};
    for (const u of usersData) {
      const r = await client.query(
        `INSERT INTO users (full_name, email, password_hash, role, department, metadata)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email`,
        [u.full_name, u.email, u.pw, u.role, u.dept, JSON.stringify(u.meta)]
      );
      userIds[u.email] = r.rows[0].id;
    }
    logger.info(`✓ Created ${usersData.length} users\n`);

    // Faculty lookup by teacher_code
    const faculty = {
      T001: userIds['rajesh.kumar@smartcampus.edu'],
      T002: userIds['priya.singh@smartcampus.edu'],
      T003: userIds['amitabh.jain@smartcampus.edu'],
      T004: userIds['aisha.khan@smartcampus.edu'],
    };

    // ── 2. CLUBS ──────────────────────────────────────────────────────
    logger.info('🎭 Seeding clubs...');
    const clubsData = [
      { name: 'Tech Innovation Club', desc: 'Exploring cutting-edge technology and software development', email: 'tech@smartcampus.edu', cat: 'technical' },
      { name: 'Drama & Performing Arts', desc: 'Theater, drama, and performing arts activities', email: 'drama@smartcampus.edu', cat: 'cultural' },
      { name: 'Sports & Fitness Club', desc: 'Physical fitness, sports tournaments, and wellness', email: 'sports@smartcampus.edu', cat: 'sports' },
      { name: 'Innovation Lab', desc: 'Entrepreneurship and startup development', email: 'innovation@smartcampus.edu', cat: 'entrepreneurship' },
    ];
    const clubIds = [];
    for (const c of clubsData) {
      const r = await client.query(
        `INSERT INTO clubs (name, description, contact_email, category) VALUES ($1,$2,$3,$4) RETURNING id`,
        [c.name, c.desc, c.email, c.cat]
      );
      clubIds.push(r.rows[0].id);
    }
    logger.info(`✓ Created ${clubsData.length} clubs\n`);

    // ── 3. EVENTS ─────────────────────────────────────────────────────
    logger.info('📅 Seeding events...');
    const eventsData = [
      { title: 'Web Development Workshop', desc: 'Learn modern web technologies - React, Node.js, MongoDB', loc: 'Room 101, Building A', s: '2026-04-25T10:00:00Z', e: '2026-04-25T12:00:00Z', club: clubIds[0], dept: 'Computer Science', feat: true, tags: ['web','development','technology'] },
      { title: 'Startup Pitching Event', desc: 'Present your startup ideas to investors and mentors', loc: 'Auditorium, Building C', s: '2026-04-28T14:00:00Z', e: '2026-04-28T17:00:00Z', club: clubIds[3], dept: null, feat: true, tags: ['entrepreneurship','startups','business'] },
      { title: 'Theater Showcase 2026', desc: 'Annual drama and theater performances by students', loc: 'Main Stage, Building B', s: '2026-05-02T18:00:00Z', e: '2026-05-02T20:30:00Z', club: clubIds[1], dept: null, feat: true, tags: ['drama','theater','performing arts'] },
      { title: 'Annual Sports Championship', desc: 'Inter-department sports competitions and games', loc: 'Sports Complex', s: '2026-05-05T08:00:00Z', e: '2026-05-05T17:00:00Z', club: clubIds[2], dept: null, feat: true, tags: ['sports','competition','fitness'] },
      { title: 'AI/ML Bootcamp', desc: 'Intensive 3-day AI and ML training', loc: 'Lab 205, Building A', s: '2026-05-10T09:00:00Z', e: '2026-05-10T16:00:00Z', club: clubIds[0], dept: 'Computer Science', feat: true, tags: ['AI','machine learning','data science'] },
      { title: 'Corporate Recruitment Drive', desc: 'Campus recruitment by top tech companies', loc: 'Seminar Hall, Building C', s: '2026-05-15T10:00:00Z', e: '2026-05-15T15:00:00Z', club: clubIds[0], dept: null, feat: true, tags: ['recruitment','jobs','career'] },
    ];
    const eventIds = [];
    for (const ev of eventsData) {
      const r = await client.query(
        `INSERT INTO events (title, description, location, start_time, end_time, club_id, target_department, is_featured, tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [ev.title, ev.desc, ev.loc, ev.s, ev.e, ev.club, ev.dept, ev.feat, ev.tags]
      );
      eventIds.push(r.rows[0].id);
    }
    logger.info(`✓ Created ${eventsData.length} events\n`);

    // ── 4. SAVED EVENTS ───────────────────────────────────────────────
    logger.info('⭐ Seeding saved events...');
    const savedPairs = [
      [userIds['arjun.patel@student.smartcampus.edu'], eventIds[0]],
      [userIds['arjun.patel@student.smartcampus.edu'], eventIds[4]],
      [userIds['sneha.sharma@student.smartcampus.edu'], eventIds[1]],
      [userIds['vikram.desai@student.smartcampus.edu'], eventIds[0]],
    ];
    for (const [uid, eid] of savedPairs) {
      await client.query('INSERT INTO saved_events (user_id, event_id) VALUES ($1,$2)', [uid, eid]);
    }
    logger.info(`✓ Created ${savedPairs.length} saved events\n`);

    // ── 5. ELECTIVES ──────────────────────────────────────────────────
    logger.info('📚 Seeding electives...');
    const electivesData = [
      { name: 'Advanced Web Development', desc: 'Full-stack web development with React, Node.js, and PostgreSQL', max: 50, dept: 'Computer Science', sem: 3 },
      { name: 'Artificial Intelligence', desc: 'Introduction to AI algorithms, neural networks, and applications', max: 45, dept: 'Computer Science', sem: 3 },
      { name: 'Cloud Computing', desc: 'AWS, Azure, GCP - cloud platforms and DevOps', max: 40, dept: 'Computer Science', sem: 5 },
      { name: 'Mobile App Development', desc: 'Android and iOS development with modern frameworks', max: 35, dept: 'Computer Science', sem: 5 },
      { name: 'VLSI Design', desc: 'Very Large Scale Integration circuit design', max: 30, dept: 'Electronics', sem: 3 },
      { name: 'Embedded Systems', desc: 'Microcontroller programming and embedded systems design', max: 35, dept: 'Electronics', sem: 5 },
      { name: 'Mechanical System Design', desc: 'CAD, simulation, and mechanical component design', max: 40, dept: 'Mechanical', sem: 3 },
      { name: 'Robotics', desc: 'Robotics control, kinematics, and automation', max: 30, dept: 'Mechanical', sem: 5 },
      { name: 'Data Science & Analytics', desc: 'Big data analysis, visualization, and predictive modeling', max: 45, dept: 'Computer Science', sem: 3 },
      { name: 'Cybersecurity', desc: 'Information security, cryptography, and network protection', max: 40, dept: 'Computer Science', sem: 5 },
    ];
    const electiveIds = [];
    for (const el of electivesData) {
      const r = await client.query(
        'INSERT INTO electives (subject_name, description, max_students, department, semester) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [el.name, el.desc, el.max, el.dept, el.sem]
      );
      electiveIds.push(r.rows[0].id);
    }
    logger.info(`✓ Created ${electivesData.length} electives\n`);

    // ── 6. STUDENT CHOICES ────────────────────────────────────────────
    logger.info('🎯 Seeding student elective preferences...');
    const choicesData = [
      [userIds['arjun.patel@student.smartcampus.edu'], electiveIds[0], 1],
      [userIds['arjun.patel@student.smartcampus.edu'], electiveIds[1], 2],
      [userIds['arjun.patel@student.smartcampus.edu'], electiveIds[8], 3],
      [userIds['sneha.sharma@student.smartcampus.edu'], electiveIds[4], 1],
      [userIds['sneha.sharma@student.smartcampus.edu'], electiveIds[1], 2],
      [userIds['vikram.desai@student.smartcampus.edu'], electiveIds[2], 1],
      [userIds['vikram.desai@student.smartcampus.edu'], electiveIds[3], 2],
      [userIds['vikram.desai@student.smartcampus.edu'], electiveIds[9], 3],
      [userIds['neha.gupta@student.smartcampus.edu'], electiveIds[7], 1],
      [userIds['neha.gupta@student.smartcampus.edu'], electiveIds[6], 2],
      [userIds['rohan.verma@student.smartcampus.edu'], electiveIds[4], 1],
      [userIds['rohan.verma@student.smartcampus.edu'], electiveIds[5], 2],
      [userIds['isha.nair@student.smartcampus.edu'], electiveIds[2], 1],
      [userIds['isha.nair@student.smartcampus.edu'], electiveIds[9], 2],
      [userIds['aditya.reddy@student.smartcampus.edu'], electiveIds[6], 1],
      [userIds['aditya.reddy@student.smartcampus.edu'], electiveIds[7], 2],
    ];
    for (const [sid, eid, rank] of choicesData) {
      await client.query('INSERT INTO student_choices (student_id, elective_id, preference_rank) VALUES ($1,$2,$3)', [sid, eid, rank]);
    }
    logger.info(`✓ Created ${choicesData.length} student preferences\n`);

    // ── 7. ALLOCATED ELECTIVES ────────────────────────────────────────
    logger.info('✅ Seeding elective allocations...');
    const allocData = [
      [userIds['arjun.patel@student.smartcampus.edu'], electiveIds[0]],
      [userIds['sneha.sharma@student.smartcampus.edu'], electiveIds[4]],
      [userIds['vikram.desai@student.smartcampus.edu'], electiveIds[2]],
      [userIds['neha.gupta@student.smartcampus.edu'], electiveIds[7]],
      [userIds['rohan.verma@student.smartcampus.edu'], electiveIds[4]],
      [userIds['isha.nair@student.smartcampus.edu'], electiveIds[2]],
      [userIds['aditya.reddy@student.smartcampus.edu'], electiveIds[6]],
    ];
    for (const [sid, eid] of allocData) {
      await client.query('INSERT INTO allocated_electives (student_id, elective_id, allocation_round) VALUES ($1,$2,1)', [sid, eid]);
    }
    logger.info(`✓ Created ${allocData.length} elective allocations\n`);

    // ── 8. SUBJECTS ───────────────────────────────────────────────────
    logger.info('📖 Seeding subjects...');
    const subjectsData = [
      { code: 'CS101', name: 'Data Structures', hrs: 4, type: 'Theory', dept: 'Computer Science', sem: 3, sched: { requires_consecutive: false, max_periods_per_day: 2 } },
      { code: 'CS102', name: 'Database Systems', hrs: 3, type: 'Theory', dept: 'Computer Science', sem: 3, sched: { requires_consecutive: false, max_periods_per_day: 2 } },
      { code: 'CS201', name: 'Algorithms', hrs: 4, type: 'Theory', dept: 'Computer Science', sem: 5, sched: { requires_consecutive: false, max_periods_per_day: 2 } },
      { code: 'EC101', name: 'Digital Logic', hrs: 4, type: 'Theory', dept: 'Electronics', sem: 3, sched: { requires_consecutive: false, max_periods_per_day: 2 } },
      { code: 'EC102', name: 'Microprocessors', hrs: 3, type: 'Practical', dept: 'Electronics', sem: 3, sched: { requires_consecutive: true, max_periods_per_day: 2 } },
    ];
    const subjectIds = [];
    for (const s of subjectsData) {
      const r = await client.query(
        'INSERT INTO subjects (subject_code, subject_name, hours_per_week, course_type, department, semester, scheduling) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [s.code, s.name, s.hrs, s.type, s.dept, s.sem, JSON.stringify(s.sched)]
      );
      subjectIds.push(r.rows[0].id);
    }
    logger.info(`✓ Created ${subjectsData.length} subjects\n`);

    // ── 9. ROOMS ──────────────────────────────────────────────────────
    logger.info('🏛️ Seeding rooms...');
    const roomsData = [
      { code: 'A101', name: 'Classroom A101', cap: 60, type: 'Classroom', amenities: { has_projector: true, has_computer: false, floor_number: 1, building: 'Building A' } },
      { code: 'A102', name: 'Classroom A102', cap: 45, type: 'Classroom', amenities: { has_projector: true, has_computer: false, floor_number: 1, building: 'Building A' } },
      { code: 'A201', name: 'Lab A201', cap: 30, type: 'Lab', amenities: { has_projector: false, has_computer: true, floor_number: 2, building: 'Building A' } },
      { code: 'B101', name: 'Auditorium B101', cap: 200, type: 'Auditorium', amenities: { has_projector: true, has_computer: true, floor_number: 1, building: 'Building B' } },
      { code: 'C101', name: 'Seminar Hall C101', cap: 25, type: 'Seminar_Hall', amenities: { has_projector: true, has_computer: false, floor_number: 1, building: 'Building C' } },
    ];
    const roomIds = [];
    for (const rm of roomsData) {
      const r = await client.query(
        'INSERT INTO rooms (room_code, room_name, capacity, room_type, amenities) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [rm.code, rm.name, rm.cap, rm.type, JSON.stringify(rm.amenities)]
      );
      roomIds.push(r.rows[0].id);
    }
    logger.info(`✓ Created ${roomsData.length} rooms\n`);

    // ── 10. STUDENT GROUPS ────────────────────────────────────────────
    logger.info('👥 Seeding student groups...');
    const groupsData = [
      { code: 'CS3A', name: 'Computer Science 3rd Semester - A', str: 50, dept: 'Computer Science', sem: 3, yr: '2025-26' },
      { code: 'CS3B', name: 'Computer Science 3rd Semester - B', str: 48, dept: 'Computer Science', sem: 3, yr: '2025-26' },
      { code: 'EC3A', name: 'Electronics 3rd Semester - A', str: 45, dept: 'Electronics', sem: 3, yr: '2025-26' },
      { code: 'CS5A', name: 'Computer Science 5th Semester - A', str: 52, dept: 'Computer Science', sem: 5, yr: '2025-26' },
    ];
    const groupIds = [];
    for (const g of groupsData) {
      const r = await client.query(
        'INSERT INTO student_groups (group_code, group_name, strength, department, semester, academic_year) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
        [g.code, g.name, g.str, g.dept, g.sem, g.yr]
      );
      groupIds.push(r.rows[0].id);
    }
    logger.info(`✓ Created ${groupsData.length} student groups\n`);

    // ── 11. TEACHER-SUBJECT ASSIGNMENTS ───────────────────────────────
    logger.info('📝 Seeding teacher-subject assignments...');
    const tsaData = [
      [faculty.T001, subjectIds[0], 1], [faculty.T001, subjectIds[2], 2],
      [faculty.T003, subjectIds[1], 1], [faculty.T002, subjectIds[3], 1],
      [faculty.T002, subjectIds[4], 2],
    ];
    for (const [tid, sid, pri] of tsaData) {
      await client.query('INSERT INTO teacher_subject_assignments (teacher_id, subject_id, priority) VALUES ($1,$2,$3)', [tid, sid, pri]);
    }
    logger.info(`✓ Created ${tsaData.length} teacher-subject assignments\n`);

    // ── 12. SUBJECT-CLASS ASSIGNMENTS ─────────────────────────────────
    logger.info('📚 Seeding subject-class assignments...');
    const scaData = [
      [subjectIds[0], groupIds[0]], [subjectIds[0], groupIds[1]],
      [subjectIds[1], groupIds[0]], [subjectIds[1], groupIds[1]],
      [subjectIds[2], groupIds[3]], [subjectIds[3], groupIds[2]],
      [subjectIds[4], groupIds[2]],
    ];
    for (const [sid, gid] of scaData) {
      await client.query('INSERT INTO subject_class_assignments (subject_id, group_id) VALUES ($1,$2)', [sid, gid]);
    }
    logger.info(`✓ Created ${scaData.length} subject-class assignments\n`);

    // ── 13. TEACHER UNAVAILABILITY ────────────────────────────────────
    logger.info('📅 Seeding teacher unavailability...');
    const unavailData = [
      [faculty.T001, 'Wednesday', 5, 'Department meeting', false],
      [faculty.T002, 'Friday', 8, 'Research work', true],
      [faculty.T003, 'Monday', 1, 'Late arrival', false],
    ];
    for (const [tid, day, per, reason, perm] of unavailData) {
      await client.query('INSERT INTO teacher_unavailability (teacher_id, day_of_week, period_number, reason, is_permanent) VALUES ($1,$2,$3,$4,$5)', [tid, day, per, reason, perm]);
    }
    logger.info(`✓ Created ${unavailData.length} teacher unavailability records\n`);

    // ── 14. TIMETABLE SLOTS ──────────────────────────────────────────
    logger.info('⏰ Seeding timetable slots...');
    const slotData = [
      ['Monday',1,faculty.T001,subjectIds[0],groupIds[0],roomIds[0]],
      ['Monday',2,faculty.T001,subjectIds[0],groupIds[0],roomIds[0]],
      ['Monday',3,faculty.T003,subjectIds[1],groupIds[1],roomIds[1]],
      ['Monday',4,faculty.T003,subjectIds[1],groupIds[1],roomIds[1]],
      ['Tuesday',1,faculty.T002,subjectIds[3],groupIds[2],roomIds[1]],
      ['Tuesday',2,faculty.T002,subjectIds[3],groupIds[2],roomIds[1]],
      ['Tuesday',4,faculty.T001,subjectIds[2],groupIds[3],roomIds[0]],
      ['Tuesday',5,faculty.T001,subjectIds[2],groupIds[3],roomIds[0]],
      ['Wednesday',2,faculty.T003,subjectIds[1],groupIds[0],roomIds[2]],
      ['Wednesday',3,faculty.T003,subjectIds[1],groupIds[0],roomIds[2]],
      ['Thursday',4,faculty.T002,subjectIds[4],groupIds[2],roomIds[2]],
      ['Thursday',5,faculty.T002,subjectIds[4],groupIds[2],roomIds[2]],
      ['Thursday',1,faculty.T001,subjectIds[0],groupIds[1],roomIds[1]],
      ['Thursday',2,faculty.T001,subjectIds[0],groupIds[1],roomIds[1]],
      ['Friday',1,faculty.T001,subjectIds[2],groupIds[3],roomIds[0]],
      ['Friday',2,faculty.T001,subjectIds[2],groupIds[3],roomIds[0]],
    ];
    for (const [day,per,tid,sid,gid,rid] of slotData) {
      await client.query(
        `INSERT INTO timetable_slots (day_of_week, period_number, teacher_id, subject_id, group_id, room_id, academic_year, semester_type) VALUES ($1,$2,$3,$4,$5,$6,'2025-26','odd')`,
        [day, per, tid, sid, gid, rid]
      );
    }
    logger.info(`✓ Created ${slotData.length} timetable slots\n`);

    // ── COMMIT ────────────────────────────────────────────────────────
    await client.query('COMMIT');

    logger.info('\n' + '='.repeat(70));
    logger.info('✅ DATABASE SEEDING v2.0 COMPLETED SUCCESSFULLY!');
    logger.info('='.repeat(70) + '\n');
    logger.info('📊 Summary:');
    logger.info(`   • Users: ${usersData.length} (1 admin, 4 faculty, 7 students)`);
    logger.info(`   • Clubs: ${clubsData.length} | Events: ${eventsData.length} | Saved: ${savedPairs.length}`);
    logger.info(`   • Electives: ${electivesData.length} | Choices: ${choicesData.length} | Allocations: ${allocData.length}`);
    logger.info(`   • Subjects: ${subjectsData.length} | Rooms: ${roomsData.length} | Groups: ${groupsData.length}`);
    logger.info(`   • TSA: ${tsaData.length} | SCA: ${scaData.length} | Unavail: ${unavailData.length} | Slots: ${slotData.length}`);
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

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));