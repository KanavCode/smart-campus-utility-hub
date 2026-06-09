import { Page } from '@playwright/test';

export async function mockApi(page: Page) {
  await page.route('**/api/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}

export async function loginAsStudent(page: Page) {
  await page.goto('/');
  await page.fill('input[name="email"]', 'student@campus.edu');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**');
}

export async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.fill('input[name="email"]', 'admin@campus.edu');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**');
}
