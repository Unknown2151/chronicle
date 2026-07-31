// src/components/PostCard.tsx
"use client";

import { useState, useTransition } from "react";
import { deletePost } from "@/actions/moderation";
import { createComment } from "@/actions/comments";
import { toggleReaction } from "@/actions/reactions";
import { ALLOWED_REACTIONS, AllowedReaction } from "@/lib/constants";

export default function PostCard({
                                     post,
                                     chunkId,
                                     roomId,
                                     currentUserId,
                                     currentUserRole
                                 }: {
    post: any;
    chunkId: string;
    roomId: string;
    currentUserId?: string | null;
    currentUserRole?: string
}) {
    const [isPending, startTransition] = useTransition();
    const [showCommentBox, setShowCommentBox] = useState(false);

    const isAuthor = currentUserId === post.authorId;
    const canDelete = isAuthor || currentUserRole === "ADMIN" || currentUserRole === "MODERATOR";

    return (
        <article className={`border border-[#dcdcc8] p-6 bg-white shadow-sm transition-opacity ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4 border-b border-[#dcdcc8] pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1c1c1c] text-[#f4f4f0] rounded-full flex items-center justify-center text-xs font-bold uppercase">
                        {post.author.name?.charAt(0) || post.author.email?.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-sm">{post.author.name || post.author.email}</p>
                        <p className="text-xs text-[#6b6b6b]">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {post.isQuote && (
                        <span className="text-[10px] bg-[#2d5a27]/10 text-[#2d5a27] px-2.5 py-1 font-semibold uppercase tracking-wider border border-[#2d5a27]/20">
                            From the Vault
                        </span>
                    )}

                    {/* Moderation Controls */}
                    {canDelete && (
                        <button
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this post?")) {
                                    startTransition(() => deletePost(post.id, roomId, chunkId));
                                }
                            }}
                            disabled={isPending}
                            className="text-[10px] text-[#991b1b] hover:underline font-bold uppercase tracking-wider"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </button>
                    )}
                </div>
            </div>

            {/* Post Content */}
            <p className="text-[#1c1c1c] leading-relaxed whitespace-pre-wrap font-serif mb-6">
                {post.content}
            </p>

            {/* Reactions Row */}
            <div className="flex flex-wrap gap-2 mb-4">
                {ALLOWED_REACTIONS.map((emoji) => {
                    const count = post.reactions.filter((r: any) => r.emoji === emoji).length;
                    return (
                        <button
                            key={emoji}
                            onClick={() => startTransition(() => toggleReaction(post.id, undefined, emoji as AllowedReaction, chunkId, roomId))}
                            className="text-xs border border-[#dcdcc8] px-2.5 py-1 bg-[#f9f9f6] hover:bg-[#f4f4f0] transition-colors flex items-center gap-1.5"
                        >
                            <span>{emoji}</span>
                            {count > 0 && <span className="font-medium">{count}</span>}
                        </button>
                    );
                })}
            </div>

            {/* Comments Toggle Footer */}
            <div className="border-t border-[#dcdcc8] pt-4 flex justify-between items-center text-xs">
                <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    className="text-[#6b6b6b] hover:text-[#1c1c1c] font-medium"
                >
                    {post.comments.length} {post.comments.length === 1 ? "Comment" : "Comments"}
                </button>
                <button
                    onClick={() => setShowCommentBox(!showCommentBox)}
                    className="text-[#2d5a27] font-medium hover:underline"
                >
                    Reply
                </button>
            </div>

            {/* Comment Thread Section */}
            {(showCommentBox || post.comments.length > 0) && (
                <div className="mt-4 space-y-4 border-t border-[#dcdcc8] pt-4 bg-[#f9f9f6] p-4">
                    {post.comments.map((comment: any) => (
                        <div key={comment.id} className="border-b border-[#dcdcc8] last:border-0 pb-3 last:pb-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-xs">{comment.author.name || comment.author.email}</span>
                                <span className="text-[10px] text-[#6b6b6b]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-serif text-[#1c1c1c]">{comment.content}</p>
                        </div>
                    ))}

                    {/* Reply Form */}
                    {showCommentBox && (
                        <form
                            action={async (formData) => {
                                await createComment(post.id, chunkId, roomId, formData);
                            }}
                            className="mt-4"
                        >
                            <textarea
                                name="content"
                                required
                                placeholder="Write a reply..."
                                className="w-full border border-[#dcdcc8] p-3 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-serif mb-2"
                                rows={2}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-[#1c1c1c] text-[#f4f4f0] px-4 py-1.5 text-xs font-medium hover:bg-[#2d5a27] transition-colors"
                                >
                                    Post Reply
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </article>
    );
}