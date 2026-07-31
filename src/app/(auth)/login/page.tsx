// src/app/(auth)/login/page.tsx
import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
    // Server action to securely handle the magic link dispatch
    async function handleLogin(formData: FormData) {
        "use server";
        const email = formData.get("email") as string;
        await signIn("resend", { email, redirectTo: "/dashboard" });
    }

    return (
        <div className="min-h-screen bg-[#f4f4f0] flex flex-col justify-center items-center p-6 selection:bg-[#2d5a27] selection:text-white">

            <div className="w-full max-w-md bg-white border border-[#dcdcc8] p-10 shadow-sm relative overflow-hidden">
                {/* Decorative Watermark */}
                <div className="absolute -top-4 -right-4 p-6 opacity-5 pointer-events-none">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                    </svg>
                </div>

                <div className="mb-8 text-center relative z-10">
                    <Link href="/" className="font-serif font-bold text-2xl tracking-tight text-[#1c1c1c] hover:text-[#2d5a27] transition-colors">
                        Chronicle.
                    </Link>
                    <h1 className="text-xl font-serif mt-6 mb-2 text-[#1c1c1c]">Initialize Session</h1>
                    <p className="text-xs text-[#6b6b6b] leading-relaxed">
                        Enter your email address. We will send you a secure magic link to access your library. No password required.
                    </p>
                </div>

                {/* Form wired to the server action */}
                <form action={handleLogin} className="space-y-5 relative z-10">
                    <div>
                        <label htmlFor="email" className="block text-[10px] font-bold text-[#1c1c1c] uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="reader@example.com"
                            className="w-full border border-[#dcdcc8] p-3 text-sm bg-[#f9f9f6] focus:outline-none focus:ring-1 focus:ring-[#1c1c1c] transition-shadow"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#1c1c1c] text-[#f4f4f0] py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-colors shadow-sm"
                    >
                        Dispatch Magic Link
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#dcdcc8] text-center relative z-10">
                    <Link href="/" className="text-[10px] font-bold uppercase tracking-wider text-[#6b6b6b] hover:text-[#1c1c1c] transition-colors">
                        ← Return to Homepage
                    </Link>
                </div>
            </div>

        </div>
    );
}