// src/app/(app)/rooms/new/page.tsx
import { auth } from "@/lib/auth";
import Link from "next/link";
import { createRoom } from "@/actions/room";

export default async function NewRoomPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return (
        <div className="min-h-screen bg-[#f4f4f0] p-8 md:p-12 text-[#1c1c1c]">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div className="border-b border-[#dcdcc8] pb-6">
                    <Link
                        href="/dashboard"
                        className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors inline-block mb-2"
                    >
                        ← Return to Desk
                    </Link>
                    <h1 className="text-3xl font-serif font-extrabold tracking-tight">Initialize Reading Room</h1>
                    <p className="text-xs text-[#6b6b6b] mt-1 uppercase tracking-wider">Create a synchronized study space for a book or manuscript.</p>
                </div>

                {/* Form */}
                <form action={createRoom} className="border border-[#dcdcc8] bg-white p-8 shadow-sm space-y-6">

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">
                            Room Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="e.g., Gothic Literature Circle"
                            className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">
                            Book Title
                        </label>
                        <input
                            type="text"
                            name="bookTitle"
                            required
                            placeholder="e.g., Frankenstein"
                            className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">
                            Author
                        </label>
                        <input
                            type="text"
                            name="author"
                            required
                            placeholder="e.g., Mary Shelley"
                            className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                        />
                    </div>

                    <div className="pt-4 border-t border-[#dcdcc8] flex justify-end">
                        <button
                            type="submit"
                            className="bg-[#1c1c1c] text-[#f4f4f0] px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all shadow-sm"
                        >
                            Create & Initialize Room →
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}