// src/app/(app)/layout.tsx
import { auth, signOut } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#f4f4f0] text-[#1c1c1c] selection:bg-[#2d5a27] selection:text-white flex flex-col">

            {/* Top App Navigation */}
            <header className="border-b border-[#dcdcc8] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="font-serif font-bold text-xl tracking-tight hover:text-[#2d5a27] transition-colors">
                            Chronicle<span className="text-[#2d5a27]">.</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider">
                            <Link href="/dashboard" className="text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors">
                                Desk
                            </Link>
                            <Link href="/vault" className="text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors">
                                The Vault
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold text-[#1c1c1c]">{session.user.name || session.user.email}</p>
                            <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wider">Active Reader</p>
                        </div>

                        <form
                            action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}
                        >
                            <button
                                type="submit"
                                className="text-[10px] font-bold uppercase tracking-wider border border-[#dcdcc8] px-3 py-1.5 bg-[#f9f9f6] hover:bg-[#1c1c1c] hover:text-[#f4f4f0] hover:border-[#1c1c1c] transition-colors"
                            >
                                Sign Out
                            </button>
                        </form>
                    </div>

                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1">
                {children}
            </div>

        </div>
    );
}