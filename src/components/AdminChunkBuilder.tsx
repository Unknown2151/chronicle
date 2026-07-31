// src/components/AdminChunkBuilder.tsx
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createChunk(roomId: string, formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadlineStr = formData.get("deadline") as string;
    const orderStr = formData.get("order") as string;

    if (!title || !deadlineStr) return;

    try {
        await prisma.chunk.create({
            data: {
                roomId,
                title,
                description: description || null,
                deadline: new Date(deadlineStr),
                order: orderStr ? parseInt(orderStr, 10) : 1,
            },
        });
    } catch (err) {
        console.error("Error creating chunk:", err);
    }

    revalidatePath(`/rooms/${roomId}`);
}

export default function AdminChunkBuilder({ roomId }: { roomId: string }) {
    return (
        <form action={createChunk.bind(null, roomId)} className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">Add Reading Chunk</h4>

            <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-[#6b6b6b]">Chunk Title</label>
                <input
                    type="text"
                    name="title"
                    required
                    placeholder="e.g., Chapters 1–5"
                    className="w-full border border-[#dcdcc8] p-2 text-xs bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                />
            </div>

            <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-[#6b6b6b]">Reading Content / Text</label>
                <textarea
                    name="description"
                    rows={2}
                    placeholder="Paste excerpt or reading guidelines..."
                    className="w-full border border-[#dcdcc8] p-2 text-xs bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-[#6b6b6b]">Deadline</label>
                    <input
                        type="date"
                        name="deadline"
                        required
                        className="w-full border border-[#dcdcc8] p-2 text-xs bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-[9px] uppercase tracking-wider text-[#6b6b6b]">Sequence Order</label>
                    <input
                        type="number"
                        name="order"
                        defaultValue={1}
                        required
                        className="w-full border border-[#dcdcc8] p-2 text-xs bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                    />
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-[#1c1c1c] text-[#f4f4f0] py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-colors"
            >
                Schedule Milestone +
            </button>
        </form>
    );
}