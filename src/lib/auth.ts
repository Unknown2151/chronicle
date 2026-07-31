// src/lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "./auth.config";
import Resend from "next-auth/providers/resend";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        Resend({
            apiKey: "mock-key",
            from: "noreply@chronicle.app",
            sendVerificationRequest({ identifier, url }) {
                console.log("\n=======================================================");
                console.log(`📧 MAGIC LOGIN LINK FOR: ${identifier}`);
                console.log(`🔗 CLICK HERE: ${url}`);
                console.log("=======================================================\n");
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },
    },
});