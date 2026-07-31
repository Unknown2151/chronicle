// src/actions/room.ts
"use server";

import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

const createRoomSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must not exceed 100 characters"),
    bookTitle: z.string().min(1, "Book title is required"),
    author: z.string().min(1, "Author is required"),
});

export async function createRoom(formData: FormData) {
    const session = await auth();

    // 1. Extract the ID to a flat constant before the transaction
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    const validatedData = createRoomSchema.parse({
        title: formData.get("title"),
        bookTitle: formData.get("bookTitle"),
        author: formData.get("author"),
    });

    const room = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const newRoom = await tx.room.create({
            data: {
                title: validatedData.title,
                bookTitle: validatedData.bookTitle,
                author: validatedData.author,

                // 2. Pass the extracted string constant directly
                adminId: userId,
            },
        });

        await tx.roomMember.create({
            data: {
                userId: userId,
                roomId: newRoom.id,
                role: "ADMIN",
            },
        });

        return newRoom;
    });

    redirect(`/rooms/${room.id}`);
}