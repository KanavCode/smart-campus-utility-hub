/**
 * MSW Request Handlers
 *
 * This file defines all mock API routes for the Smart Campus frontend test suite.
 * Each handler intercepts matching HTTP requests at the network level and returns
 * controlled, predictable responses — no backend needed.
 *
 * Base URL mirrors src/lib/apiConfig.ts → http://localhost:5000/api
 *
 * Pattern: http.[method]('http://localhost:5000/api/<route>', resolver)
 */

import { http, HttpResponse } from 'msw';

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixture data — reusable across handlers
// ─────────────────────────────────────────────────────────────────────────────

export const mockStudentUser = {
  id: 1,
  full_name: 'Test Student',
  email: 'student@campus.edu',
  role: 'student' as const,
  department: 'Computer Science',
  cgpa: 8.5,
  semester: 5,
  is_active: true,
  created_at: '2024-01-15T00:00:00.000Z',
};

export const mockAdminUser = {
  id: 2,
  full_name: 'Test Admin',
  email: 'admin@campus.edu',
  role: 'admin' as const,
  department: 'Administration',
  is_active: true,
  created_at: '2024-01-01T00:00:00.000Z',
};

export const mockTimetableSlots = [
  {
    id: 'slot-1',
    day_of_week: 'Monday',
    period_number: 1,
    subject: { subject_code: 'CS501', subject_name: 'Algorithms', course_type: 'Theory' },
    teacher: { teacher_code: 'T001', full_name: 'Dr. Smith' },
    room: { room_code: 'R101', room_name: 'Lab 101' },
    academic_year: '2024-25',
    semester_type: 'odd',
  },
  {
    id: 'slot-2',
    day_of_week: 'Tuesday',
    period_number: 2,
    subject: { subject_code: 'CS502', subject_name: 'Operating Systems', course_type: 'Theory' },
    teacher: { teacher_code: 'T002', full_name: 'Dr. Johnson' },
    room: { room_code: 'R102', room_name: 'Classroom 102' },
    academic_year: '2024-25',
    semester_type: 'odd',
  },
];

export const mockEvents = [
  {
    id: 1,
    title: 'Tech Fest 2026',
    description: 'Annual technology festival',
    location: 'Main Auditorium',
    start_time: '2026-07-10T09:00:00.000Z',
    end_time: '2026-07-10T18:00:00.000Z',
    club_name: 'Tech Club',
    is_featured: true,
    tags: ['tech', 'annual'],
  },
  {
    id: 2,
    title: 'Cultural Night',
    description: 'Evening of cultural performances',
    location: 'Open Air Theatre',
    start_time: '2026-07-15T18:00:00.000Z',
    end_time: '2026-07-15T22:00:00.000Z',
    club_name: 'Cultural Club',
    is_featured: false,
    tags: ['culture'],
  },
];

export const mockElectives = [
  {
    id: 1,
    subject_name: 'Machine Learning',
    description: 'Introduction to ML algorithms and applications',
    max_students: 60,
    department: 'Computer Science',
    semester: 7,
    current_students: 42,
    teacher_name: 'Dr. Alan Turing',
  },
  {
    id: 2,
    subject_name: 'Cloud Computing',
    description: 'Modern cloud infrastructure and DevOps',
    max_students: 50,
    department: 'Computer Science',
    semester: 7,
    current_students: 35,
    teacher_name: 'Dr. Ada Lovelace',
  },
];

