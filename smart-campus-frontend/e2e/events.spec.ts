import { test, expect } from '@playwright/test';
import { loginAsStudent, mockApi } from './fixtures';

test('student can navigate to events and RSVP', async ({ page }) => {
  await mockApi(page);
  await loginAsStudent(page);
  await page.click('a[href*="events"]');
  await expect(page).toHaveURL(/events/);
  const rsvpButton = page.getByRole('button', { name: /rsvp/i });
  await rsvpButton.first().click();
  await expect(rsvpButton.first()).toBeVisible();
});
