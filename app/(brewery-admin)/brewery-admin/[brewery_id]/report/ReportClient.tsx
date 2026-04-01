"use client";

import { UserAvatar } from "@/components/ui/UserAvatar";
import { HopMark } from "@/components/ui/HopMark";
import { Printer } from "lucide-react";

// Self-contained cream palette — same pattern as The Board / SessionRecapSheet
const R = {
  bg: "#faf6f0",
  surface: "#ffffff",
  gold: "#C4913A",
  goldLight: "#F0D49A",
  text: "#2C1810",
  textSecondary: "#6B5744",
  textMuted: "#A08B7A",
  border: "#E8D5C0",
  barBg: "#EDE0D0",
};

interface ReportClientProps {
  brewery: { id: string; name: string; city: string | null; state: string | null; cover_image_url: string | null };
  metrics: {
    visits7: number;
    visits30: number;
    visits90: number;
    uniqueVisitors90: number;
    repeatPct: number;
    avgRating: number | null;
  };
  topBeers: Array<{ id: string; name: string; style: string | null; pours: number; avgRating: number | null }>;
  hourCounts: number[];
  topCustomers: Array<{ profile: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null; visits: number }>;
  generatedAt: string;
}

export function ReportClient({ brewery, metrics, topBeers, hourCounts, topCustomers, generatedAt }: ReportClientProps) {
  const date = new Date(generatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Empty state — no visitor data yet
  if (metrics.visits90 === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: R.goldLight }}>
          <span className="text-4xl">📊</span>
        </div>
        <h2 className="font-display text-2xl font-bold" style={{ color: R.text }}>No visitor data yet</h2>
        <p className="max-w-sm" style={{ color: R.textSecondary }}>
          Once customers start checking in at {brewery.name}, your analytics will appear here.
          Share your QR code to get your first visitors tracked!
        </p>
        <a
          href={`/brewery-admin/${brewery.id}/qr`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium mt-2"
          style={{ background: R.gold, color: R.bg }}
        >
          Get Your QR Code
        </a>
      </div>
    );
  }

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakLabel = peakHour === 0 ? "12 AM" : peakHour < 12 ? `${peakHour} AM` : peakHour === 12 ? "12 PM" : `${peakHour - 12} PM`;
  const maxHour = Math.max(...hourCounts, 1);

  return (
    <>
      {/* Print button — hidden in print */}
      <div className="print:hidden flex justify-end px-6 pt-4 pb-0">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={{ background: R.gold, color: R.bg }}
        >
          <Printer size={14} />
          Print / Save PDF
        </button>
      </div>

      {/* Report — cream canvas */}
      <div
        id="hoptrack-report"
        style={{
          background: R.bg,
          color: R.text,
          fontFamily: "'DM Sans', sans-serif",
          maxWidth: 760,
          margin: "0 auto",
          padding: "40px 40px 60px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, paddingBottom: 24, borderBottom: `2px solid ${R.border}` }}>
          <div>
            <HopMark variant="horizontal" theme="cream" height={28} />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: R.text, margin: "12px 0 4px", lineHeight: 1.1 }}>
              {brewery.name}
            </h1>
            <p style={{ color: R.textMuted, fontSize: 14 }}>
              {brewery.city}{brewery.state ? `, ${brewery.state}` : ""} · Analytics Report
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 12, color: R.textMuted }}>Generated</p>
            <p style={{ fontSize: 13, color: R.text, fontWeight: 500 }}>{date}</p>
          </div>
        </div>

        {/* Metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}>
          <MetricCard label="Visits (7 days)" value={metrics.visits7.toString()} sub="this week" />
          <MetricCard label="Visits (30 days)" value={metrics.visits30.toString()} sub="this month" />
          <MetricCard label="Visits (90 days)" value={metrics.visits90.toString()} sub="this quarter" />
          <MetricCard label="Unique Visitors" value={metrics.uniqueVisitors90.toString()} sub="90-day window" />
          <MetricCard label="Repeat Visitor Rate" value={`${metrics.repeatPct}%`} sub="2+ visits" />
          <MetricCard label="Avg Session Rating" value={metrics.avgRating != null ? `${metrics.avgRating} ★` : "—"} sub="all beers" />
        </div>

        {/* Two-column layout: Top Beers + Peak Hours */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 36 }}>
          {/* Top Beers */}
          <Section title="Top Beers by Pours">
            {topBeers.length === 0 ? (
              <p style={{ color: R.textMuted, fontSize: 13 }}>No pour data yet.</p>
            ) : (
              topBeers.map((beer, i) => (
                <div key={beer.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < topBeers.length - 1 ? `1px solid ${R.border}` : "none" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: R.gold, width: 18, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: R.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{beer.name}</p>
                    {beer.style && <p style={{ fontSize: 11, color: R.textMuted, marginTop: 1 }}>{beer.style}</p>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: R.text }}>{beer.pours} pours</p>
                    {beer.avgRating != null && (
                      <p style={{ fontSize: 11, color: R.gold }}>★ {beer.avgRating}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </Section>

          {/* Peak Hours */}
          <Section title="Peak Visit Hours">
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[8, 11, 14, 17, 18, 19, 20, 21, 22].map((h) => {
                const label = h < 12 ? `${h} AM` : h === 12 ? "12 PM" : `${h - 12} PM`;
                const count = hourCounts[h] ?? 0;
                const pct = Math.round((count / maxHour) * 100);
                const isPeak = h === peakHour;
                return (
                  <div key={h} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: R.textMuted, width: 40, flexShrink: 0 }}>{label}</span>
                    <div style={{ flex: 1, height: 8, background: R.barBg, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: isPeak ? R.gold : R.goldLight, borderRadius: 4, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 11, color: isPeak ? R.gold : R.textMuted, width: 20, textAlign: "right", fontWeight: isPeak ? 700 : 400 }}>{count}</span>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 12, color: R.textSecondary, marginTop: 10 }}>
              Peak time: <span style={{ color: R.gold, fontWeight: 600 }}>{peakLabel}</span>
            </p>
          </Section>
        </div>

        {/* Biggest Fans */}
        {topCustomers.length > 0 && (
          <Section title="Your Biggest Fans">
            <div style={{ display: "flex", gap: 20 }}>
              {topCustomers.map(({ profile, visits }, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    {profile ? (
                      <UserAvatar
                        profile={{ display_name: profile.display_name ?? profile.username, avatar_url: profile.avatar_url ?? null, username: profile.username }}
                        size="lg"
                      />
                    ) : (
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: R.barBg }} />
                    )}
                    {i === 0 && (
                      <span style={{ position: "absolute", top: -8, right: -8, fontSize: 16 }}>👑</span>
                    )}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: R.text }}>
                      {profile?.display_name ?? profile?.username ?? "Guest"}
                    </p>
                    <p style={{ fontSize: 11, color: R.textMuted }}>{visits} visits</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `1px solid ${R.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 11, color: R.textMuted }}>
            Data covers the last 90 days · HopTrack Analytics
          </p>
          <HopMark variant="horizontal" theme="cream" height={18} />
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: ${R.bg} !important; }
          #hoptrack-report { max-width: 100% !important; padding: 20px !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: R.surface, border: `1px solid ${R.border}`, borderRadius: 12, padding: "16px 18px" }}>
      <p style={{ fontSize: 11, color: R.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: R.gold, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: R.textSecondary, marginTop: 4 }}>{sub}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: R.surface, border: `1px solid ${R.border}`, borderRadius: 12, padding: "18px 20px" }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: R.text, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${R.border}` }}>
        {title}
      </p>
      {children}
    </div>
  );
}
