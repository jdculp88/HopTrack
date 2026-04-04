import Link from "next/link";
import { HopMark } from "@/components/ui/HopMark";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Demo Dashboard — HopTrack",
  description: "See what a HopTrack brewery dashboard looks like with real data. No login required.",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Demo header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          background: "color-mix(in srgb, var(--bg) 92%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/for-breweries"
              className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--text-muted)" }}
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            <div className="h-4 w-px" style={{ background: "var(--border)" }} />
            <HopMark variant="horizontal" theme="auto" height={22} />
          </div>
          <Link
            href="/brewery-admin/claim"
            className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
          >
            Claim your brewery
          </Link>
        </div>
      </header>

      {children}
    </div>
  );
}
