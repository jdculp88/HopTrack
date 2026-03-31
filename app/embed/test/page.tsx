"use client";

import { useState, useEffect, useCallback } from "react";

interface BreweryOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export default function EmbedTestPage() {
  const [breweries, setBreweries] = useState<BreweryOption[]>([]);
  const [search, setSearch] = useState("");
  const [selectedBrewery, setSelectedBrewery] = useState<BreweryOption | null>(null);
  const [loading, setLoading] = useState(false);

  // Theme controls
  const [theme, setTheme] = useState<"cream" | "dark">("cream");
  const [layout, setLayout] = useState<"full" | "compact">("full");
  const [showRating, setShowRating] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showGlass, setShowGlass] = useState(true);
  const [showStyle, setShowStyle] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search breweries
  const searchBreweries = useCallback(async (q: string) => {
    if (q.length < 2) { setBreweries([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/breweries?q=${encodeURIComponent(q)}&limit=10`);
      const data = await res.json();
      setBreweries(data.breweries ?? data ?? []);
    } catch { setBreweries([]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchBreweries(search), 300);
    return () => clearTimeout(t);
  }, [search, searchBreweries]);

  // Build embed URL
  function getEmbedUrl() {
    if (!selectedBrewery) return "";
    const origin = window.location.origin;
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
    return `${origin}/embed/${selectedBrewery.id}/menu${qs ? `?${qs}` : ""}`;
  }

  // Build embed code
  function getEmbedCode() {
    if (!selectedBrewery) return "";
    const origin = window.location.origin;
    let attrs = `data-brewery="${selectedBrewery.id}"`;
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

  const C = {
    bg: "#F5F2ED",
    surface: "#FFFFFF",
    text: "#1A1714",
    muted: "#6B5E4E",
    subtle: "#9E8E7A",
    gold: "#D4A843",
    border: "#E5DDD0",
    dark: "#0F0E0C",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: C.text,
    }}>
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header style={{
        background: C.dark,
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke={C.gold} strokeWidth="2" />
            <circle cx="12" cy="12" r="4" fill={C.gold} />
          </svg>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13, fontWeight: 700, color: C.gold,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            HopTrack Embed Preview
          </span>
        </div>
        <a
          href="/for-breweries"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: C.subtle, textDecoration: "none",
            letterSpacing: "0.08em",
          }}
        >
          ← Back to HopTrack
        </a>
      </header>

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: 24,
        minHeight: "calc(100vh - 52px)",
      }}>
        {/* ─── Controls Panel ────────────────────────────────────────── */}
        <div style={{
          background: C.surface,
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          padding: 20,
          height: "fit-content",
          position: "sticky",
          top: 24,
        }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20, fontWeight: 700, fontStyle: "italic",
            margin: "0 0 16px", color: C.text,
          }}>
            Configure Embed
          </h2>

          {/* Brewery search */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, textTransform: "uppercase",
              letterSpacing: "0.15em", color: C.subtle,
              display: "block", marginBottom: 6,
            }}>
              Select Brewery
            </label>
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedBrewery(null); }}
              placeholder="Search breweries..."
              style={{
                width: "100%", padding: "10px 12px",
                borderRadius: 8, border: `1px solid ${C.border}`,
                fontSize: 14, fontFamily: "'DM Sans', sans-serif",
                background: C.bg, color: C.text,
                outline: "none", boxSizing: "border-box",
              }}
            />
            {/* Dropdown */}
            {breweries.length > 0 && !selectedBrewery && (
              <div style={{
                marginTop: 4, borderRadius: 8,
                border: `1px solid ${C.border}`,
                background: C.surface,
                maxHeight: 200, overflowY: "auto",
              }}>
                {breweries.map(b => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBrewery(b);
                      setSearch(b.name);
                      setBreweries([]);
                    }}
                    style={{
                      width: "100%", padding: "8px 12px",
                      background: "none", border: "none",
                      textAlign: "left", cursor: "pointer",
                      fontSize: 13, color: C.text,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    <strong>{b.name}</strong>
                    {b.city && (
                      <span style={{ color: C.subtle, marginLeft: 8, fontSize: 11 }}>
                        {b.city}{b.state ? `, ${b.state}` : ""}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {loading && (
              <p style={{ fontSize: 11, color: C.subtle, marginTop: 4 }}>Searching...</p>
            )}
          </div>

          {/* Theme toggle */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, textTransform: "uppercase",
              letterSpacing: "0.15em", color: C.subtle,
              display: "block", marginBottom: 6,
            }}>
              Theme
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["cream", "dark"] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  cursor: "pointer", fontSize: 12, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: theme === t ? C.dark : C.border,
                  color: theme === t ? C.gold : C.muted,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Layout toggle */}
          <div style={{ marginBottom: 14 }}>
            <label style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, textTransform: "uppercase",
              letterSpacing: "0.15em", color: C.subtle,
              display: "block", marginBottom: 6,
            }}>
              Layout
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {(["full", "compact"] as const).map(l => (
                <button key={l} onClick={() => setLayout(l)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none",
                  cursor: "pointer", fontSize: 12, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: layout === l ? C.dark : C.border,
                  color: layout === l ? C.gold : C.muted,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Field toggles */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9, textTransform: "uppercase",
              letterSpacing: "0.15em", color: C.subtle,
              display: "block", marginBottom: 8,
            }}>
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
              <label key={label} style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 6, cursor: "pointer",
              }}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={e => set(e.target.checked)}
                  style={{ accentColor: C.gold }}
                />
                <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
              </label>
            ))}
          </div>

          {/* Embed code */}
          {selectedBrewery && (
            <div>
              <label style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, textTransform: "uppercase",
                letterSpacing: "0.15em", color: C.subtle,
                display: "block", marginBottom: 6,
              }}>
                Embed Code
              </label>
              <pre style={{
                background: C.dark,
                color: "#E5DDD0",
                padding: 12,
                borderRadius: 8,
                fontSize: 10,
                lineHeight: 1.5,
                fontFamily: "'JetBrains Mono', monospace",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                margin: "0 0 8px",
              }}>
                {getEmbedCode()}
              </pre>
              <button
                onClick={copyEmbedCode}
                style={{
                  width: "100%", padding: "10px",
                  borderRadius: 8, border: "none",
                  cursor: "pointer", fontSize: 12, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: copied ? "#3D7A52" : C.gold,
                  color: copied ? "#FFFFFF" : C.dark,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  transition: "background 150ms",
                }}
              >
                {copied ? "Copied!" : "Copy Embed Code"}
              </button>
            </div>
          )}
        </div>

        {/* ─── Preview ───────────────────────────────────────────────── */}
        <div>
          {/* Mock website wrapper */}
          <div style={{
            background: theme === "dark" ? "#2A2A2A" : "#FFFFFF",
            borderRadius: 16,
            border: `1px solid ${theme === "dark" ? "#3A3A3A" : C.border}`,
            overflow: "hidden",
            minHeight: 500,
          }}>
            {/* Fake browser chrome */}
            <div style={{
              background: theme === "dark" ? "#1E1E1E" : "#F5F5F5",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              borderBottom: `1px solid ${theme === "dark" ? "#3A3A3A" : "#E0E0E0"}`,
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#FEBC2E" }} />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#28C840" }} />
              </div>
              <div style={{
                flex: 1, background: theme === "dark" ? "#333" : "#FFFFFF",
                borderRadius: 6, padding: "4px 12px",
                fontSize: 11, color: theme === "dark" ? "#999" : "#666",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {selectedBrewery
                  ? `${selectedBrewery.name.toLowerCase().replace(/\s+/g, "")}.com/beer-menu`
                  : "yourbrewery.com/beer-menu"
                }
              </div>
            </div>

            {/* Mock page content */}
            <div style={{ padding: 32 }}>
              {!selectedBrewery ? (
                <div style={{
                  textAlign: "center", padding: "80px 24px",
                }}>
                  <p style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 24, fontStyle: "italic",
                    color: theme === "dark" ? "#666" : "#CCC",
                    marginBottom: 12,
                  }}>
                    Select a brewery to preview
                  </p>
                  <p style={{
                    fontSize: 14,
                    color: theme === "dark" ? "#555" : "#BBB",
                  }}>
                    Search for a brewery in the controls panel to see the embed in action
                  </p>
                </div>
              ) : (
                <>
                  {/* Mock brewery website content above the embed */}
                  <h2 style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 28, fontWeight: 400,
                    color: theme === "dark" ? "#DDD" : "#333",
                    marginBottom: 8,
                  }}>
                    Our Beer Menu
                  </h2>
                  <p style={{
                    fontSize: 14, lineHeight: 1.6,
                    color: theme === "dark" ? "#999" : "#666",
                    marginBottom: 24, maxWidth: 500,
                  }}>
                    Check out what&apos;s currently on tap. Our menu updates in real-time
                    through HopTrack.
                  </p>

                  {/* The actual embed */}
                  <iframe
                    src={getEmbedUrl()}
                    style={{
                      width: "100%",
                      border: "none",
                      borderRadius: 12,
                      minHeight: 400,
                      overflow: "hidden",
                      boxShadow: theme === "dark"
                        ? "0 4px 24px rgba(0,0,0,0.3)"
                        : "0 4px 24px rgba(0,0,0,0.08)",
                    }}
                    title="HopTrack Beer Menu Preview"
                    loading="lazy"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
