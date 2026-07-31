// src/actions/progress.ts
"use server";

import { unlockChunk } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export async function markChunkAsRead(chunkId: string, roomId: string) {
    try {
        // Trigger the database upsert in our secure DAL
        await unlockChunk(chunkId);

        // Tell Next.js to clear the cache for this specific page
        revalidatePath(`/rooms/${roomId}/chunk/${chunkId}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}