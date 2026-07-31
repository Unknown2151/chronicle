// src/lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";
// import Resend from "next-auth/providers/resend";

export const authConfig = {
    providers: [
        // Resend({
        //     apiKey: "mock-key", // Bypassed in dev
        //     from: "noreply@chronicle.app",
        //     sendVerificationRequest({ identifier, url }) {
        //         // MOCK EMAIL PROVIDER: Logs the magic link to terminal
        //         console.log("\n=======================================================");
        //         console.log(`📧 MAGIC LOGIN LINK FOR: ${identifier}`);
        //         console.log(`🔗 CLICK HERE: ${url}`);
        //         console.log("=======================================================\n");
        //     },
        // }),
    ],
    pages: {
        signIn: "/login",
        verifyRequest: "/verify",
    },
} satisfies NextAuthConfig;