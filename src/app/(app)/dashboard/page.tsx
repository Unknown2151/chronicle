// src/app/(app)/dashboard/page.tsx
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EmptyDesk from "./EmptyDesk";

// 1. Define the exact shape of the membership data we are fetching
type MembershipWithRoom = Prisma.RoomMemberGetPayload<{
    include: {
        room: {
            include: {
                chunks: true;
                members: true;
            };
        };
    };
}>;

// 2. Define the shape of the flattened room object for our JSX
type DashboardRoom = MembershipWithRoom["room"] & { role: string };

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Fetch rooms where the user is a member
    const memberships = await prisma.roomMember.findMany({
        where: { userId: session.user.id },
        include: {
            room: {
                include: {
                    chunks: true,
                    members: true,
                },
            },
        },
        orderBy: { joinedAt: "desc" },
    });

    // 3. Apply the type to 'm'
    const rooms: DashboardRoom[] = memberships.map((m: MembershipWithRoom) => ({
        ...m.room,
        role: m.role,
    }));

    return (
        <div className="min-h-screen bg-[#f4f4f0] p-8 md:p-12 text-[#1c1c1c]">
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#dcdcc8] pb-6 gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] mb-1">Reader Desk</p>
                        <h1 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight">Active Library</h1>
                    </div>
                    <div>
                        <Link
                            href="/rooms/new"
                            className="inline-block bg-[#1c1c1c] text-[#f4f4f0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all shadow-sm"
                        >
                            + Initialize Room
                        </Link>
                    </div>
                </div>

                {/* Room Grid / Empty State */}
                {rooms.length === 0 ? (
                    <EmptyDesk />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 4. Apply the type to 'room' */}
                        {rooms.map((room: DashboardRoom) => (
                            <Link
                                key={room.id}
                                href={`/rooms/${room.id}`}
                                className="group border border-[#dcdcc8] bg-white p-6 hover:border-[#1c1c1c] transition-all shadow-sm flex flex-col justify-between relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-2 h-full bg-[#f9f9f6] group-hover:bg-[#2d5a27] transition-colors"></div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#f9f9f6] border border-[#dcdcc8] text-[#6b6b6b]">
                                          {room.role}
                                        </span>
                                        <span className="text-xs text-[#6b6b6b]">
                                          {room.members.length} {room.members.length === 1 ? 'Reader' : 'Readers'}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="font-serif font-bold text-xl text-[#1c1c1c] group-hover:text-[#2d5a27] transition-colors">
                                            {room.title}
                                        </h2>
                                        <p className="text-xs text-[#6b6b6b] mt-0.5">By {room.author}</p>
                                    </div>

                                    <p className="text-sm text-[#6b6b6b] line-clamp-2 leading-relaxed pt-2">
                                        {room.description || "No description provided for this study room."}
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-[#dcdcc8] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1c1c1c]">
                                    <span>{room.chunks.length} Chapters Scheduled</span>
                                    <span className="group-hover:translate-x-1 transition-transform">Enter Room →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}