// src/lib/queue.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export type JobType = "GENERATE_CHUNK_SUMMARY" | "SEND_WEEKLY_DIGEST";

interface JobPayload {
    id: string;
    type: JobType;
    data: Record<string, any>;
    attempts: number;
    createdAt: string;
}

export async function enqueueJob(type: JobType, data: Record<string, any>) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: JobPayload = {
        id: jobId,
        type,
        data,
        attempts: 0,
        createdAt: new Date().toISOString(),
    };

    // Push to a Redis queue list
    await redis.lpush("chronicle:job_queue", JSON.stringify(job));
    return jobId;
}