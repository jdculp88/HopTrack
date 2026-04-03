"use client";

import { useState } from "react";

interface EmbedConfigClientProps {
  breweryId: string;
  breweryName: string;
  breweryCity: string | null;
  breweryState: string | null;
}

export function EmbedConfigClient({ breweryId, breweryName, breweryCity, breweryState }: EmbedConfigClientProps) {
  const [theme, setTheme] = useState<"cream" | "dark">("cream");
  const [layout, setLayout] = useState<"full" | "compact">("full");
  const [showRating, setShowRating] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showGlass, setShowGlass] = useState(true);
  const [showStyle, setShowStyle] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [copied, setCopied] = useState(false);

  function getEmbedUrl() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams();
    if (theme !== "cream") params.set("theme", theme);
    if (layout !== "full") params.set("layout", layout);
    if (!showRating) params.set("showRating", "false");
    if (!showPrice) params.set("showPrice", "false");
    if (!showGlass) params.set("showGlass", "false");
    if (!showStyle) params.set("showStyle", "false");
    if (!showEvents) params.set("showEvents", "false");
    if (showDescription) params.set("showDescription", "true");
    const qs = params.toString();
    return `${origin}/embed/${breweryId}/menu${qs ? `?${qs}` : ""}`;
  }

  function getEmbedCode() {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://hoptrack.beer";
    let attrs = `data-brewery="${breweryId}"`;
    if (theme !== "cream") attrs += ` data-theme="${theme}"`;
    if (layout !== "full") attrs += ` data-layout="${layout}"`;
    if (!showRating) attrs += ` data-show-rating="false"`;
    if (!showPrice) attrs += ` data-show-price="false"`;
    if (!showGlass) attrs += ` data-show-glass="false"`;
    if (!showStyle) attrs += ` data-show-style="false"`;
    if (!showEvents) attrs += ` data-show-events="false"`;
    if (showDescription) attrs += ` data-show-description="true"`;

    return `<div id="hoptrack-menu" ${attrs}></div>\n<script src="${origin}/embed.js" async></script>`;
  }

  function copyEmbedCode() {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Embeddable Beer Menu
        </h1>
        <p className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)", letterSpacing: "0.05em" }}>
          Add your live tap list to your website with one line of code
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        {/* ─── Controls Panel ────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5 space-y-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Brewery info */}
          <div
            className="rounded-xl p-3"
            style={{ background: "var(--surface-2)" }}
          >
            <p className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              {breweryName}
            </p>
            {breweryCity && (
              <p className="font-mono text-xs mt-1" style={{ color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {breweryCity}{breweryState ? `, ${breweryState}` : ""}
              </p>
            )}
          </div>

          {/* Theme toggle */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] block mb-2" style={{ color: "var(--text-muted)" }}>
              Theme
            </label>
            <div className="flex gap-2">
              {(["cream", "dark"] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} className="font-mono text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-lg" style={{
                  background: theme === t ? "var(--accent-gold)" : "var(--surface-2)",
                  color: theme === t ? "#0F0E0C" : "var(--text-muted)",
                  border: "none", cursor: "pointer",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Layout toggle */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] block mb-2" style={{ color: "var(--text-muted)" }}>
              Layout
            </label>
            <div className="flex gap-2">
              {(["full", "compact"] as const).map(l => (
                <button key={l} onClick={() => setLayout(l)} className="font-mono text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-lg" style={{
                  background: layout === l ? "var(--accent-gold)" : "var(--surface-2)",
                  color: layout === l ? "#0F0E0C" : "var(--text-muted)",
                  border: "none", cursor: "pointer",
                }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Field toggles */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] block mb-2" style={{ color: "var(--text-muted)" }}>
              Show / Hide
            </label>
            {([
              { label: "Glass Art", value: showGlass, set: setShowGlass },
              { label: "Style", value: showStyle, set: setShowStyle },
              { label: "Rating", value: showRating, set: setShowRating },
              { label: "Price", value: showPrice, set: setShowPrice },
              { label: "Events", value: showEvents, set: setShowEvents },
              { label: "Description", value: showDescription, set: setShowDescription },
            ]).map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 mb-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => set(e.target.checked)}
                  style={{ accentColor: "var(--accent-gold)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
              </label>
            ))}
          </div>

          {/* Embed code */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] block mb-2" style={{ color: "var(--text-muted)" }}>
              Embed Code
            </label>
            <pre
              className="rounded-xl p-3 text-[10px] leading-relaxed font-mono overflow-x-auto"
              style={{
                background: "#0F0E0C",
                color: "#E5DDD0",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {getEmbedCode()}
            </pre>
            <button
              onClick={copyEmbedCode}
              className="w-full mt-2 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider"
              style={{
                background: copied ? "#3D7A52" : "var(--accent-gold)",
                color: copied ? "#FFFFFF" : "#0F0E0C",
                border: "none",
                cursor: "pointer",
                transition: "background 150ms",
              }}
            >
              {copied ? "Copied!" : "Copy Embed Code"}
            </button>
          </div>

          {/* Help text */}
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Paste this code into your website where you want the beer menu to appear. It updates automatically when you change your tap list.
          </p>
        </div>

        {/* ─── Preview ───────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Fake browser chrome */}
          <div
            className="px-4 py-2 flex items-center gap-2"
            style={{
              background: theme === "dark" ? "#1E1E1E" : "#F5F5F5",
              borderBottom: `1px solid ${theme === "dark" ? "#3A3A3A" : "#E0E0E0"}`,
            }}
          >
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
            </div>
            <div
              className="flex-1 rounded-md px-3 py-1 text-xs"
              style={{
                background: theme === "dark" ? "#333" : "#FFFFFF",
                color: theme === "dark" ? "#999" : "#666",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {breweryName.toLowerCase().replace(/\s+/g, "")}.com/beer-menu
            </div>
          </div>

          {/* Mock page with embed */}
          <div
            className="p-8"
            style={{ background: theme === "dark" ? "#2A2A2A" : "#FFFFFF" }}
          >
            <h2
              className="text-2xl mb-2"
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 400,
                color: theme === "dark" ? "#DDD" : "#333",
              }}
            >
              Our Beer Menu
            </h2>
            <p
              className="text-sm mb-6 max-w-lg"
              style={{
                lineHeight: 1.6,
                color: theme === "dark" ? "#999" : "#666",
              }}
            >
              Check out what's currently on tap. Our menu updates in real-time through HopTrack.
            </p>

            <iframe
              src={getEmbedUrl()}
              className="w-full rounded-xl"
              style={{
                border: "none",
                minHeight: 500,
                overflow: "hidden",
                boxShadow: theme === "dark"
                  ? "0 4px 24px rgba(0,0,0,0.3)"
                  : "0 4px 24px rgba(0,0,0,0.08)",
              }}
              title="HopTrack Beer Menu Preview"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
