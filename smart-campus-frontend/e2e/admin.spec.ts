import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsStudent, mockApi } from './fixtures';

test('admin can access the admin dashboard', async ({ page }) => {
  await mockApi(page);
  await loginAsAdmin(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/admin/);
});

test('student cannot access the admin dashboard', async ({ page }) => {
  await mockApi(page);
  await loginAsStudent(page);
  await page.goto('/admin');
  await expect(page).not.toHaveURL(/admin/);
});
