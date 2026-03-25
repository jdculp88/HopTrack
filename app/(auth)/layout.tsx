import Link from "next/link";
import { Hop } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[var(--bg)]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#D4A843]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/20 to-transparent" />

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-2.5 mb-10 group">
        <div className="w-9 h-9 rounded-xl bg-[#D4A843] flex items-center justify-center shadow-lg shadow-[#D4A843]/20">
          <Hop size={20} className="text-[#0F0E0C]" />
        </div>
        <span className="font-display text-2xl font-bold text-[var(--text-primary)] group-hover:text-[#D4A843] transition-colors">
          HopTrack
        </span>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
