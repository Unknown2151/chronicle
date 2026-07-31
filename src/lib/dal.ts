// src/lib/dal.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cache } from "react";


// ─── Custom Security Errors ──────────────────────────────────────────────────
export class AuthenticationError extends Error {
    constructor() { super("Authentication required"); this.name = "AuthenticationError"; }
}
export class AuthorizationError extends Error {
    constructor(message = "Not authorized") { super(message); this.name = "AuthorizationError"; }
}
export class SpoilerGateError extends Error {
    constructor() {
        super("Spoiler Protection: You must mark this section as read to view discussions.");
        this.name = "SpoilerGateError";
    }
}
export class NotFoundError extends Error {
    constructor(resource: string) { super(`${resource} not found`); this.name = "NotFoundError"; }
}

// ─── Security Checks ─────────────────────────────────────────────────────────

export async function assertRoomMembership(userId: string, roomId: string) {
    const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId } },
        select: { role: true },
    });
    if (!membership) throw new AuthorizationError("You are not a member of this room.");
    return membership;
}

export async function assertChunkUnlocked(userId: string, chunkId: string) {
    const progress = await prisma.userProgress.findUnique({
        where: { userId_chunkId: { userId, chunkId } },
        select: { id: true },
    });
    // THIS IS THE LOCK: If no progress record exists, throw the error and abort the request.
    if (!progress) throw new SpoilerGateError();
}

// ─── Data Mutations ──────────────────────────────────────────────────────────

export async function unlockChunk(chunkId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new AuthenticationError();

    const chunk = await prisma.chunk.findUnique({
        where: { id: chunkId },
        select: { id: true, roomId: true },
    });
    if (!chunk) throw new NotFoundError("Chunk");

    // Prevent users from unlocking chunks for rooms they aren't in
    await assertRoomMembership(session.user.id, chunk.roomId);

    // Upsert is idempotent — if they double-click "Unlock", it just ignores it rather than crashing
    const progress = await prisma.userProgress.upsert({
        where: { userId_chunkId: { userId: session.user.id, chunkId } },
        create: { userId: session.user.id, chunkId },
        update: {},
        select: { unlockedAt: true },
    });

    return progress;
}

// ─── Data Fetching (GATED) ───────────────────────────────────────────────────

// We use React's `cache` so calling this multiple times in one render only hits the DB once
export const getChunkDiscussions = cache(async (chunkId: string) => {
    const session = await auth();
    if (!session?.user?.id) throw new AuthenticationError();

    const chunk = await prisma.chunk.findUnique({
        where: { id: chunkId },
        select: { id: true, roomId: true },
    });
    if (!chunk) throw new NotFoundError("Chunk");

    const membership = await assertRoomMembership(session.user.id, chunk.roomId);

    // Admins and moderators bypass the spoiler gate because they have to moderate the chat
    const isModerator = ["ADMIN", "MODERATOR"].includes(membership.role);

    if (!isModerator) {
        // 🔥 THE GATEKEEPER 🔥
        await assertChunkUnlocked(session.user.id, chunkId);
    }

    // If the code reaches this line, the user is authorized and spoiler-free.
    return prisma.post.findMany({
        where: {
            chunkId,
            deletedAt: null,
        },
        include: {
            author: { select: { id: true, name: true, email: true, avatarUrl: true } },
            reactions: { select: { userId: true, emoji: true } },
            comments: {
                where: { deletedAt: null },
                include: {
                    author: { select: { id: true, name: true, email: true, avatarUrl: true } },
                    reactions: { select: { userId: true, emoji: true } },
                },
                orderBy: { createdAt: "asc" }, // Oldest comments first
            },
        },
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" }, // Newest posts first
        ],
    });
});

export const getRoomTimeline = cache(async (roomId: string) => {
    const session = await auth();
    if (!session?.user?.id) throw new AuthenticationError();

    // 1. Verify they are in the room
    const membership = await assertRoomMembership(session.user.id, roomId);

    // 2. Fetch the room, ordered chunks, and the user's specific progress
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            chunks: {
                orderBy: { order: 'asc' },
                include: {
                    // Only fetch progress for the CURRENT logged-in user
                    progress: {
                        where: { userId: session.user.id }
                    }
                }
            }
        }
    });

    if (!room) throw new NotFoundError("Room");

    return { room, role: membership.role };
});


export const getRoomSchedule = cache(async (roomId: string) => {
    const session = await auth();
    if (!session?.user?.id) throw new AuthenticationError();

    // Ensure they are actually in the room before showing the schedule
    await assertRoomMembership(session.user.id, roomId);

    return prisma.chunk.findMany({
        where: { roomId },
        orderBy: { order: "asc" }, // Ensures the timeline is in chronological order
        include: {
            // Include the specific user's progress so the UI knows
            // which chunks to render as "Locked" vs "Completed"
            progress: {
                where: { userId: session.user.id },
                select: { unlockedAt: true }
            }
        }
    });
});

// Add this to your DAL exports
export async function assertRoomAdmin(userId: string, roomId: string) {
    const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId } },
    });

    if (!membership || membership.role !== "ADMIN") {
        throw new Error("Forbidden: Admin access required.");
    }

    return membership;
}