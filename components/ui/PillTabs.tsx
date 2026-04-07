"use client";

// PillTabs — Sprint 160 (The Flow)
// Owner: Alex + Dakota
//
// Reusable tab primitive consolidating 5+ custom pill/tab implementations.
// Three variants: underline (default, FeedTabBar-style), pill (gold-tint),
// segmented (iOS-style knob). ARIA tablist, roving tabindex, haptic feedback.

import { useRef, useCallback, type CSSProperties, type ReactNode, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PILL_ACTIVE, PILL_INACTIVE } from "@/lib/constants/ui";
import { spring } from "@/lib/animation";
import { useHaptic } from "@/hooks/useHaptic";

export interface PillTab<K extends string = string> {
  key: K;
  label: string;
  count?: number;
  icon?: ReactNode;
  disabled?: boolean;
  hidden?: boolean;
}

export type PillTabsVariant = "underline" | "pill" | "segmented";
export type PillTabsSize = "sm" | "md";

export interface PillTabsProps<K extends string = string> {
  tabs: readonly PillTab<K>[];
  value: K;
  onChange: (key: K) => void;
  ariaLabel: string;
  variant?: PillTabsVariant;
  size?: PillTabsSize;
  fullWidth?: boolean;
  snapScroll?: boolean;
  sticky?: { top: number | string } | false;
  className?: string;
}

// Slugify ariaLabel for unique layoutId namespace
function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function PillTabs<K extends string = string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  variant = "underline",
  size = "md",
  fullWidth = false,
  snapScroll = false,
  sticky = false,
  className = "",
}: PillTabsProps<K>) {
  const reducedMotion = useReducedMotion();
  const { haptic } = useHaptic();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const layoutPrefix = slugify(ariaLabel);

  const visibleTabs = tabs.filter((t) => !t.hidden);

  const handleChange = useCallback(
    (key: K) => {
      if (key === value) return;
      haptic("selection");
      onChange(key);
    },
    [value, onChange, haptic]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, currentKey: K) => {
      const enabledTabs = visibleTabs.filter((t) => !t.disabled);
      const currentIdx = enabledTabs.findIndex((t) => t.key === currentKey);
      if (currentIdx === -1) return;

      let nextIdx = currentIdx;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        nextIdx = (currentIdx + 1) % enabledTabs.length;
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        nextIdx = (currentIdx - 1 + enabledTabs.length) % enabledTabs.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = enabledTabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      const nextKey = enabledTabs[nextIdx].key;
      handleChange(nextKey);
      // Focus the newly active tab
      requestAnimationFrame(() => {
        tabRefs.current[nextKey]?.focus();
      });
    },
    [visibleTabs, handleChange]
  );

  // ─── Container styling ──────────────────────────────────────────────────
  const containerClasses = [
    "relative flex",
    snapScroll ? "overflow-x-auto scrollbar-hide snap-x snap-proximity" : "",
    sticky ? "sticky z-30 backdrop-blur-md" : "",
    variant === "segmented" ? "rounded-xl p-1" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerStyle: CSSProperties = {
    ...(sticky && typeof sticky === "object"
      ? { top: typeof sticky.top === "number" ? `${sticky.top}px` : sticky.top }
      : {}),
    ...(sticky ? { background: "color-mix(in srgb, var(--bg) 85%, transparent)" } : {}),
    ...(variant === "segmented" ? { background: "var(--surface-2)" } : {}),
  };

  // ─── Tab list styling ───────────────────────────────────────────────────
  const listClasses = [
    "flex",
    variant === "pill" ? "gap-2" : "",
    variant === "segmented" ? "gap-1 flex-1" : "",
    snapScroll ? "w-max" : "w-full",
  ]
    .filter(Boolean)
    .join(" ");

  // ─── Per-tab styling ────────────────────────────────────────────────────
  const sizeClasses = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm";
  const buttonBaseClasses = "relative transition-colors whitespace-nowrap font-medium";

  const getTabClasses = (active: boolean, disabled: boolean): string => {
    const classes = [buttonBaseClasses, sizeClasses];
    if (fullWidth) classes.push("flex-1");
    if (snapScroll) classes.push("snap-start");
    if (variant === "pill") classes.push("rounded-full border");
    if (variant === "segmented") classes.push("rounded-lg flex-1");
    if (variant === "underline") classes.push("py-3");
    if (disabled) classes.push("opacity-40 cursor-not-allowed");
    else classes.push("cursor-pointer");
    return classes.join(" ");
  };

  const getTabStyle = (active: boolean): CSSProperties => {
    if (variant === "underline") {
      return {
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        fontWeight: active ? 600 : 400,
        letterSpacing: "0.3px",
        // Sprint 171: Active tab gets subtle fill background for visibility
        background: active ? "color-mix(in srgb, var(--accent-gold) 8%, transparent)" : "transparent",
        borderRadius: active ? "8px 8px 0 0" : undefined,
      };
    }
    if (variant === "pill") {
      return active ? PILL_ACTIVE : PILL_INACTIVE;
    }
    if (variant === "segmented") {
      return {
        color: active ? "var(--text-primary)" : "var(--text-muted)",
        fontWeight: active ? 600 : 500,
      };
    }
    return {};
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={containerClasses}
      style={containerStyle}
    >
      <div className={listClasses}>
        {visibleTabs.map((tab) => {
          const active = tab.key === value;
          const disabled = !!tab.disabled;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[tab.key] = el;
              }}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${layoutPrefix}-panel-${tab.key}`}
              aria-disabled={disabled || undefined}
              tabIndex={active ? 0 : -1}
              disabled={disabled}
              onClick={() => !disabled && handleChange(tab.key)}
              onKeyDown={(e) => !disabled && handleKeyDown(e, tab.key)}
              className={getTabClasses(active, disabled)}
              style={getTabStyle(active)}
            >
              {/* Segmented knob — absolute-positioned with layoutId */}
              {variant === "segmented" && active && (
                <motion.span
                  layoutId={`${layoutPrefix}-segmented-knob`}
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "var(--card-bg)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                    zIndex: 0,
                  }}
                  transition={reducedMotion ? { duration: 0 } : spring.default}
                />
              )}
              {/* Content — z-indexed above knob */}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {tab.icon && <span className="inline-flex items-center">{tab.icon}</span>}
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span
                    className="ml-0.5 font-mono text-[0.85em] opacity-70"
                    style={{ fontWeight: 500 }}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
              {/* Underline — absolute-positioned with layoutId */}
              {/* Sprint 171: h-0.5 → h-[3px] for visibility */}
              {variant === "underline" && active && (
                <motion.span
                  layoutId={`${layoutPrefix}-underline`}
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-full"
                  style={{ background: "var(--accent-gold)" }}
                  transition={reducedMotion ? { duration: 0 } : spring.default}
                />
              )}
            </button>
          );
        })}
      </div>
      {/* Underline baseline */}
      {variant === "underline" && (
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "var(--border)" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
