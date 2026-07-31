// src/actions/moderation.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { invalidateCache } from "@/lib/cache";

export async function deletePost(postId: string, roomId: string, chunkId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error("Post not found");

    const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId } }
    });

    // RBAC: Can delete if they are the author, or if they are an ADMIN/MODERATOR
    const isAuthor = post.authorId === userId;
    const isPrivileged = membership?.role === "ADMIN" || membership?.role === "MODERATOR";

    if (!isAuthor && !isPrivileged) {
        throw new Error("You do not have permission to delete this post.");
    }

    await prisma.post.delete({ where: { id: postId } });
    await invalidateCache(`chunk:${chunkId}:discussions`);
    revalidatePath(`/rooms/${roomId}/chunk/${chunkId}`);
}

// (Optional for now, but good to stub out based on the spec)
export async function pinPost(postId: string, roomId: string, chunkId: string) {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    const membership = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId } }
    });

    // RBAC: Only ADMIN or MODERATOR can pin
    if (membership?.role !== "ADMIN" && membership?.role !== "MODERATOR") {
        throw new Error("Only administrators and moderators can pin posts.");
    }

    // Toggle the pin status (assuming an isPinned boolean on the Post model,
    // if not in schema yet, we can omit this or update schema later)
    // await prisma.post.update({ where: { id: postId }, data: { isPinned: true } });

    revalidatePath(`/rooms/${roomId}/chunk/${chunkId}`);
}