// Copyright 2026 HopTrack. All rights reserved.
// Sprint 161 — The Vibe
// Floating context menu triggered by long-press, with Liquid Glass surface.
"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useHaptic } from "@/hooks/useHaptic";

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  /** Whether the menu is visible */
  open: boolean;
  /** Viewport coords of the press origin */
  anchor: { x: number; y: number } | null;
  /** Menu items */
  items: ContextMenuItem[];
  /** Called when menu should close (tap outside, select item, escape) */
  onClose: () => void;
}

const MENU_WIDTH = 220;
const EDGE_PADDING = 12;

export function ContextMenu({ open, anchor, items, onClose }: ContextMenuProps) {
  const { haptic } = useHaptic();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Compute position with edge flipping
  const position = computePosition(anchor);

  return (
    <AnimatePresence>
      {open && anchor && (
        <>
          {/* Backdrop — tap outside to close */}
          <motion.div
            key="ctx-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[150]"
            style={{ background: "rgba(0, 0, 0, 0.25)", backdropFilter: "blur(2px)" }}
            onClick={onClose}
            onPointerDown={(e) => {
              // Cancel any lingering long-press gesture on the underlying element
              e.stopPropagation();
            }}
          />

          {/* Menu panel */}
          <motion.div
            ref={menuRef}
            key="ctx-menu"
            initial={{ opacity: 0, scale: 0.85, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="fixed z-[151] rounded-2xl overflow-hidden backdrop-blur-xl"
            style={{
              left: position.left,
              top: position.top,
              width: MENU_WIDTH,
              transformOrigin: position.origin,
              background: "color-mix(in srgb, var(--surface) 78%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent-gold) 22%, var(--border))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 0 0 1px color-mix(in srgb, var(--accent-gold) 10%, transparent), 0 20px 50px rgba(0,0,0,0.55)",
            }}
            role="menu"
          >
            {/* Gloss overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.00) 80%)",
              }}
            />
            <ul className="relative py-1.5">
              {items.map((item, i) => (
                <li key={i} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) return;
                      haptic("selection");
                      item.onSelect();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      color: item.destructive
                        ? "var(--danger)"
                        : "var(--text-primary)",
                    }}
                  >
                    {item.icon && (
                      <span
                        className="flex-shrink-0"
                        style={{
                          color: item.destructive
                            ? "var(--danger)"
                            : "var(--text-muted)",
                        }}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="font-sans">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function computePosition(anchor: { x: number; y: number } | null): {
  left: number;
  top: number;
  origin: string;
} {
  if (typeof window === "undefined" || !anchor) {
    return { left: 0, top: 0, origin: "top left" };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Estimate menu height — items × ~42px + padding
  const estHeight = 200;

  let left = anchor.x;
  let top = anchor.y;
  let originX = "left";
  let originY = "top";

  // Flip horizontally if too close to right edge
  if (left + MENU_WIDTH + EDGE_PADDING > vw) {
    left = anchor.x - MENU_WIDTH;
    originX = "right";
  }
  if (left < EDGE_PADDING) {
    left = EDGE_PADDING;
    originX = "left";
  }

  // Flip vertically if too close to bottom edge
  if (top + estHeight + EDGE_PADDING > vh) {
    top = anchor.y - estHeight;
    originY = "bottom";
  }
  if (top < EDGE_PADDING) {
    top = EDGE_PADDING;
    originY = "top";
  }

  return { left, top, origin: `${originY} ${originX}` };
}
