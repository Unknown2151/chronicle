// src/actions/reactions.ts
"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { ALLOWED_REACTIONS, AllowedReaction } from "@/lib/constants";
import {invalidateCache} from "@/lib/cache";
import {prisma} from "@/lib/db";


export async function toggleReaction(
    postId: string | undefined,
    commentId: string | undefined,
    emoji: AllowedReaction,
    chunkId: string,
    roomId: string
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    if (!ALLOWED_REACTIONS.includes(emoji)) {
        throw new Error("Invalid emoji reaction");
    }

    // Check if this reaction already exists by this user
    const existing = await prisma.reaction.findFirst({
        where: {
            userId: session.user.id,
            emoji,
            postId: postId || null,
            commentId: commentId || null,
        },
    });

    if (existing) {
        // If it exists, remove it (toggle off)
        await prisma.reaction.delete({
            where: { id: existing.id },
        });
    } else {
        // If it doesn't exist, create it (toggle on)
        await prisma.reaction.create({
            data: {
                userId: session.user.id,
                emoji,
                postId: postId || null,
                commentId: commentId || null,
            },
        });
    }
    await invalidateCache(`chunk:${chunkId}:discussions`);
    revalidatePath(`/rooms/${roomId}/chunk/${chunkId}`);
}