// tests/integration/progress.test.ts
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

// 1. Mock React's `cache` so it acts as a pass-through in Node
vi.mock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    return {
        ...actual,
        cache: (fn: any) => fn,
    };
});

// 2. Mock Auth so Vitest doesn't stumble on Next.js server internals
vi.mock("@/lib/auth", () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: "test-user-id" } }),
}));

import { PrismaClient } from "@prisma/client";
import { unlockChunk, assertChunkUnlocked, SpoilerGateError } from "@/lib/dal";

const prisma = new PrismaClient();

describe("Progress & Spoiler Gate Integration", () => {
    let testUser: any;
    let testRoom: any;
    let testChunk: any;

    beforeAll(async () => {
        testUser = await prisma.user.upsert({
            where: { email: "integration-test@chronicle.app" },
            update: {},
            create: { email: "integration-test@chronicle.app", name: "Test User" },
        });

        testRoom = await prisma.room.create({
            data: {
                title: "Integration Test Room",
                bookTitle: "Test Book",
                author: "Test Author",
                adminId: testUser.id,
            },
        });

        await prisma.roomMember.create({
            data: {
                userId: testUser.id,
                roomId: testRoom.id,
                role: "MEMBER",
            },
        });

        testChunk = await prisma.chunk.create({
            data: {
                roomId: testRoom.id,
                title: "Test Chunk 1",
                deadline: new Date(Date.now() + 86400000),
                order: 1,
            },
        });
    });

    afterAll(async () => {
        await prisma.room.delete({ where: { id: testRoom.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
        await prisma.$disconnect();
    });

    it("throws SpoilerGateError when progress does not exist", async () => {
        await expect(assertChunkUnlocked(testUser.id, testChunk.id)).rejects.toThrow(SpoilerGateError);
    });

    it("successfully unlocks chunk and passes spoiler gate", async () => {
        await prisma.userProgress.upsert({
            where: { userId_chunkId: { userId: testUser.id, chunkId: testChunk.id } },
            create: { userId: testUser.id, chunkId: testChunk.id },
            update: {},
        });

        await expect(assertChunkUnlocked(testUser.id, testChunk.id)).resolves.not.toThrow();
    });
});