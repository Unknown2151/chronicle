import Link from "next/link";

export default function EmptyDesk() {
    return (
        <div className="border border-[#dcdcc8] bg-white p-12 text-center max-w-2xl mx-auto shadow-sm mt-12">
            <h2 className="font-serif text-3xl font-bold text-[#1c1c1c] mb-4">Your desk is clear.</h2>
            <p className="text-[#6b6b6b] font-serif text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                You have not joined any active reading circles yet. Initialize a new room to synchronize a reading schedule with your peers.
            </p>
            <Link
                href="/rooms/new"
                className="inline-block bg-[#1c1c1c] text-[#f4f4f0] px-8 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#2d5a27] transition-all"
            >
                Initialize Reading Room +
            </Link>
        </div>
    );
}