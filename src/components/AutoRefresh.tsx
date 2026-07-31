// src/components/AutoRefresh.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AutoRefresh({ interval = 15000 }: { interval?: number }) {
    const router = useRouter();
    const [lastSync, setLastSync] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            router.refresh();
            setLastSync(new Date());
        }, interval);

        return () => clearInterval(timer);
    }, [router, interval]);

    return (
        <div className="text-[9px] uppercase tracking-wider text-[#2d5a27] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2d5a27] animate-pulse"></span>
            Updated {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
    );
}