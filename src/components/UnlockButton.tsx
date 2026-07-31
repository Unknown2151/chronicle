// src/components/UnlockButton.tsx
"use client";

import { useTransition } from "react";
import { markChunkAsRead } from "@/actions/progress";

export function UnlockButton({chunkId, roomId}: { chunkId: string, roomId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleUnlock = () => {
        startTransition(async () => {
            await markChunkAsRead(chunkId, roomId);

            // Programmatically shift focus to the discussion feed once unlocked
            // so screen readers immediately start reading the newly revealed content.
            setTimeout(() => {
                const discussionHeader = document.getElementById("discussion-stream-header");
                if (discussionHeader) {
                    discussionHeader.focus();
                }
            }, 100);
        });
    };

    return (
        <button
            onClick={handleUnlock}
            disabled={isPending}
            aria-live="polite"
            className="mt-8 px-8 py-4 bg-[#1c1c1c] text-[#f4f4f0] font-medium text-lg hover:bg-[#2d5a27] disabled:opacity-50 transition-all shadow-sm"
        >
            {isPending ? "Unlocking Discussion..." : "I have finished this section. Unlock the discussion."}
        </button>
    );
}