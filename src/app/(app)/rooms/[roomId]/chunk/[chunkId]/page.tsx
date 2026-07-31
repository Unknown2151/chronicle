// src/app/(app)/rooms/[roomId]/chunk/[chunkId]/page.tsx
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createComment } from "@/actions/comments";
import { toggleReaction } from "@/actions/reactions";
import { markChunkComplete } from "@/actions/posts";
import { getCachedData } from "@/lib/cache";
import { ALLOWED_REACTIONS, AllowedReaction } from "@/lib/constants";

import AutoRefresh from "@/components/AutoRefresh";
import DiscussionCompose from "@/components/DiscussionCompose"

type PostWithRelations = Prisma.PostGetPayload<{
    include: {
        author: true,
        reactions: true,
        comments: {
            include: { author: true, reactions: true }
        }
    }
}>;

export default async function ChunkReaderPage({
                                                  params,
                                              }: {
    params: Promise<{ roomId: string; chunkId: string }> | { roomId: string; chunkId: string };
}) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const resolvedParams = await params;
    const { roomId, chunkId } = resolvedParams;
    const currentUserId = session.user.id;

    // 1. Lightweight Query: Fetch chunk metadata and specific user's progress
    const chunk = await prisma.chunk.findUnique({
        where: { id: chunkId },
        include: {
            room: true,
            progress: { where: { userId: currentUserId } },
        },
        cacheStrategy: { ttl: 0 },
    });

    if (!chunk || chunk.roomId !== roomId) notFound();

    const isCompleted = chunk.progress && chunk.progress.length > 0;

// 2. Heavywork Query: Fetch all discussions using Upstash Redis Cache!
// This will only hit Postgres once every 15 seconds, regardless of how many users are reading.
    const discussions = await getCachedData<PostWithRelations[]>(
        `chunk:${chunkId}:discussions`,
        async () => {
            return prisma.post.findMany({
                where: {chunkId},
                include: {
                    author: true,
                    reactions: true,
                    comments: {
                        include: {author: true, reactions: true},
                        orderBy: {createdAt: "asc"},
                    },
                },
                orderBy: {createdAt: "asc"},
            });
        },
        15 // TTL: 15 seconds
    );

