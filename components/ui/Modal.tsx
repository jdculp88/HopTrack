"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHaptic } from "@/hooks/useHaptic";
import { spring, variants } from "@/lib/animation";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const SIZES = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-none w-full h-full m-0 rounded-none",
};

export function Modal({ open, onClose, title, children, size = "md", className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { haptic } = useHaptic();
  const handleClose = () => { haptic("tap"); onClose(); };

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      // Focus first focusable element on open
      setTimeout(() => {
        const el = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        el?.focus();
      }, 50);
    } else {
      // Restore focus to trigger element on close
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            {...variants.fadeIn}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={spring.default}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.velocity.y > 300 || info.offset.y > 100) {
                handleClose();
              }
            }}
            className={cn(
              "relative w-full border backdrop-blur-2xl",
              "rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden",
              "max-h-[90vh] sm:max-h-[85vh] flex flex-col",
              SIZES[size],
              className
            )}
            style={{
              background: "color-mix(in srgb, var(--surface) 78%, transparent)",
              borderColor: "color-mix(in srgb, var(--accent-gold) 18%, var(--border))",
              boxShadow:
                "0 0 0 1px color-mix(in srgb, var(--accent-gold) 15%, transparent) inset, 0 20px 50px rgba(0,0,0,0.55)",
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
          >
            {/* Liquid Glass gloss overlay (Sprint 161 — The Vibe) */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.00) 65%, rgba(255,255,255,0.06) 100%)",
              }}
            />
            {/* Drag handle — mobile bottom sheet indicator */}
            <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0 relative z-[1]">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0 relative z-[1]">
                <h2 id="modal-title" className="font-display text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
                <button
                  onClick={handleClose}
                  aria-label="Close dialog"
                  className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto overscroll-contain relative z-[1]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Full-screen drawer variant (for check-in flow)
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function FullScreenDrawer({ open, onClose, children, className, "aria-label": ariaLabel }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      // Focus first focusable element on open
      setTimeout(() => {
        const el = drawerRef.current?.querySelector<HTMLElement>(FOCUSABLE);
        el?.focus();
      }, 50);
    } else {
      // Restore focus to trigger element on close
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          {...variants.fadeIn}
          className="fixed inset-0 z-50 bg-[var(--bg)]"
        >
          <motion.div
            ref={drawerRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring.gentle}
            className={cn("h-full flex flex-col", className)}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
