import { expect, test } from '@playwright/test';
import { loginAsStudent, mockApi } from './fixtures';

test('student can navigate to events and RSVP', async ({ page }) => {
  await mockApi(page);
  await loginAsStudent(page);

  await page.goto('/events');
  await expect(page.getByRole('heading', { name: 'Campus Events' })).toBeVisible();
  await expect(page.getByText('Robotics Workshop')).toBeVisible();

  await page.getByRole('button', { name: 'RSVP Now' }).click();

  await expect(page.getByRole('button', { name: 'Already RSVPed' })).toBeVisible();
});
