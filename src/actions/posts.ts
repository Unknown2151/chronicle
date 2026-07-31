// src/actions/posts.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/cache";

export async function publishPost(chunkId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) return;

    const bodyText = formData.get("body") as string;
    const isQuote = formData.get("isQuote") === "true";
    if (!bodyText || !bodyText.trim()) return;

    try {
        await prisma.post.create({
            data: {
                content: bodyText,
                isQuote,
                chunk: { connect: { id: chunkId } },
                author: { connect: { id: session.user.id } },
            },
        });
        await invalidateCache(`chunk:${chunkId}:discussions`);
    } catch (err) {
        console.error("Error creating post:", err);
    }

    revalidatePath(`/rooms`);
}

export async function markChunkComplete(chunkId: string) {
    const session = await auth();
    if (!session?.user?.id) return;

    try {
        await prisma.userProgress.create({
            data: { chunkId, userId: session.user.id },
        });
    } catch (err) {
        // Ignored if already completed
        console.error("Milestone already unlocked:", err);
    }

    revalidatePath(`/rooms`);
}