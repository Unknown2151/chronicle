// src/middleware.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Initialize NextAuth with the Edge-compatible config
const { auth } = NextAuth(authConfig);

// 2. Initialize Upstash Redis client
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// 3. Configure the Rate Limiter (20 requests per 10 seconds)
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, "10 s"),
    analytics: true,
    prefix: "chronicle_ratelimit",
});

// Wrap the middleware with auth() to easily access the session via req.auth
export default auth(async (req) => {
    const pathname = req.nextUrl.pathname;

    // ==========================================
    // LAYER 1: EDGE RATE LIMITING
    // ==========================================
    // Only apply rate limiting to data-heavy or mutation routes
    if (pathname.startsWith("/api") || pathname.startsWith("/rooms")) {
        const ip = req.ip ?? "127.0.0.1";

        try {
            const { success, limit, remaining, reset } = await ratelimit.limit(ip);

            if (!success) {
                return new NextResponse(
                    JSON.stringify({
                        error: "Rate limit exceeded.",
                        message: "The reading desk is currently overloaded. Please pause for a moment."
                    }),
                    {
                        status: 429,
                        headers: {
                            "Content-Type": "application/json",
                            "X-RateLimit-Limit": limit.toString(),
                            "X-RateLimit-Remaining": remaining.toString(),
                            "X-RateLimit-Reset": reset.toString()
                        }
                    }
                );
            }
        } catch (err) {
            // Distributed Systems Principle: "Fail Open"
            // If Upstash Redis temporarily goes down, log the error but allow
            // the request through so the application doesn't suffer a total outage.
            console.error("Rate limiting edge error:", err);
        }
    }

    // ==========================================
    // LAYER 2: AUTHENTICATION & ROUTING LOGIC
    // ==========================================
    const isLoggedIn = !!req.auth;
    const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/verify");
    const isProtectedRoute = pathname.startsWith("/dashboard") ||
        pathname.startsWith("/rooms") ||
        pathname.startsWith("/vault");

    // Redirect unauthenticated users trying to access protected routes
    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }

    // Redirect authenticated users away from auth pages (login/verify) to their dashboard
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }

    return NextResponse.next();
});

// 4. Configure the Matcher
export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/rooms/:path*",
        "/vault/:path*",
        "/login",
        "/verify",
        // Apply middleware to everything EXCEPT static files and Next.js internals
        "/((?!_next/static|_next/image|favicon.ico).*)"
    ],
};