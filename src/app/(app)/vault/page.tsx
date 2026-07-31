// src/app/(app)/vault/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function VaultPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    // Fetch quotes matching your actual database schema
    const quotes = await prisma.quote.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="min-h-screen bg-[#f4f4f0] p-8 md:p-12 text-[#1c1c1c]">
            <div className="max-w-4xl mx-auto space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#dcdcc8] pb-6 gap-4">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] mb-1">Personal Archive</p>
                        <h1 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight">The Vault</h1>
                    </div>
                    <p className="text-xs text-[#6b6b6b] max-w-xs leading-relaxed">
                        Your private repository for highlighted passages and reflections captured across your reading rooms.
                    </p>
                </div>

                {/* Quotes Feed / High-Activation Empty State */}
                {quotes.length === 0 ? (
                    <div className="border border-[#dcdcc8] bg-white p-8 md:p-12 shadow-sm text-center space-y-6 mt-8">
                        <div className="text-5xl text-[#dcdcc8] font-serif italic mb-4">”</div>
                        <h2 className="font-serif text-2xl font-bold text-[#1c1c1c]">Your Vault is empty.</h2>
                        <p className="text-[#6b6b6b] font-serif text-base leading-relaxed max-w-md mx-auto">
                            The Vault is your private literary journal. When you encounter a passage that resonates with you during a reading session, save it here to reflect on later or share with your cohort.
                        </p>

                        {/* Example visual to show them what it WILL look like */}
                        <div className="my-8 p-6 bg-[#f9f9f6] border-l-2 border-[#dcdcc8] text-left opacity-60 pointer-events-none max-w-lg mx-auto">
                            <span className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-bold">Example Entry</span>
                            <p className="font-serif italic text-sm text-[#1c1c1c] mt-2 mb-3">
                                &#34;All human wisdom is contained in these two words — Wait and Hope.&#34;
                            </p>
                            <p className="text-xs font-serif text-[#6b6b6b]">Alexandre Dumas, The Count of Monte Cristo</p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/dashboard"
                                className="inline-block bg-[#1c1c1c] text-[#f4f4f0] px-6 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all"
                            >
                                Return to Active Desk
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {quotes.map((quote: any) => (
                            <div
                                key={quote.id}
                                className="border border-[#dcdcc8] bg-white p-8 shadow-sm relative space-y-4"
                            >
                                <div className="flex items-center justify-between border-b border-[#dcdcc8] pb-4">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#f9f9f6] border border-[#dcdcc8] text-[#6b6b6b]">
                                        {quote.bookTitle || "Reading Archive"}
                                    </span>
                                    <span className="text-xs text-[#6b6b6b]">
                                        {new Date(quote.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <blockquote className="font-serif text-lg md:text-xl italic text-[#1c1c1c] leading-relaxed pl-4 border-l-2 border-[#2d5a27]">
                                    &ldquo;{quote.text || quote.content}&rdquo;
                                </blockquote>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}