// src/app/(app)/rooms/[roomId]/page.tsx
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

type RoomOverviewPayload = Prisma.RoomGetPayload<{
    include: {
        chunks: {
            include: {
                progress: true;
            };
        };
        members: {
            include: {
                user: true;
            };
        };
    };
}>;

export default async function RoomOverviewPage({
                                                   params,
                                               }: {
    params: Promise<{ roomId: string }> | { roomId: string };
}) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;
    const currentUserId = session.user.id;

    const room: RoomOverviewPayload | null = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            members: { include: { user: true } },
            chunks: {
                orderBy: { order: 'asc' },
                include: { progress: true }
            }
        },
    });

    if (!room) notFound();

    // Timeline Progress Logic (Ensures chunks must be read in sequence)
    let previousCompleted = true;
    const timeline = room.chunks.map((chunk: RoomOverviewPayload["chunks"][0]) => {
        const isCompleted = chunk.progress.some(p => p.userId === currentUserId);
        let status = "LOCKED";

        if (isCompleted) {
            status = "COMPLETED";
            previousCompleted = true;
        } else if (previousCompleted) {
            status = "ACTIVE";
            previousCompleted = false;
        } else {
            status = "LOCKED";
        }
        return { ...chunk, status };
    });

    return (
        <div className="min-h-screen bg-[#f4f4f0] p-8 md:p-12 text-[#1c1c1c]">
            <div className="max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Left Sidebar: Timeline & Progress */}
                <div className="order-2 lg:order-1 lg:col-span-4 space-y-10">
                    <div>
                        <Link href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors inline-block mb-8">
                            ← Return to Desk
                        </Link>
                        <h2 className="font-serif font-bold text-2xl mb-6">Sync Timeline</h2>

                        <div className="space-y-0 pl-2">
                            {timeline.map((chunk, i) => {
                                const isLast = i === timeline.length - 1;
                                const isDueSoon = new Date(chunk.deadline).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000 && chunk.status === 'ACTIVE';

                                return (
                                    <div key={chunk.id} className="relative flex gap-6">
                                        {!isLast && <div className="absolute left-[11px] top-8 bottom-[-16px] w-[1px] bg-[#dcdcc8]"></div>}

                                        {/* Timeline Node */}
                                        <div className="relative shrink-0 mt-1">
                                            {chunk.status === 'COMPLETED' && (
                                                <div className="w-6 h-6 rounded-full bg-[#8b6914] flex items-center justify-center shadow-sm z-10 relative">
                                                    <span className="text-white text-xs font-bold">✓</span>
                                                </div>
                                            )}
                                            {chunk.status === 'ACTIVE' && (
                                                <div className="w-6 h-6 rounded-full bg-white border-[3px] border-[#1c1c1c] shadow-sm z-10 relative"></div>
                                            )}
                                            {chunk.status === 'LOCKED' && (
                                                <div className="w-6 h-6 rounded-full bg-[#f9f9f6] border border-[#dcdcc8] flex items-center justify-center z-10 relative" title="Complete the previous section first.">
                                                    <span className="text-[10px]">🔒</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timeline Content */}
                                        <div className={`pb-8 ${chunk.status === 'LOCKED' ? 'opacity-50' : ''}`}>
                                            {chunk.status === 'LOCKED' ? (
                                                <div
                                                    className="cursor-not-allowed"
                                                    aria-disabled="true"
                                                    aria-label={`Locked: ${chunk.title}. Complete previous sections first.`}
                                                >
                                                    <h4 className="font-serif font-bold text-lg text-[#6b6b6b]">{chunk.title}</h4>
                                                    <p className="text-xs text-[#6b6b6b] uppercase tracking-wider mt-1 font-mono">
                                                        Due {new Date(chunk.deadline).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={`/rooms/${room.id}/chunk/${chunk.id}`}
                                                    className="block group"
                                                    aria-label={`${chunk.status.toLowerCase()} chapter: ${chunk.title}. Due ${new Date(chunk.deadline).toLocaleDateString()}`}
                                                >
                                                    <h4 className={`font-serif font-bold text-lg group-hover:text-[#2d5a27] transition-colors ${chunk.status === 'COMPLETED' ? 'text-[#1c1c1c]' : 'text-[#1c1c1c]'}`}>
                                                        {chunk.title}
                                                    </h4>
                                                    <p className={`text-xs uppercase tracking-wider mt-1 font-mono ${isDueSoon ? 'text-[#991b1b] font-bold' : (chunk.status === 'COMPLETED' ? 'text-[#2d5a27]' : 'text-[#6b6b6b]')}`}>
                                                        Due {new Date(chunk.deadline).toLocaleDateString()}
                                                    </p>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Member Progress Panel */}
                    <div className="border border-[#dcdcc8] bg-white p-6 shadow-sm space-y-4">
                        <h3 className="font-serif font-bold text-lg border-b border-[#dcdcc8] pb-2">Cohort Progress</h3>
                        <div className="space-y-3">
                            {room.members.map(member => {
                                const total = room.chunks.length;
                                const completed = room.chunks.filter(c => c.progress.some(p => p.userId === member.userId)).length;
                                const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
                                return (
                                    <div key={member.id} className="space-y-1">
                                        <div className="flex justify-between text-[10px] uppercase tracking-wider text-[#6b6b6b]">
                                            <span className="font-bold text-[#1c1c1c]">{member.user?.name || member.user?.email}</span>
                                            <span>{completed} / {total}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-[#f4f4f0] overflow-hidden border border-[#dcdcc8]">
                                            <div className="h-full bg-[#2d5a27]" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Book Masthead */}
                <div className="order-1 lg:order-2 lg:col-span-8">
                    <div className="flex gap-6 border border-[#dcdcc8] bg-white p-8 shadow-sm">
                        {/* Typographic Spine */}
                        <div className="w-12 bg-[#1c1c1c] flex items-center justify-center shrink-0">
                            <span className="text-[#8b6914] font-serif uppercase tracking-[0.2em] text-xs -rotate-90 whitespace-nowrap">
                                {room.bookTitle}
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-[#1c1c1c] tracking-tight">{room.bookTitle}</h1>
                                <p className="text-lg font-serif italic text-[#6b6b6b] mt-2">by {room.author}</p>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-[#f9f9f6] border border-[#dcdcc8] text-[#1c1c1c]">
                                    Pace: {room.pace}
                                </span>
                                {room.moods?.map((mood: string) => (
                                    <span key={mood} className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-[#f9f9f6] border border-[#dcdcc8] text-[#6b6b6b]">
                                        {mood}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm font-serif leading-relaxed text-[#1c1c1c] max-w-2xl pt-2">
                                {room.description || "No description provided for this study circle."}
                            </p>

                            {room.adminId === currentUserId && (
                                <Link href={`/rooms/${room.id}/settings`} className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#8b6914] border-b border-[#8b6914] hover:text-[#1c1c1c] transition-colors mt-4">
                                    Configure Room Settings →
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}