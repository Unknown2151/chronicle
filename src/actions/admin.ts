// src/actions/admin.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function removeMember(targetUserId: string, roomId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Verify Admin authorization
    const adminCheck = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: session.user.id, roomId } }
    });

    if (adminCheck?.role !== "ADMIN") throw new Error("Forbidden");
    if (targetUserId === session.user.id) throw new Error("Cannot remove yourself");

    // We strictly delete the RoomMember record.
    // UserProgress records will survive intact per the schema architecture.
    await prisma.roomMember.delete({
        where: { userId_roomId: { userId: targetUserId, roomId } }
    });

    revalidatePath(`/rooms/${roomId}/settings`);
}

export async function swapChunkOrder(
    chunkAId: string,
    chunkBId: string,
    roomId: string,
    orderA: number,
    orderB: number
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const adminCheck = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId: session.user.id, roomId } }
    });

    if (adminCheck?.role !== "ADMIN") throw new Error("Forbidden");

    // The critical Atomic Transaction with the 999 temporary placeholder
    // This safely bypasses the @@unique([roomId, order]) constraint in Postgres
    await prisma.$transaction([
        prisma.chunk.update({ where: { id: chunkAId }, data: { order: 999 } }),
        prisma.chunk.update({ where: { id: chunkBId }, data: { order: orderA } }),
        prisma.chunk.update({ where: { id: chunkAId }, data: { order: orderB } }),
    ]);

    revalidatePath(`/rooms/${roomId}/settings`);
    revalidatePath(`/rooms/${roomId}`);
}