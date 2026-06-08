import { expect, type Page } from '@playwright/test';

type TestUser = {
  id: number;
  full_name: string;
  email: string;
  role: 'student' | 'admin';
  department: string;
  cgpa?: number;
  semester?: number;
  is_active: boolean;
  created_at: string;
};

const studentUser: TestUser = {
  id: 1,
  full_name: 'Test Student',
  email: 'student@campus.edu',
  role: 'student',
  department: 'Computer Science',
  cgpa: 8.6,
  semester: 5,
  is_active: true,
  created_at: '2026-01-01T00:00:00.000Z',
};

const adminUser: TestUser = {
  id: 2,
  full_name: 'Test Admin',
  email: 'admin@campus.edu',
  role: 'admin',
  department: 'Administration',
  is_active: true,
  created_at: '2026-01-01T00:00:00.000Z',
};

export async function mockApi(page: Page) {
  let currentUser: TestUser | null = null;
  let rsvpStatus: 'confirmed' | null = null;

  const campusEvent = () => ({
    id: 1,
    title: 'Robotics Workshop',
    description: 'Build and test autonomous campus utility prototypes.',
    location: 'Innovation Lab',
    start_time: '2026-06-20T10:00:00.000Z',
    end_time: '2026-06-20T12:00:00.000Z',
    club_id: 7,
    club_name: 'Tech Club',
    target_department: 'Computer Science',
    is_featured: true,
    tags: ['workshop', 'robotics'],
    max_capacity: 40,
    current_confirmed: rsvpStatus ? 1 : 0,
    rsvp_status: rsvpStatus,
  });

  await page.route('**/api/auth/profile', async (route) => {
    if (!currentUser) {
      await route.fulfill({ status: 401, json: { success: false, message: 'Not authenticated' } });
      return;
    }

    await route.fulfill({
      status: 200,
      json: { success: true, message: 'Profile fetched', data: { user: currentUser } },
    });
  });

  await page.route('**/api/auth/login', async (route) => {
    const body = route.request().postDataJSON() as { email?: string };
    currentUser = body.email === adminUser.email ? adminUser : studentUser;

    await route.fulfill({
      status: 200,
      json: { success: true, message: 'Login successful', data: { user: currentUser } },
    });
  });

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({ status: 401, json: { success: false, message: 'Session expired' } });
  });

  await page.route('**/api/events/saved/my-events', async (route) => {
    await route.fulfill({
      status: 200,
      json: { success: true, message: 'Saved events fetched', data: { events: [], count: 0 } },
    });
  });

  await page.route('**/api/events/1/rsvp', async (route) => {
    rsvpStatus = 'confirmed';

    await route.fulfill({
      status: 200,
      json: {
        success: true,
        message: 'RSVP successful',
        data: { rsvp: { event_id: 1, status: rsvpStatus } },
      },
    });
  });

  await page.route('**/api/events?**', async (route) => {
    await route.fulfill({
      status: 200,
      json: { success: true, message: 'Events fetched', data: { events: [campusEvent()], total: 1 } },
    });
  });

  return {
    setUser(user: TestUser) {
      currentUser = user;
    },
    studentUser,
    adminUser,
  };
}

export async function loginAsStudent(page: Page) {
  await page.goto('/auth');
  await page.getByLabel('Email').fill(studentUser.email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/student\/dashboard$/);
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth');
  await page.getByLabel('Email').fill(adminUser.email);
  await page.getByLabel('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
}
