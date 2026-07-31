// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(1),
    AUTH_URL: z.string().url().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    // Upstash configuration (optional for local dev unless rate-limiting is active)
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// This will parse process.env and throw a descriptive error if required keys are missing
export const env = envSchema.parse(process.env);