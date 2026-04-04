import { HopMark } from "@/components/ui/HopMark";
import { Gift, BarChart2, List } from "lucide-react";
import { C } from "@/lib/landing-colors";

export const metadata = {
  title: "HopTrack for Breweries — One Pager",
  description: "Replace your punch card. Own your loyalty. See what HopTrack can do for your brewery.",
};

const BENEFITS = [
  {
    icon: Gift,
    title: "Replace your punch card",
    body: "Digital loyalty stamps your customers actually use. No reprinting, no lost cards, no wasted paper.",
  },
  {
    icon: BarChart2,
    title: "See who comes back",
    body: "Know your regulars, your peak nights, and your top beers. Analytics that tell you something real.",
  },
  {
    icon: List,
    title: "Live tap list, any device",
    body: "Update from your phone. Embed on your site. Put it on a TV. Changes appear instantly.",
  },
];

export default function OnePagerPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: C.dark, color: C.creamText }}
    >
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-inside: avoid; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-8 py-12 print-break">
        {/* Logo */}
        <div className="mb-10 text-center">
          <HopMark variant="horizontal" theme="dark" height={36} />
        </div>

        {/* Headline */}
        <div className="text-center mb-10">
          <p
            className="text-[11px] font-mono uppercase tracking-[0.22em] mb-3"
            style={{ color: C.gold }}
          >
            For Brewery Owners
          </p>
          <h1
            className="font-display font-bold leading-[0.9] tracking-tight mb-4"
            style={{ fontSize: "clamp(32px, 5vw, 48px)" }}
          >
            Replace your{" "}
            <span className="italic" style={{ color: C.gold }}>
              punch card.
            </span>
            <br />
            Own your loyalty.
          </h1>
          <p
            className="text-base leading-relaxed max-w-md mx-auto"
            style={{ color: C.creamSubtle }}
          >
            HopTrack replaces paper loyalty cards with a digital program your
            customers actually use — plus live tap list management and analytics
            that tell you something real.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 print-break">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl p-5"
              style={{
                background: C.darkSurface,
                border: `1px solid ${C.darkBorder}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                style={{
                  background: "rgba(212,168,67,0.1)",
                  border: "1px solid rgba(212,168,67,0.2)",
                }}
              >
                <Icon size={16} style={{ color: C.gold }} />
              </div>
              <h3 className="font-display text-base font-bold mb-1.5">
                {title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: C.creamSubtle }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing strip */}
        <div
          className="rounded-2xl p-5 mb-10 text-center print-break"
          style={{
            background: C.darkSurface,
            border: `1px solid ${C.darkBorder}`,
          }}
        >
          <p
            className="text-[11px] font-mono uppercase tracking-[0.22em] mb-3"
            style={{ color: C.gold }}
          >
            Simple pricing
          </p>
          <div className="flex flex-wrap items-baseline justify-center gap-x-8 gap-y-3">
            <div>
              <span className="font-display text-2xl font-bold" style={{ color: C.gold }}>Tap</span>
              <span className="text-sm ml-1.5" style={{ color: C.creamSubtle }}>$49/mo</span>
            </div>
            <span style={{ color: C.darkBorder }}>·</span>
            <div>
              <span className="font-display text-2xl font-bold">Cask</span>
              <span className="text-sm ml-1.5" style={{ color: C.creamSubtle }}>$149/mo</span>
            </div>
            <span style={{ color: C.darkBorder }}>·</span>
            <div>
              <span className="font-display text-2xl font-bold">Barrel</span>
              <span className="text-sm ml-1.5" style={{ color: C.creamSubtle }}>Custom</span>
            </div>
          </div>
          <p
            className="text-xs font-mono mt-3"
            style={{ color: C.creamSubtle }}
          >
            14-day free trial · No credit card · Set up in 20 minutes
          </p>
        </div>

        {/* QR Code / CTA */}
        <div className="text-center print-break">
          {/* SVG QR code placeholder — a clean visual indicator to scan */}
          <div
            className="inline-flex items-center justify-center w-28 h-28 rounded-2xl mb-4"
            style={{
              background: C.creamText,
              border: `3px solid ${C.gold}`,
            }}
          >
            <div className="text-center">
              <p className="text-[9px] font-mono font-bold leading-tight" style={{ color: C.dark }}>
                SCAN ME
              </p>
              <p className="text-[8px] font-mono mt-0.5" style={{ color: C.textMuted }}>
                hoptrack.beer
              </p>
              {/* Grid pattern to suggest QR code */}
              <div className="grid grid-cols-5 gap-0.5 mt-1.5 mx-auto w-12">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-[1px]"
                    style={{
                      background: [0,1,2,4,5,6,10,12,14,18,19,20,22,23,24].includes(i)
                        ? C.dark : "transparent",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs font-mono mb-1" style={{ color: C.creamSubtle }}>
            Scan to learn more
          </p>
          <p className="text-sm font-semibold" style={{ color: C.gold }}>
            hoptrack.beer/for-breweries
          </p>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 text-center" style={{ borderTop: `1px solid ${C.darkBorder}` }}>
          <p className="text-xs font-mono" style={{ color: C.creamSubtle }}>
            © 2026 HopTrack · Track Every Pour
          </p>
        </div>
      </div>
    </div>
  );
}
