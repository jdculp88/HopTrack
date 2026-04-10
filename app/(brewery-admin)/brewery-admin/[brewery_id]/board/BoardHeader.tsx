"use client";

import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  C, FORMAT_LABELS, FORMAT_FORCED,
  type BoardSettings, type FontSize, type BoardDisplayFormat, type DisplayScale,
} from "./board-types";
import { PRESET_THEMES, PRESET_THEME_ORDER } from "@/lib/board-themes";
import { SCALE_LABELS } from "@/lib/board-display-scale";

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
  onFormatChange: (format: BoardDisplayFormat) => void;
}

const FORMATS: BoardDisplayFormat[] = ["classic", "compact", "slideshow"];

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
  onFormatChange,
}: BoardHeaderProps) {
  const forcedKeys = new Set(Object.keys(FORMAT_FORCED[draftSettings.displayFormat] ?? {}));
  const hideFontSize = draftSettings.displayFormat === "slideshow";

  // Sprint A: header redesigned to be ~45% shorter than Sprint 167 so more of the tap list is visible on a TV.
  return (
    <>
      {/* Header bar — Sprint A: shrunk so more of the tap list is visible on a TV */}
      <header style={{ padding: "16px 40px 10px", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
            {/* Brewery initials badge */}
            <div style={{
              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#0F0E0C",
            }}>
              <span className="font-mono" style={{ fontWeight: 800, fontSize: 14, color: C.gold, letterSpacing: 1 }}>
                {initials}
              </span>
            </div>

            {/* Brewery name */}
            <h1 style={{
              fontFamily: "'Instrument Serif', serif",
              fontWeight: 400, fontStyle: "italic",
              fontSize: "clamp(38px, 4.5vw, 68px)",
              lineHeight: 1, letterSpacing: "-0.01em",
              color: C.text, flex: 1, minWidth: 0,
            }}>
              {breweryName}
            </h1>
          </div>

          {/* On tap count */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
            <span className="font-mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em", color: C.gold }}>
              {hasMultipleTypes ? "On Menu" : "On Tap"}
            </span>
            <span className="font-mono" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1, color: C.gold }}>
              {activeBeerCount}
            </span>
          </div>
        </div>

        {/* Settings gear */}
        <button
          onClick={settingsOpen ? onCancelSettings : onOpenSettings}
          style={{
            position: "absolute", top: 12, right: 40,
            padding: 6, borderRadius: 8, border: "none",
            background: "transparent", cursor: "pointer",
            color: C.textSubtle, zIndex: 10,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.textMuted)}
          onMouseLeave={e => (e.currentTarget.style.color = C.textSubtle)}
        >
          <Settings size={18} />
        </button>

        <div style={{ marginTop: 12, height: 1, background: "rgba(26,23,20,0.12)" }} />
      </header>

      {/* Settings panel */}
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
              {/* Format selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span className="font-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>
                  Format
                </span>
                {FORMATS.map(f => (
                  <button
                    key={f}
                    onClick={() => onFormatChange(f)}
                    style={{
                      padding: "4px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                      fontSize: 11, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      background: draftSettings.displayFormat === f ? "#0F0E0C" : C.border,
                      color: draftSettings.displayFormat === f ? "#F5F0E8" : C.textMuted,
                      fontWeight: 600,
                    }}
                  >
                    {FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>

              {/* Sprint A: Theme selector (10 preset swatches) */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span className="font-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>
                  Theme
                </span>
                {PRESET_THEME_ORDER.map(id => {
                  const t = PRESET_THEMES[id];
                  const active = (draftSettings.themeId ?? "cream-classic") === id;
                  return (
                    <button
                      key={id}
                      onClick={() => onDraftChange("themeId", id)}
                      title={t.name}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "4px 10px 4px 4px", borderRadius: 99,
                        border: active ? `1.5px solid ${C.text}` : `1px solid ${C.border}`,
                        cursor: "pointer",
                        fontSize: 11, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                        background: active ? "#0F0E0C" : "transparent",
                        color: active ? "#F5F0E8" : C.textMuted,
                        fontWeight: 600,
                      }}
                    >
                      {/* Swatch: bg + accent dots */}
                      <span style={{
                        display: "inline-flex", width: 20, height: 20, borderRadius: "50%",
                        background: t.palette.bg,
                        border: `1px solid ${t.palette.border}`,
                        position: "relative", flexShrink: 0,
                      }}>
                        <span style={{
                          position: "absolute", top: 3, left: 3, width: 6, height: 6, borderRadius: "50%",
                          background: t.palette.accent,
                        }} />
                        <span style={{
                          position: "absolute", bottom: 3, right: 3, width: 5, height: 5, borderRadius: "50%",
                          background: t.palette.text,
                        }} />
                      </span>
                      {t.name}
                    </button>
                  );
                })}
              </div>

              {/* Sprint A: Display scale selector (monitor / large-tv / cinema) */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                <span className="font-mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: C.textSubtle }}>
                  Scale
                </span>
                {(["auto", "monitor", "large-tv", "cinema"] as DisplayScale[]).map(s => (
                  <button
                    key={s}
                    onClick={() => onDraftChange("displayScale", s)}
                    title={`${SCALE_LABELS[s]} — for ${s === "cinema" ? "75\"+ 4K TVs at 15–25 ft" : s === "large-tv" ? "55–65\" 1080p TVs at 10–15 ft" : s === "monitor" ? "desktop monitors at 3–4 ft" : "automatic detection"}`}
                    style={{
                      padding: "4px 12px", borderRadius: 99, border: "none", cursor: "pointer",
                      fontSize: 11, fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                      background: (draftSettings.displayScale ?? "auto") === s ? "#0F0E0C" : C.border,
                      color: (draftSettings.displayScale ?? "auto") === s ? "#F5F0E8" : C.textMuted,
                      fontWeight: 600,
                    }}
                  >
                    {SCALE_LABELS[s]}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, marginBottom: 10 }}>
                {/* Font size pills */}
                {!hideFontSize && (
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
                )}

                {/* Toggle checkboxes */}
                {([
                  { label: "Glass",  key: "showGlass"  as const, val: draftSettings.showGlass },
                  { label: "Style",  key: "showStyle"  as const, val: draftSettings.showStyle },
                  { label: "ABV",    key: "showABV"    as const, val: draftSettings.showABV },
                  { label: "Desc",   key: "showDesc"   as const, val: draftSettings.showDesc },
                  { label: "Price",  key: "showPrice"  as const, val: draftSettings.showPrice },
                  { label: "Rating", key: "showRating" as const, val: draftSettings.showRating },
                  { label: "Stats",  key: "showStats"  as const, val: draftSettings.showStats },
                ]).map(({ label, key, val }) => {
                  const isForced = forcedKeys.has(key);
                  return (
                    <label key={label} style={{
                      display: "flex", alignItems: "center", gap: 6,
                      cursor: isForced ? "not-allowed" : "pointer",
                      opacity: isForced ? 0.4 : 1,
                    }}>
                      <input
                        type="checkbox"
                        checked={isForced ? false : val}
                        disabled={isForced}
                        onChange={e => onDraftChange(key, e.target.checked)}
                        style={{ accentColor: C.gold }}
                      />
                      <span className="font-mono" style={{ fontSize: 12, color: C.textMuted }}>{label}</span>
                    </label>
                  );
                })}
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
