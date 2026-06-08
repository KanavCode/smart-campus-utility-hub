import { test, expect } from '@playwright/test';
import { mockApi } from './fixtures';

test('student can log in and reach the dashboard', async ({ page }) => {
  await mockApi(page);
  await page.goto('/');
  await page.fill('input[name="email"]', 'student@campus.edu');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});
