"use client";

import Link from "next/link";
import { LegalLink } from "@/components/ui/LegalLink";
import { usePathname } from "next/navigation";
import { HopMark } from "@/components/ui/HopMark";
import { ToastProvider } from "@/components/ui/Toast";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { Beer } from "lucide-react";

interface StorefrontShellProps {
  children: React.ReactNode;
}

export function StorefrontShell({ children }: StorefrontShellProps) {
  const pathname = usePathname();

  return (
    <ToastProvider>
      <OfflineBanner />
      <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
        {/* Minimal header — logo + auth buttons */}
        <header
          className="sticky top-0 z-50 backdrop-blur-xl border-b"
          style={{
            background: "color-mix(in srgb, var(--bg) 85%, transparent)",
            borderColor: "var(--border)",
          }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" aria-label="HopTrack home">
              <HopMark variant="horizontal" height={28} />
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/for-breweries"
                className="hidden sm:inline-flex px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--accent-gold)" }}
              >
                Own a brewery?
              </Link>
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Log in
              </Link>
              <Link
                href={`/signup?next=${encodeURIComponent(pathname)}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                <Beer size={14} />
                Sign Up Free
              </Link>
            </div>
          </div>
        </header>

        {/* Page content — full width, no sidebar */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Sticky bottom CTA bar — mobile */}
        <div
          className="sticky bottom-0 z-40 border-t sm:hidden"
          style={{
            background: "color-mix(in srgb, var(--bg) 95%, transparent)",
            borderColor: "var(--border)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Track every pour
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Join free. Earn rewards.
              </p>
            </div>
            <Link
              href={`/signup?next=${encodeURIComponent(pathname)}`}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all hover:opacity-90"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              Sign Up Free
            </Link>
          </div>
        </div>

        {/* Footer — branding + conversion */}
        <footer
          className="border-t py-8 hidden sm:block"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <HopMark variant="mark" height={24} />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Powered by HopTrack — Track Every Pour
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href="/for-breweries"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  For Breweries
                </Link>
                <LegalLink
                  href="/privacy"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  Privacy
                </LegalLink>
                <LegalLink
                  href="/terms"
                  className="text-xs transition-colors hover:underline"
                  style={{ color: "var(--text-muted)" }}
                >
                  Terms
                </LegalLink>
                <Link
                  href={`/signup?next=${encodeURIComponent(pathname)}`}
                  className="text-xs font-semibold transition-colors hover:underline"
                  style={{ color: "var(--accent-gold)" }}
                >
                  Create Account →
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
