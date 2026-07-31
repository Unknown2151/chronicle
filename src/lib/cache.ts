// src/lib/cache.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 15
): Promise<T> {
    try {
        const cached = await redis.get(key);
        if (cached) {
            return typeof cached === "string" ? JSON.parse(cached) : (cached as T);
        }
    } catch (err) {
        console.error("Cache read error (falling back to DB):", err);
    }

    // Fetch fresh data from database if cache misses
    const freshData = await fetcher();

    try {
        await redis.set(key, JSON.stringify(freshData), { ex: ttlSeconds });
    } catch (err) {
        console.error("Cache write error:", err);
    }

    return freshData;
}

export async function invalidateCache(keyPattern: string) {
    try {
        const keys = await redis.keys(keyPattern);
        if (keys.length > 0) {
            await redis.del(...keys);
        }
    } catch (err) {
        console.error("Cache invalidation error:", err);
    }
}