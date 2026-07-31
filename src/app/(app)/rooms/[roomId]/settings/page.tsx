// src/app/(app)/rooms/[roomId]/settings/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { assertRoomMembership } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Server action to update room configuration
async function updateRoomSettings(roomId: string, formData: FormData) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const membership = await assertRoomMembership(session.user.id, roomId);
    if (membership.role !== "ADMIN") throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const pace = formData.get("pace") as any;
    const isPublic = formData.get("isPublic") === "on";

    await prisma.room.update({
        where: { id: roomId },
        data: {
            title,
            description,
            pace,
            isPublic,
        },
    });

    revalidatePath(`/rooms/${roomId}/settings`);
    revalidatePath(`/rooms/${roomId}`);
}

// Server action to archive room
async function archiveRoom(roomId: string) {
    "use server";
    const session = await auth();
    if (!session?.user?.id) return;

    const membership = await assertRoomMembership(session.user.id, roomId);
    if (membership.role !== "ADMIN") throw new Error("Unauthorized");

    await prisma.room.update({
        where: { id: roomId },
        data: { isArchived: true },
    });

    redirect("/dashboard");
}

export default async function RoomSettingsPage({
                                                   params,
                                               }: {
    params: Promise<{ roomId: string }> | { roomId: string };
}) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;

    const membership = await assertRoomMembership(session.user.id, roomId);
    if (membership.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-[#f4f4f0] p-12 text-center space-y-4">
                <h1 className="text-2xl font-serif font-bold text-[#991b1b]">Access Denied</h1>
                <p className="text-xs text-[#6b6b6b] max-w-sm mx-auto leading-relaxed">
                    Only designated room administrators can access settings and roster management.
                </p>
                <div>
                    <Link
                        href={`/rooms/${roomId}`}
                        className="inline-block bg-[#1c1c1c] text-[#f4f4f0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all"
                    >
                        Return to Room Overview
                    </Link>
                </div>
            </div>
        );
    }

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            members: {
                include: { user: true },
                orderBy: { joinedAt: "asc" },
            },
        },
    });

    if (!room) notFound();

    return (
        <div className="min-h-screen bg-[#f4f4f0] p-8 md:p-12 text-[#1c1c1c]">
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header */}
                <div className="border-b border-[#dcdcc8] pb-6">
                    <Link
                        href={`/rooms/${roomId}`}
                        className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors inline-block mb-2"
                    >
                        ← Back to Room Overview
                    </Link>
                    <h1 className="text-3xl font-serif font-extrabold tracking-tight">Room Settings & Roster</h1>
                    <p className="text-xs text-[#6b6b6b] mt-1 uppercase tracking-wider">
                        Manage configurations and participants for {room.bookTitle} by {room.author}.
                    </p>
                </div>

                {/* Configuration Settings Form */}
                <div className="border border-[#dcdcc8] bg-white p-8 shadow-sm space-y-6">
                    <h2 className="font-serif font-bold text-xl border-b border-[#dcdcc8] pb-4">Room Configuration</h2>

                    <form action={updateRoomSettings.bind(null, roomId)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">
                                Room Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                defaultValue={room.title}
                                required
                                className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">
                                Description & Focus
                            </label>
                            <textarea
                                name="description"
                                rows={3}
                                defaultValue={room.description || ""}
                                placeholder="Describe the focus or guidelines of this reading circle..."
                                className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">
                                    Reading Pace
                                </label>
                                <select
                                    name="pace"
                                    defaultValue={room.pace}
                                    className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]"
                                >
                                    <option value="SLOW">Slow</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="FAST">Fast</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-3 pt-6">
                                <input
                                    type="checkbox"
                                    name="isPublic"
                                    defaultChecked={room.isPublic}
                                    id="isPublicToggle"
                                    className="w-4 h-4 accent-[#2d5a27]"
                                />
                                <label htmlFor="isPublicToggle" className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c] cursor-pointer">
                                    Make Room Public
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#dcdcc8] flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#1c1c1c] text-[#f4f4f0] px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>

                {/* Active Roster Section */}
                <div className="border border-[#dcdcc8] bg-white p-8 shadow-sm space-y-6">
                    <div className="border-b border-[#dcdcc8] pb-4 flex items-center justify-between">
                        <h2 className="font-serif font-bold text-xl">Active Roster</h2>
                        <span className="text-xs text-[#6b6b6b]">
                            {room.members.length} {room.members.length === 1 ? 'Reader' : 'Readers'} Enrolled
                        </span>
                    </div>

                    <div className="space-y-4">
                        {room.members.map((member: any) => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-[#f9f9f6] border border-[#dcdcc8]">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-serif font-bold text-[#1c1c1c]">
                                        {member.user?.name || member.user?.email || "Unknown Reader"}
                                    </p>
                                    <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wider">
                                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border ${
                                    member.role === 'ADMIN'
                                        ? 'bg-[#2d5a27]/10 text-[#2d5a27] border-[#2d5a27]/25'
                                        : 'bg-white text-[#6b6b6b] border-[#dcdcc8]'
                                }`}>
                                    {member.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Room Identifier & Lifecycle Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-[#dcdcc8] bg-white p-8 shadow-sm space-y-4">
                        <h2 className="font-serif font-bold text-lg text-[#1c1c1c]">Reference Identifier</h2>
                        <p className="text-xs text-[#6b6b6b] leading-relaxed">
                            Share this unique reference string with peers to connect directly to this study room.
                        </p>
                        <div className="p-3 bg-[#f9f9f6] border border-[#dcdcc8] flex items-center justify-between font-mono">
                            <span className="text-xs text-[#1c1c1c]">{room.id}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b6b6b] font-sans">System ID</span>
                        </div>
                    </div>

                    <div className="border border-[#dcdcc8] bg-white p-8 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                            <h2 className="font-serif font-bold text-lg text-[#991b1b]">Archive Room</h2>
                            <p className="text-xs text-[#6b6b6b] leading-relaxed mt-1">
                                Archiving locks the room from further posts and hides it from active desks.
                            </p>
                        </div>
                        <form action={archiveRoom.bind(null, roomId)}>
                            <button
                                type="submit"
                                className="w-full bg-[#991b1b] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
                            >
                                Archive Study Circle
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}