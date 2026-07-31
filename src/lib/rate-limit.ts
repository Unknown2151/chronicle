// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { RATE_LIMITS } from "./constants";

export class RateLimitError extends Error {
    constructor(public resetAt: Date) {
        super("Too many requests. Please slow down.");
        this.name = "RateLimitError";
    }
}

// Helper to initialize Upstash ratelimit or fallback gracefully for local dev
function getRatelimiter(requests: number, window: string) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        // Graceful fallback mock for local development if Upstash keys are not yet in .env
        return {
            limit: async () => ({ success: true, limit: 100, remaining: 99, reset: Date.now() + 60000 }),
        };
    }

    return new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(requests, window as any),
        analytics: true,
        prefix: "chronicle_ratelimit",
    });
}

/**
 * Enforces rate limits using userId as the key.
 * Throws RateLimitError if quota is exceeded.
 */
export async function checkRateLimit(userId: string, actionType: keyof typeof RATE_LIMITS) {
    const config = RATE_LIMITS[actionType];
    const limiter = getRatelimiter(config.requests, config.window);

    const { success, reset } = await limiter.limit(`${String(actionType)}:${userId}`);
    if (!success) {
        throw new RateLimitError(new Date(reset));
    }
}