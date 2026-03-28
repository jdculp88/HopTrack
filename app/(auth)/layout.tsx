import Link from "next/link";
import { DarkCardWrapper } from "@/components/layout/DarkCardWrapper";
import { HopMark } from "@/components/ui/HopMark";

/*
 * Auth layout — "Gold on Cream" redesign
 * Cream canvas background, editorial left panel, dark form card on right
 */

const C = {
  cream: "#FBF7F0",
  dark: "#0F0E0C",
  darkSurface: "#1C1A16",
  darkBorder: "#3A3628",
  gold: "#D4A843",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  creamText: "#F5F0E8",
  creamSubtle: "#8B7E6A",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ backgroundColor: C.cream }}>
      {/* Left: Editorial panel — cream canvas */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42%] xl:w-[46%] relative overflow-hidden px-12 xl:px-16 py-12 flex-shrink-0"
        style={{ background: "#F3EDE3" }}
      >
        {/* Subtle warm glow */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 80% 10%, rgba(212,168,67,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Top: Logo */}
        <Link href="/" className="relative z-10 w-fit transition-opacity hover:opacity-75">
          <HopMark variant="horizontal" theme="cream" height={26} />
        </Link>

        {/* Middle: Editorial statement */}
        <div className="relative z-10 space-y-6">
          <div className="w-8 h-0.5" style={{ background: C.gold }} />
          <blockquote
            className="font-display leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: C.text }}
          >
            Every beer<br />
            <span style={{ color: C.gold, fontStyle: "italic" }}>
              tells a story.
            </span>
          </blockquote>
          <p className="font-sans text-sm leading-relaxed max-w-xs" style={{ color: C.textMuted }}>
            Track your craft beer journey. Rate every pour, discover breweries,
            and earn your way to Grand Cicerone.
          </p>
        </div>

        {/* Bottom: Tagline */}
        <div className="relative z-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: C.textSubtle }}>
            Track Every Pour
          </p>
        </div>

        {/* Vertical rule on right edge */}
        <div
          className="absolute right-0 top-0 bottom-0 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${C.gold}33 20%, ${C.gold}33 80%, transparent 100%)`,
          }}
        />
      </div>

      {/* Right: Form area — dark card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden mb-10 transition-opacity hover:opacity-75">
          <HopMark variant="horizontal" theme="cream" height={28} />
        </Link>

        {/* Dark form card — forces dark CSS vars for cream-on-dark */}
        <DarkCardWrapper>
          {children}
        </DarkCardWrapper>
      </div>
    </div>
  );
}
