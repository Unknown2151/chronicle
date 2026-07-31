// src/app/(auth)/verify/page.tsx
import Link from "next/link";

export default function VerifyPage() {
    return (
        <div className="min-h-screen bg-[#f4f4f0] flex flex-col justify-center items-center p-6 selection:bg-[#2d5a27] selection:text-white">

            <div className="w-full max-w-md bg-white border border-[#dcdcc8] p-10 shadow-sm text-center">

                {/* Envelope Icon */}
                <div className="w-12 h-12 bg-[#f9f9f6] border border-[#dcdcc8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <svg className="w-5 h-5 text-[#2d5a27]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                </div>

                <h1 className="text-2xl font-serif font-bold text-[#1c1c1c] mb-3">Check your inbox</h1>

                <p className="text-sm text-[#6b6b6b] leading-relaxed mb-8">
                    A secure authentication link has been dispatched to your email address. Please click the link to verify your identity and initialize your session.
                </p>

                <Link href="/" className="inline-block bg-[#1c1c1c] text-[#f4f4f0] px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-colors shadow-sm">
                    Return to Homepage
                </Link>

            </div>

        </div>
    );
}