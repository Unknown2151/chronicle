// src/actions/comments.ts
"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {invalidateCache} from "@/lib/cache";
import {prisma} from "@/lib/db";


export async function createComment(
    postId: string,
    chunkId: string,
    roomId: string,
    formData: FormData // <-- Moved to the end
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const content = formData.get("content") as string;
    if (!content || content.trim().length === 0) return;

    await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: session.user.id,
        },
    });
    await invalidateCache(`chunk:${chunkId}:discussions`);
    revalidatePath(`/rooms/${roomId}/chunk/${chunkId}`);
}