// 3. User's private quotes for the Vault drawer
    const userQuotes = isCompleted ? await prisma.quote.findMany({
        where: {
            userId: currentUserId,
            bookTitle: chunk.room.bookTitle
        },
        orderBy: { createdAt: "desc" }
    }) : [];

    return (
        <div className="min-h-screen bg-[#f4f4f0] p-8 md:p-12 text-[#1c1c1c]">
            {isCompleted && <AutoRefresh interval={15000} />}
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex items-center justify-between border-b border-[#dcdcc8] pb-4">
                    <Link href={`/rooms/${roomId}`} className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors">
                        ← Back to Room Schedule
                    </Link>
                    <span className="text-xs font-serif italic text-[#6b6b6b]">{chunk.room?.title}</span>
                </div>

                <h2
                    id="discussion-stream-header"
                    tabIndex={-1} // <- Allows programmatic focus without breaking tab flow
                    className="font-serif font-bold text-2xl outline-none focus:text-[#2d5a27] transition-colors"
                >
                    Discussion Stream
                </h2>

                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-white border border-[#dcdcc8] text-[#2d5a27]">Chapter Sequence</span>
                        <span className="text-xs text-[#6b6b6b]">Due: {new Date(chunk.deadline).toLocaleDateString()}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif font-extrabold tracking-tight">{chunk.title}</h1>
                </div>

                <div className="border border-[#dcdcc8] bg-white p-8 md:p-12 shadow-sm space-y-6">
                    <div className="prose prose-stone max-w-none font-serif text-lg leading-relaxed text-[#1c1c1c] whitespace-pre-wrap">
                        {chunk.description || "No source text provided for this reading section."}
                    </div>

                    <div className="pt-8 border-t border-[#dcdcc8] flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#1c1c1c]">
                                {isCompleted ? "Milestone Reached" : "Pending Confirmation"}
                            </p>
                            <p className="text-xs text-[#6b6b6b] mt-0.5">
                                {isCompleted
                                    ? "You have unlocked this section's discussion stream."
                                    : "Mark this chunk as completed to clear the spoiler gate."}
                            </p>
                        </div>

                        {!isCompleted && (
                            <form action={markChunkComplete.bind(null, chunkId)}>
                                <button type="submit" className="bg-[#1c1c1c] text-[#f4f4f0] px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all shadow-sm">
                                    Mark as Completed ✓
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="border border-[#dcdcc8] bg-white p-8 md:p-12 shadow-sm space-y-6">
                    <div className="border-b border-[#dcdcc8] pb-4 flex items-center justify-between">
                        <h2 className="font-serif font-bold text-2xl">Discussion Stream</h2>
                        <span className="text-xs text-[#6b6b6b]">
                            {discussions.length} {discussions.length === 1 ? 'Entry' : 'Entries'}
                        </span>
                    </div>

                    {!isCompleted ? (
                        <div className="border border-dashed border-[#dcdcc8] bg-[#f9f9f6] p-8 text-center space-y-3">
                            <div className="text-2xl mb-4">✦ ✦ ✦</div>
                            <h3 className="font-serif font-bold text-lg text-[#1c1c1c]">Spoiler Gate Active</h3>
                            <p className="text-xs text-[#6b6b6b] max-w-md mx-auto leading-relaxed">
                                Chronicle runs on an honour system. Discussion threads for this chapter are cryptographically protected. Confirm your completion above to view reader reflections.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {discussions.length === 0 ? (
                                <div className="border border-dashed border-[#dcdcc8] bg-[#f9f9f6] p-10 text-center space-y-4 my-8">
                                    <div className="text-3xl text-[#dcdcc8] mb-2 font-serif italic">✎</div>
                                    <h4 className="font-serif font-bold text-lg text-[#1c1c1c]">The page is blank.</h4>
                                    <p className="text-xs text-[#6b6b6b] max-w-sm mx-auto leading-relaxed">
                                        You are the first reader to unlock this section. Break the silence and share your reflections, favorite passages, or questions to initiate the discourse.
                                    </p>
                                </div>
                            ) : (
                                // Removing explicit 'any' allows TS to infer the type and clears ESLint errors
                                discussions.map((post) => {
                                    const reactionCounts = ALLOWED_REACTIONS.map((emoji) => {
                                        const matches = post.reactions.filter((r) => r.emoji === emoji);
                                        const hasReacted = matches.some((r) => r.userId === currentUserId);
                                        return { emoji, count: matches.length, hasReacted };
                                    });

                                    return (
                                        <div key={post.id} className="border border-[#dcdcc8] bg-[#f9f9f6] p-6 space-y-4">
                                            <div className="flex items-center justify-between text-[10px] text-[#6b6b6b] uppercase tracking-wider">
                                                <span>{post.author?.name || post.author?.email || "Anonymous Reader"}</span>
                                                <div className="flex gap-4">
                                                    {post.isQuote && <span className="text-[#8b6914] border-b border-[#8b6914]">From The Vault</span>}
                                                    <span>{new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>

                                            <p className="text-sm text-[#1c1c1c] leading-relaxed font-serif whitespace-pre-wrap">
                                                {post.content}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#dcdcc8]/60">
                                                {reactionCounts.map(({ emoji, count, hasReacted }) => (
                                                    <form key={emoji} action={toggleReaction.bind(null, post.id, undefined, emoji as AllowedReaction, chunkId, roomId)}>
                                                        <button
                                                            type="submit"
                                                            aria-label={`React with ${emoji}`} // <-- Added critical ARIA label
                                                            className={`text-xs px-2.5 py-1 border flex items-center gap-1.5 transition-all ${hasReacted ? 'bg-[#2d5a27]/10 border-[#2d5a27] text-[#2d5a27] font-bold' : 'bg-white border-[#dcdcc8] text-[#6b6b6b] hover:border-[#1c1c1c]'}`}
                                                        >
                                                            <span>{emoji}</span>
                                                            {count > 0 && <span className="text-[10px]">{count}</span>}
                                                        </button>
                                                    </form>
                                                ))}
                                            </div>

                                            <div className="pl-4 md:pl-6 border-l-2 border-[#dcdcc8] space-y-4 pt-4">
                                                {post.comments?.map((comment) => (
                                                    <div key={comment.id} className="bg-white border border-[#dcdcc8] p-4 space-y-1.5">
                                                        <div className="flex items-center justify-between text-[9px] text-[#6b6b6b] uppercase tracking-wider">
                                                            <span>{comment.author?.name || comment.author?.email || "Reader"}</span>
                                                            <span>{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-xs text-[#1c1c1c] font-serif leading-relaxed">
                                                            {comment.content}
                                                        </p>
                                                    </div>
                                                ))}

                                                <form action={createComment.bind(null, post.id, chunkId, roomId)} className="flex gap-2 pt-2">
                                                    <input type="text" name="content" required placeholder="Reply to this reflection..." className="flex-1 border border-[#dcdcc8] p-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1c1c1c]" />
                                                    <button type="submit" className="bg-[#1c1c1c] text-[#f4f4f0] px-4 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-colors">Reply</button>
                                                </form>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            <DiscussionCompose
                                quotes={userQuotes}
                                chunkId={chunkId}
                            />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}