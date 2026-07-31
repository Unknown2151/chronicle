// src/components/DiscussionCompose.tsx
"use client";

import { useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { publishPost } from "@/actions/posts"; // <-- Import directly here

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="bg-[#1c1c1c] text-[#f4f4f0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-colors disabled:opacity-50"
        >
            {pending ? "Publishing..." : "Publish Reflection"}
        </button>
    );
}

export default function DiscussionCompose({ quotes, chunkId }: { quotes: any[]; chunkId: string; }) {
    const [text, setText] = useState("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isQuote, setIsQuote] = useState(false);

    const textAreaRef = useRef<HTMLTextAreaElement>(null); // <-- 1. Create Ref

    const handleQuoteSelect = (quote: any) => {
        const quoteText = `"${quote.text}"\n\n— ${quote.reflection || ""}`;
        setText(quoteText);
        setIsQuote(true);
        setIsDrawerOpen(false);
        // <-- 2. Return focus to textarea for keyboard accessibility
        setTimeout(() => textAreaRef.current?.focus(), 0);
    };

    const actionWithChunk = publishPost.bind(null, chunkId);

    return (
        <div className="pt-6 border-t border-[#dcdcc8]">
            <div className="flex items-center justify-between mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1c1c1c]">
                    Contribute to Chapter Discourse
                </label>
                <button
                    type="button"
                    onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#8b6914] border-b border-[#8b6914] hover:text-[#1c1c1c] transition-colors"
                >
                    {isDrawerOpen ? "Close Vault Drawer" : "Share from Vault"}
                </button>
            </div>

            {isDrawerOpen && (
                <div className="mb-4 border border-[#dcdcc8] bg-white p-4 max-h-60 overflow-y-auto shadow-inner space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#6b6b6b] mb-2">Your Private Quotes</h4>
                    {quotes.length === 0 ? (
                        <p className="text-xs text-[#6b6b6b] italic font-serif">No quotes saved for this book yet.</p>
                    ) : (
                        quotes.map(quote => (
                            <div key={quote.id} onClick={() => handleQuoteSelect(quote)} className="p-3 bg-[#f9f9f6] border border-[#dcdcc8] hover:border-[#1c1c1c] cursor-pointer transition-colors">
                                <p className="font-serif italic text-sm text-[#1c1c1c] mb-1 line-clamp-2">&#34;{quote.text}&#34;</p>
                                <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wider">Chapter {quote.chapter || "N/A"}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            <form action={actionWithChunk} className="space-y-4">
                <input type="hidden" name="isQuote" value={isQuote ? "true" : "false"} />
                <div className="relative">
                    <textarea
                        ref={textAreaRef} // <-- 3. Attach Ref to textarea
                        name="body"
                        rows={4}
                        required
                        aria-label="Discussion contribution"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            if (e.target.value === "") setIsQuote(false);
                        }}
                        maxLength={5000}
                        placeholder="Share your reflection or query regarding this section..."
                        className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] font-serif leading-relaxed pb-8"
                    />
                    <span className={`absolute bottom-3 right-3 text-[10px] font-mono ${text.length > 4900 ? 'text-[#991b1b]' : 'text-[#6b6b6b]'}`}>
                        {text.length} / 5000
                    </span>
                </div>
                <SubmitButton />
            </form>
        </div>
    );
}