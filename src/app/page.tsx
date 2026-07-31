// src/app/page.tsx
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  // If the user is already authenticated, skip the landing page
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
      <div className="min-h-screen bg-[#f4f4f0] text-[#1c1c1c] selection:bg-[#2d5a27] selection:text-white flex flex-col">

        {/* Top Navigation */}
        <nav className="w-full border-b border-[#dcdcc8] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="font-serif font-bold text-xl tracking-tight">
              Chronicle<span className="text-[#2d5a27]">.</span>
            </div>
            <div className="flex gap-6 items-center">
              <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors">
                Sign In
              </Link>
              <Link href="/login" className="text-xs font-bold uppercase tracking-wider bg-[#1c1c1c] text-[#f4f4f0] px-5 py-2 hover:bg-[#2d5a27] transition-colors shadow-sm">
                Start Reading
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-16 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#dcdcc8] bg-white text-[10px] font-bold uppercase tracking-widest text-[#2d5a27] rounded-full mb-4">
              <span className="w-2 h-2 rounded-full bg-[#2d5a27] animate-pulse"></span>
              Chronicle v1.0 is Live
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-extrabold tracking-tight leading-[1.1]">
              Read together. <br />
              <span className="text-[#6b6b6b] italic font-medium">Without the spoilers.</span>
            </h1>

            <p className="text-lg text-[#1c1c1c] max-w-xl mx-auto leading-relaxed font-serif">
              A synchronized reading platform designed for deep focus.
              Progress through chapters at your own pace, and unlock discussions only when you&#39;re ready.
            </p>

            <div className="pt-4">
              <Link href="/login" className="inline-block bg-[#1c1c1c] text-[#f4f4f0] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Initialize Your Library →
              </Link>
            </div>
          </div>

          {/* Bento Box Feature Grid */}
          <div className="w-full max-w-5xl mx-auto mt-32 mb-24 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Feature 1: The Spoiler Gate (Large span) */}
            <div className="md:col-span-2 border border-[#dcdcc8] bg-white p-8 group hover:border-[#1c1c1c] transition-colors relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2d5a27] mb-3">Zero-Trust Architecture</h3>
              <h2 className="text-2xl font-serif font-bold mb-4">The Spoiler Gate</h2>
              <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-md">
                Our mathematical progression system guarantees your reading experience remains pure.
                Future chapter discussions are cryptographically locked until you explicitly confirm you have crossed the milestone.
              </p>
            </div>

            {/* Feature 2: The Vault */}
            <div className="md:col-span-1 border border-[#dcdcc8] bg-[#f9f9f6] p-8 group hover:border-[#1c1c1c] transition-colors shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] mb-3">Digital Garden</h3>
              <h2 className="text-2xl font-serif font-bold mb-4">The Vault</h2>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">
                Curate your personal reading journal. Save impactful quotes and private reflections, then selectively publish them to the community feed.
              </p>
            </div>

            {/* Feature 3: Phase 7 Tease (Dark Mode) */}
            <div className="md:col-span-1 border border-[#1c1c1c] bg-[#1c1c1c] text-[#f4f4f0] p-8 group relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#2d5a27]/20 to-transparent rounded-bl-full"></div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#f4f4f0]/50 mb-3">Experimental</h3>
              <h2 className="text-2xl font-serif font-bold mb-4">AI Companions</h2>
              <p className="text-sm text-[#f4f4f0]/80 leading-relaxed">
                Coming soon: Agentic chapter summarizers, semantic theme extraction, and weekly digest generation via advanced sequence models.
              </p>
            </div>

            {/* Feature 4: Admin Tools */}
            <div className="md:col-span-2 border border-[#dcdcc8] bg-white p-8 group hover:border-[#1c1c1c] transition-colors shadow-sm flex flex-col justify-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6b6b6b] mb-3">Granular Control</h3>
              <h2 className="text-2xl font-serif font-bold mb-4">Dynamic Timelines</h2>
              <p className="text-sm text-[#6b6b6b] leading-relaxed max-w-lg">
                Establish synchronized reading groups with absolute authority. Admins command powerful pacing tools, atomic chunk reordering, and robust role-based moderation to curate a perfect literary sanctuary.
              </p>
            </div>

          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#dcdcc8] py-8 bg-white text-center text-xs text-[#6b6b6b]">
          <p>Engineered for the synchronized reader.</p>
          <p className="mt-2">© {new Date().getFullYear()} Chronicle OS. All rights reserved.</p>
        </footer>
      </div>
  );
}