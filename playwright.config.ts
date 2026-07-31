import { defineConfig } from '@playwright/test';

export default defineConfig({
    use: {
        // Set this to your Vercel deployment URL during tests
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    },
});