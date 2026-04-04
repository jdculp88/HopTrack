"use client";

import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { C, type BoardSettings, type FontSize } from "./board-types";

interface BoardHeaderProps {
  breweryName: string;
  initials: string;
  activeBeerCount: number;
  hasMultipleTypes: boolean;
  settingsOpen: boolean;
  draftSettings: BoardSettings;
  onOpenSettings: () => void;
  onCancelSettings: () => void;
  onApplySettings: () => void;
  onDraftChange: <K extends keyof BoardSettings>(key: K, value: BoardSettings[K]) => void;
}

export function BoardHeader({
  breweryName,
  initials,
  activeBeerCount,
  hasMultipleTypes,
  settingsOpen,
  draftSettings,
  onOpenSettings,
  onCancelSettings,
  onApplySettings,
  onDraftChange,
}: BoardHeaderProps) {
  return (
    <>
      {/* ── Header bar ────────────────────────────────────────────────── */}
      <header style={{ padding: "28px 40px 20px", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
            {/* Brewery initials badge */}
            <div style={{
              width: 56, height: 56, borderRadius: 14, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#0F0E0C",
            }}>
              <span className="font-mono" style={{ fontWeight: 800, fontSize: 18, color: C.gold, letterSpacing: 1 }}>
                {initials}
              </span>
            </div>

            {/* Brewery name */}
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400, fontStyle: "italic",
              fontSize: "clamp(64px, 7vw, 100px)",
              lineHeight: 1, letterSpacing: "-0.01em",
              color: C.text, flex: 1, minWidth: 0,
            }}>
              {breweryName}
            </h1>
          </div>

          {/* On tap count */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span className="font-mono" style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.22em", color: C.gold }}>
              {hasMultipleTypes ? "On Menu" : "On Tap"}
            </span>
            <span className="font-mono" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1, color: C.gold }}>
              {activeBeerCount}
            </span>
          </div>
        </div>

        {/* Settings gear button */}
        <button
          onClick={settingsOpen ? onCancelSettings : onOpenSettings}
          style={{
            position: "absolute", top: 16, right: 40,
            padding: 8, borderRadius: 10, border: "none",
            background: "transparent", cursor: "pointer",
            color: C.textSubtle, zIndex: 10,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.textMuted)}
          onMouseLeave={e => (e.currentTarget.style.color = C.textSubtle)}
        >
          <Settings size={20} />
        </button>

        {/* Divider */}
        <div style={{ marginTop: 20, height: 1, background: "rgba(26,23,20,0.12)" }} />
      </header>

      {/* ── Settings panel ────────────────────────────────────────────── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{
              overflow: "hidden", margin: "0 40px 8px",
              borderRadius: 12, border: `1px solid ${C.border}`, flexShrink: 0,
            }}
          >
            <div style={{
              padding: "12px 20px",
              background: "rgba(251,247,240,0.97)", backdropFilter: "blur(12px)",
            }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, marginBottom: 10 }}>
                {/* Font size pills */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="font-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>
                    Size
                  </span>
                  {(["medium", "large", "xl"] as FontSize[]).map(s => (
                    <button
                      key={s}
                      onClick={() => onDraftChange("fontSize", s)}
                      style={{
                        padding: "4px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                        fontSize: 11, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                        background: draftSettings.fontSize === s ? "#0F0E0C" : C.border,
                        color: draftSettings.fontSize === s ? "#F5F0E8" : C.textMuted,
                        fontWeight: 600,
                      }}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Toggle checkboxes */}
                {([
                  { label: "Glass",  key: "showGlass"  as const, val: draftSettings.showGlass },
                  { label: "Style",  key: "showStyle"  as const, val: draftSettings.showStyle },
                  { label: "ABV",    key: "showABV"    as const, val: draftSettings.showABV },
                  { label: "Desc",   key: "showDesc"   as const, val: draftSettings.showDesc },
                  { label: "Price",  key: "showPrice"  as const, val: draftSettings.showPrice },
                  { label: "Rating", key: "showRating" as const, val: draftSettings.showRating },
                  { label: "Stats",  key: "showStats"  as const, val: draftSettings.showStats },
                ]).map(({ label, key, val }) => (
                  <label key={label} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={e => onDraftChange(key, e.target.checked)}
                      style={{ accentColor: C.gold }}
                    />
                    <span className="font-mono" style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
                  </label>
                ))}
              </div>

              {/* Preview label + apply / cancel */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: 8, borderTop: `1px solid ${C.border}`,
              }}>
                <span className="font-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: C.textSubtle }}>
                  Previewing below ↓
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={onCancelSettings}
                    style={{
                      padding: "5px 14px", borderRadius: 8, border: `1px solid ${C.border}`,
                      fontSize: 12, cursor: "pointer", background: "transparent", color: C.textMuted,
                      fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onApplySettings}
                    style={{
                      padding: "5px 14px", borderRadius: 8, border: "none",
                      fontSize: 12, cursor: "pointer", background: "#0F0E0C", color: C.gold,
                      fontWeight: 700, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                    }}
                  >
                    Apply to Display
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
