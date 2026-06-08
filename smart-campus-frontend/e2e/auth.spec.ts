import { expect, test } from '@playwright/test';
import { mockApi } from './fixtures';

test('student can log in and reach the dashboard', async ({ page }) => {
  await mockApi(page);

  await page.goto('/auth');
  await page.getByLabel('Email').fill('student@campus.edu');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/\/student\/dashboard$/);
});
