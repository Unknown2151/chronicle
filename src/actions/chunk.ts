// src/actions/chunk.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createChunkSchema = z.object({
    roomId: z.string(),
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    deadline: z.string().transform((str) => new Date(str)),
});

export async function createChunk(formData: FormData) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    const validatedData = createChunkSchema.parse({
        roomId: formData.get("roomId"),
        title: formData.get("title"),
        deadline: formData.get("deadline"),
    });

    // 1. Verify Authorization: Only ADMINs can create chunks
    const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId: validatedData.roomId } },
    });

    if (!membership || membership.role !== "ADMIN") {
        throw new Error("Only administrators can create chunks.");
    }

    // 2. Determine the next sequence order to prevent gaps (Section 5.3)
    const latestChunk = await prisma.chunk.findFirst({
        where: { roomId: validatedData.roomId },
        orderBy: { order: "desc" },
    });

    const nextOrder = latestChunk ? latestChunk.order + 1 : 1;

    // 3. Insert the Chunk
    await prisma.chunk.create({
        data: {
            roomId: validatedData.roomId,
            title: validatedData.title,
            deadline: validatedData.deadline,
            order: nextOrder,
        },
    });

    revalidatePath(`/rooms/${validatedData.roomId}`);
}