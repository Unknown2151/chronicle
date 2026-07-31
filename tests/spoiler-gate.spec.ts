import { test, expect } from '@playwright/test';

test.describe('Spoiler Gate Architecture', () => {

    test('unauthenticated user is redirected to login', async ({ page }) => {
        // Attempting to bypass straight to a chunk URL
        await page.goto('/rooms/seed-room-1/chunk/chunk-123');
        await expect(page).toHaveURL(/.*login/);
    });

    test('authenticated user without progress sees the Lock Screen, not data', async ({ page, request }) => {
        // 1. Log in via test utility
        await page.goto('/login');
        await page.fill('input[name="email"]', 'reader@test.com');
        await page.click('button[type="submit"]');

        // 2. Navigate to a locked chunk
        await page.goto('/rooms/seed-room-1/chunk/chunk-locked-456');

        // 3. UI Assertion: The Spoiler Gate is visible
        await expect(page.locator('text=Spoiler Gate Active')).toBeVisible();

        // 4. Data Assertion: Ensure posts are NOT secretly hiding in the DOM
        const posts = await page.locator('.discussion-post').count();
        expect(posts).toBe(0);

        // 5. API Assertion: Direct API requests must return 403 Forbidden
        const response = await request.get('/api/discussions?chunkId=chunk-locked-456');
        expect(response.status()).toBe(403);
    });
});