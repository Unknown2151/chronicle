// tests/e2e/spoiler-gate.spec.ts
import { test, expect } from "@playwright/test";

const lockedChunkId = "cms0aa1dc000mpw0d626c8eqw"; // Chapters 11–16 from seed data

test("API returns 403 with SPOILER_GATE code for locked chunk without progress", async ({ request }) => {
    const res = await request.get(`/api/chunks/${lockedChunkId}/posts`);

    // Unauthenticated requests should return 401 Unauthorized
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHENTICATED");
});

test("user cannot access locked chunk discussion via direct URL in browser", async ({ page }) => {
    // Log in as reader1 first or navigate directly
    await page.goto(`/rooms/seed-room-1/chunk/${lockedChunkId}`);

    // Should be blocked by the Spoiler Gate UI
    await expect(page.getByText("Spoiler Protection Active")).toBeVisible();
    await expect(page.locator("article")).not.toBeVisible();
});

test("after marking as read, user can see the discussion", async ({ page }) => {
    await page.goto(`/rooms/seed-room-1/chunk/${lockedChunkId}`);

    // Click unlock
    await page.getByRole("button", { name: "I have finished this section. Unlock the discussion." }).click();

    // Feed should now be visible
    await expect(page.getByText("The room is quiet. Be the first to share your thoughts.")).toBeVisible();
});