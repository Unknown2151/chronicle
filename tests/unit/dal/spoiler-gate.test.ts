// tests/unit/dal/spoiler-gate.test.ts
import { describe, it, expect, vi } from "vitest";

// 1. Mock React's `cache` so it acts as a pass-through in Node
vi.mock("react", async () => {
    const actual = await vi.importActual<typeof import("react")>("react");
    return {
        ...actual,
        cache: (fn: any) => fn,
    };
});

// 2. Mock Auth and Prisma
vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
    prisma: {
        userProgress: {
            findUnique: vi.fn(),
        },
        roomMember: {
            findUnique: vi.fn(),
        },
    },
}));

import {
    SpoilerGateError,
    AuthorizationError,
    assertChunkUnlocked,
    assertRoomMembership
} from "@/lib/dal";
import { prisma } from "@/lib/prisma";

describe("Zero-Trust Spoiler Gate & Authorization", () => {

    it("throws SpoilerGateError when UserProgress record is absent", async () => {
        vi.mocked(prisma.userProgress.findUnique).mockResolvedValueOnce(null);

        await expect(assertChunkUnlocked("user-1", "chunk-1")).rejects.toThrow(SpoilerGateError);
    });

    it("passes silently when UserProgress record exists", async () => {
        vi.mocked(prisma.userProgress.findUnique).mockResolvedValueOnce({ id: "progress-1" } as any);

        await expect(assertChunkUnlocked("user-1", "chunk-1")).resolves.not.toThrow();
    });

    it("throws AuthorizationError when user is not a member of the room", async () => {
        vi.mocked(prisma.roomMember.findUnique).mockResolvedValueOnce(null);

        await expect(assertRoomMembership("user-1", "room-1")).rejects.toThrow(AuthorizationError);
    });

    it("returns membership role when user belongs to the room", async () => {
        vi.mocked(prisma.roomMember.findUnique).mockResolvedValueOnce({ role: "MEMBER" } as any);

        const membership = await assertRoomMembership("user-1", "room-1");
        expect(membership.role).toBe("MEMBER");
    });

});