import { expect, test } from '@playwright/test';
import { loginAsAdmin, loginAsStudent, mockApi } from './fixtures';

test('admin can access the admin dashboard', async ({ page }) => {
  await mockApi(page);
  await loginAsAdmin(page);

  await page.goto('/admin/dashboard');

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
});

test('student is blocked from the admin dashboard', async ({ page }) => {
  await mockApi(page);
  await loginAsStudent(page);

  await page.goto('/admin/dashboard');

  await expect(page).toHaveURL(/\/unauthorized$/);
  await expect(page.getByRole('heading', { name: 'Access Denied' })).toBeVisible();
});
