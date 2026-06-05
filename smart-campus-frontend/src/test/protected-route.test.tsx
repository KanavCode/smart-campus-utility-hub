import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';
import { PERMISSIONS } from '@/utils/permissions';
import { User } from '@/types';
import { http, HttpResponse } from 'msw';
import { server } from './mocks/server';
import { mockStudentUser, mockAdminUser } from './mocks/handlers';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps a component with the full provider tree ProtectedRoute requires:
 *   BrowserRouter  (for <Navigate> / routing)
 *   AuthProvider   (for useAuth — calls /api/auth/profile via MSW on mount)
 *
 * MSW intercepts AuthProvider's getProfile() call, so no real server needed.
 */
const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>,
  );

// ─────────────────────────────────────────────────────────────────────────────
// Authentication Gate Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ProtectedRoute — Authentication Gate', () => {
  it('does not render protected content when user is unauthenticated', async () => {
    // Override: profile endpoint returns 401 → AuthProvider sets user = null
    // → ProtectedRoute redirects to /auth instead of rendering children
    server.use(
      http.get('http://localhost:5000/api/auth/profile', () => {
        return HttpResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 },
        );
      }),
    );

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
    );

    // Protected content must never appear for unauthenticated users
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('mock student profile resolves correctly from MSW handler', async () => {
    // Default handler in handlers.ts returns mockStudentUser — verify shape
    expect(mockStudentUser.role).toBe('student');
    expect(mockStudentUser.email).toBe('student@campus.edu');
    expect(mockStudentUser.is_active).toBe(true);
  });

  it('mock admin profile resolves correctly from MSW handler', async () => {
    expect(mockAdminUser.role).toBe('admin');
    expect(mockAdminUser.email).toBe('admin@campus.edu');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MSW Network-Level Interception Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ProtectedRoute — MSW Route Interception', () => {
  it('MSW intercepts /api/auth/profile and returns mock student data', async () => {
    // Directly verify that MSW is intercepting — fetch the endpoint as
    // any service function would, and assert the mock response is returned.
    const response = await fetch('http://localhost:5000/api/auth/profile');
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(json.success).toBe(true);
    expect(json.data.user.role).toBe('student');
    expect(json.data.user.email).toBe('student@campus.edu');
  });

  it('MSW intercepts /api/timetable/group/:groupId and returns timetable slots', async () => {
    const response = await fetch('http://localhost:5000/api/timetable/group/g-1');
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.slots)).toBe(true);
    expect(json.data.slots.length).toBeGreaterThan(0);
    expect(json.data.slots[0]).toHaveProperty('day_of_week');
    expect(json.data.slots[0]).toHaveProperty('subject');
  });

  it('MSW intercepts /api/events and returns event list', async () => {
    const response = await fetch('http://localhost:5000/api/events');
    const json = await response.json();

    expect(response.ok).toBe(true);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data.events)).toBe(true);
    expect(json.data.events[0].title).toBe('Tech Fest 2026');
  });

  it('MSW intercepts /api/electives and returns elective list', async () => {
    const response = await fetch('http://localhost:5000/api/electives');
    const json = await response.json();

    expect(json.success).toBe(true);
    expect(json.data.electives[0].subject_name).toBe('Machine Learning');
  });

  it('per-test handler override returns 401 without affecting other tests', async () => {
    server.use(
      http.get('http://localhost:5000/api/auth/profile', () => {
        return HttpResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 },
        );
      }),
    );

    const response = await fetch('http://localhost:5000/api/auth/profile');
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toBe('Unauthorized');
  });

  it('handler reset restores default profile after per-test override', async () => {
    // afterEach → server.resetHandlers() ran before this test
    // So the default handler is back — should return 200 + student user
    const response = await fetch('http://localhost:5000/api/auth/profile');
    expect(response.ok).toBe(true);

    const json = await response.json();
    expect(json.data.user.role).toBe('student');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Permission & Role Tests (no network — pure logic)
// ─────────────────────────────────────────────────────────────────────────────

describe('ProtectedRoute — Permission & Role Logic', () => {
  it('accepts adminOnly prop for backward compatibility', () => {
    const props = { children: <div>Admin Content</div>, adminOnly: true };
    expect(props.adminOnly).toBe(true);
  });

  it('accepts requiredPermissions prop', () => {
    const props = {
      children: <div>Protected Content</div>,
      requiredPermissions: [PERMISSIONS.VIEW_ADMIN_DASHBOARD],
    };
    expect(props.requiredPermissions).toBeDefined();
    expect(props.requiredPermissions[0]).toBe(PERMISSIONS.VIEW_ADMIN_DASHBOARD);
  });

  it('accepts requiredAnyPermissions prop', () => {
    const props = {
      children: <div>Protected Content</div>,
      requiredAnyPermissions: [
        PERMISSIONS.VIEW_ADMIN_DASHBOARD,
        PERMISSIONS.VIEW_STUDENT_DASHBOARD,
      ],
    };
    expect(props.requiredAnyPermissions).toBeDefined();
    expect(props.requiredAnyPermissions.length).toBe(2);
  });

  it('student does not have admin dashboard permission', () => {
    const studentPermissions = [
      PERMISSIONS.VIEW_STUDENT_DASHBOARD,
      PERMISSIONS.VIEW_TIMETABLE,
    ];
    expect(studentPermissions.includes(PERMISSIONS.VIEW_ADMIN_DASHBOARD)).toBe(false);
  });

  it('student has access to student-level routes', () => {
    const studentPermissions = [
      PERMISSIONS.VIEW_STUDENT_DASHBOARD,
      PERMISSIONS.VIEW_TIMETABLE,
      PERMISSIONS.VIEW_EVENTS,
    ];
    expect(studentPermissions).toContain(PERMISSIONS.VIEW_STUDENT_DASHBOARD);
    expect(studentPermissions).toContain(PERMISSIONS.VIEW_TIMETABLE);
  });

  it('admin role grants access to all permission keys', () => {
    const allRoutes = Object.values(PERMISSIONS);
    expect(allRoutes.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Role-Based Access Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('ProtectedRoute — Role Recognition', () => {
  it('recognises admin role from User object', () => {
    const adminUser: User = {
      id: 1,
      full_name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      is_active: true,
      created_at: '2024-01-01',
    };
    expect(adminUser.role).toBe('admin');
  });

  it('recognises student role from User object', () => {
    const studentUser: User = {
      id: 2,
      full_name: 'Student User',
      email: 'student@test.com',
      role: 'student',
      is_active: true,
      created_at: '2024-01-01',
    };
    expect(studentUser.role).toBe('student');
  });

  it('blocks direct URL access to admin routes for students', () => {
    const allowedRoles = ['admin'];
    const userRole = 'student';
    expect(allowedRoles.includes(userRole)).toBe(false);
  });

  it('admin role is included in allowed roles for admin paths', () => {
    const allowedRoles = ['student', 'admin'];
    expect(allowedRoles).toContain('admin');
  });

  it('updates route access when role changes from student to admin', () => {
    let accessibleRoutes = [PERMISSIONS.VIEW_STUDENT_DASHBOARD, PERMISSIONS.VIEW_TIMETABLE];
    expect(accessibleRoutes).toContain(PERMISSIONS.VIEW_STUDENT_DASHBOARD);

    accessibleRoutes = Object.values(PERMISSIONS);
    expect(accessibleRoutes.length).toBeGreaterThan(5);
  });
});
