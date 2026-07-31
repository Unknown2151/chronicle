// src/components/Header.tsx
import Link from "next/link";

export function Header() {
    return (
        <header className="flex items-center justify-between px-8 py-4 border-b bg-background">
            <div className="flex items-center gap-8">
                <Link href="/dashboard" className="font-bold text-xl tracking-tight">
                    Chronicle.
                </Link>
                <nav className="flex items-center gap-6 text-sm font-medium">
                    <Link
                        href="/dashboard"
                        className="hover:text-black transition-colors uppercase tracking-wider text-xs text-muted-foreground hover:text-foreground"
                    >
                        Desk
                    </Link>
                    <Link
                        href="/vault"
                        className="hover:text-black transition-colors uppercase tracking-wider text-xs text-muted-foreground hover:text-foreground"
                    >
                        The Vault
                    </Link>
                </nav>
            </div>
        </header>
    );
}