export const mockNotifications = [
  {
    id: 1,
    message: 'Your timetable has been updated',
    type: 'TIMETABLE_UPDATED',
    is_read: false,
    created_at: '2026-06-04T10:00:00.000Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HANDLERS  (/api/auth/*)
// ─────────────────────────────────────────────────────────────────────────────

const authHandlers = [
  /**
   * GET /api/auth/profile
   * Returns the currently authenticated user's profile.
   * Used by AuthContext on app load to restore session.
   */
  http.get('http://localhost:5000/api/auth/profile', () => {
    return HttpResponse.json({
      success: true,
      message: 'Profile fetched successfully',
      data: { user: mockStudentUser },
    });
  }),

  /**
   * POST /api/auth/login
   * Validates credentials and returns user + sets auth cookie.
   */
  http.post('http://localhost:5000/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'admin@campus.edu') {
      return HttpResponse.json({
        success: true,
        message: 'Login successful',
        data: { user: mockAdminUser },
      });
    }

    return HttpResponse.json({
      success: true,
      message: 'Login successful',
      data: { user: mockStudentUser },
    });
  }),

  /**
   * POST /api/auth/register
   * Creates a new user account.
   */
  http.post('http://localhost:5000/api/auth/register', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          ...mockStudentUser,
          full_name: body.full_name as string,
          email: body.email as string,
          role: body.role as string,
        },
      },
    });
  }),

  /**
   * POST /api/auth/logout
   * Clears the auth session server-side.
   */
  http.post('http://localhost:5000/api/auth/logout', () => {
    return HttpResponse.json({ success: true, message: 'Logged out successfully' });
  }),

  /**
   * POST /api/auth/refresh
   * Refreshes the auth token using the refresh cookie.
   */
  http.post('http://localhost:5000/api/auth/refresh', () => {
    return HttpResponse.json({ success: true, message: 'Token refreshed' });
  }),

  /**
   * PUT /api/auth/profile
   * Updates the authenticated user's profile data.
   */
  http.put('http://localhost:5000/api/auth/profile', async ({ request }) => {
    const body = await request.json() as Partial<typeof mockStudentUser>;
    return HttpResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: { ...mockStudentUser, ...body } },
    });
  }),

  /**
   * POST /api/auth/change-password
   * Allows authenticated users to change their password.
   */
  http.post('http://localhost:5000/api/auth/change-password', () => {
    return HttpResponse.json({ success: true, message: 'Password changed successfully' });
  }),

  /**
   * POST /api/auth/forgot-password
   */
  http.post('http://localhost:5000/api/auth/forgot-password', () => {
    return HttpResponse.json({
      success: true,
      message: 'Password reset email sent',
      data: { message: 'Check your email for reset instructions' },
    });
  }),

  /**
   * POST /api/auth/reset-password
   */
  http.post('http://localhost:5000/api/auth/reset-password', () => {
    return HttpResponse.json({ success: true, message: 'Password reset successful' });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// TIMETABLE HANDLERS  (/api/timetable/*)
// ─────────────────────────────────────────────────────────────────────────────

const timetableHandlers = [
  /**
   * GET /api/timetable/group/:groupId
   * Returns a group's weekly timetable schedule.
   */
  http.get('http://localhost:5000/api/timetable/group/:groupId', () => {
    return HttpResponse.json({
      success: true,
      message: 'Timetable fetched successfully',
      data: { slots: mockTimetableSlots },
    });
  }),

  /**
   * GET /api/timetable/teachers
   */
  http.get('http://localhost:5000/api/timetable/teachers', () => {
    return HttpResponse.json({
      success: true,
      message: 'Teachers fetched successfully',
      data: {
        teachers: [
          { id: 't-1', teacher_code: 'T001', full_name: 'Dr. Smith', department: 'CS', email: 'smith@campus.edu', phone: '1234567890', is_active: true },
          { id: 't-2', teacher_code: 'T002', full_name: 'Dr. Johnson', department: 'CS', email: 'johnson@campus.edu', phone: '0987654321', is_active: true },
        ],
        pagination: { total: 2, page: 1, limit: 20 },
      },
    });
  }),

  /**
   * GET /api/timetable/subjects
   */
  http.get('http://localhost:5000/api/timetable/subjects', () => {
    return HttpResponse.json({
      success: true,
      message: 'Subjects fetched successfully',
      data: {
        subjects: [
          { id: 's-1', subject_code: 'CS501', subject_name: 'Algorithms', hours_per_week: 4, course_type: 'Theory', department: 'CS', semester: 5, is_active: true },
        ],
        pagination: { total: 1, page: 1, limit: 20 },
      },
    });
  }),

  /**
   * GET /api/timetable/rooms
   */
  http.get('http://localhost:5000/api/timetable/rooms', () => {
    return HttpResponse.json({
      success: true,
      message: 'Rooms fetched successfully',
      data: {
        rooms: [
          { id: 'r-1', room_code: 'R101', room_name: 'Lab 101', capacity: 60, room_type: 'Lab', is_active: true },
        ],
        pagination: { total: 1, page: 1, limit: 20 },
      },
    });
  }),

  /**
   * GET /api/timetable/groups
   */
  http.get('http://localhost:5000/api/timetable/groups', () => {
    return HttpResponse.json({
      success: true,
      message: 'Groups fetched successfully',
      data: {
        groups: [
          { id: 'g-1', group_code: 'CS5A', group_name: 'CS Semester 5 - A', strength: 60, department: 'CS', semester: 5, academic_year: '2024-25', is_active: true },
        ],
        pagination: { total: 1, page: 1, limit: 20 },
      },
    });
  }),

  /**
   * GET /api/timetable/config
   */
  http.get('http://localhost:5000/api/timetable/config', () => {
    return HttpResponse.json({
      success: true,
      message: 'Config fetched successfully',
      data: { teachers: [], subjects: [], rooms: [], groups: [] },
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS HANDLERS  (/api/events/*)
// ─────────────────────────────────────────────────────────────────────────────

const eventsHandlers = [
  /**
   * GET /api/events
   */
  http.get('http://localhost:5000/api/events', () => {
    return HttpResponse.json({
      success: true,
      message: 'Events fetched successfully',
      data: { events: mockEvents, total: mockEvents.length },
    });
  }),

  /**
   * GET /api/events/:id
   */
  http.get('http://localhost:5000/api/events/:id', ({ params }) => {
    const event = mockEvents.find((e) => e.id === Number(params.id));
    if (!event) {
      return HttpResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }
    return HttpResponse.json({ success: true, message: 'Event fetched', data: { event } });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// ELECTIVES HANDLERS  (/api/electives/*)
// ─────────────────────────────────────────────────────────────────────────────

const electivesHandlers = [
  /**
   * GET /api/electives
   */
  http.get('http://localhost:5000/api/electives', () => {
    return HttpResponse.json({
      success: true,
      message: 'Electives fetched successfully',
      data: { electives: mockElectives },
    });
  }),

  /**
   * POST /api/electives/:id/enroll
   */
  http.post('http://localhost:5000/api/electives/:id/enroll', () => {
    return HttpResponse.json({ success: true, message: 'Enrolled successfully' });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS HANDLERS  (/api/notifications/*)
// ─────────────────────────────────────────────────────────────────────────────

const notificationsHandlers = [
  /**
   * GET /api/notifications
   */
  http.get('http://localhost:5000/api/notifications', () => {
    return HttpResponse.json({
      success: true,
      message: 'Notifications fetched',
      data: { notifications: mockNotifications },
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH HANDLERS  (/api/search/*)
// ─────────────────────────────────────────────────────────────────────────────

const searchHandlers = [
  /**
   * GET /api/search
   */
  http.get('http://localhost:5000/api/search', () => {
    return HttpResponse.json({
      success: true,
      message: 'Search results',
      data: { results: [] },
    });
  }),
];

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED EXPORT — consumed by server.ts
// ─────────────────────────────────────────────────────────────────────────────

export const handlers = [
  ...authHandlers,
  ...timetableHandlers,
  ...eventsHandlers,
  ...electivesHandlers,
  ...notificationsHandlers,
  ...searchHandlers,
];
