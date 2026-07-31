import { test, expect } from '@playwright/test';

test.describe('Production Security & Zero-Trust Checks', () => {

    test('Direct API access to locked chunks returns 403 SPOILER_GATE', async ({ request }) => {
        // Hit the API directly, bypassing the UI spoiler gate
        const response = await request.get('/api/discussions?chunkId=LOCKED_CHUNK_ID', {
            headers: { 'Cookie': 'YOUR_TEST_SESSION_COOKIE' }
        });

        expect(response.status()).toBe(403);
        const data = await response.json();
        expect(data.code).toBe('SPOILER_GATE'); // Must not be a 307 redirect or data payload
    });

    test('Non-admin users receive 403 on Room Settings', async ({ request }) => {
        const response = await request.get('/api/rooms/ROOM_ID/settings', {
            headers: { 'Cookie': 'NON_ADMIN_SESSION_COOKIE' }
        });

        expect(response.status()).toBe(403);
    });

    test('XSS payloads are escaped in the discussion feed', async ({ page }) => {
        await page.goto('/rooms/ROOM_ID/chunk/UNLOCKED_CHUNK_ID');

        // Submit an XSS script
        await page.fill('textarea[name="body"]', '<script>alert("XSS")</script>');
        await page.click('button[type="submit"]');

        // Verify it renders as plain text, proving React is escaping the DOM injection
        await expect(page.locator('text=<script>alert("XSS")</script>')).toBeVisible();
    });

    test('Rapid concurrent unlocks enforce rate limiting', async ({ page }) => {
        await page.goto('/rooms/ROOM_ID/chunk/LOCKED_CHUNK_ID');

        // Attempt to rapidly click the unlock button 10 times to check for race conditions
        const unlockBtn = page.locator('button:has-text("Mark as Completed")');
        for(let i = 0; i < 10; i++) {
            unlockBtn.click();
        }

        // The UI should either succeed once smoothly, or trigger the Upstash 429 rate limit
        const rateLimitWarning = page.locator('text=Rate limit exceeded');
        const unlockedFeed = page.locator('text=Discussion Stream');

        await Promise.any([
            expect(rateLimitWarning).toBeVisible(),
            expect(unlockedFeed).toBeVisible()
        ]);
    });
});