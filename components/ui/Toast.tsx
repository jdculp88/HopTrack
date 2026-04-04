"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{
      toast: addToast,
      success: (m) => addToast(m, "success"),
      error:   (m) => addToast(m, "error"),
      info:    (m) => addToast(m, "info"),
    }}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// ─── Visual layer ──────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  success: CheckCircle,
  error:   AlertCircle,
  info:    Info,
};

const COLORS: Record<ToastType, { border: string; icon: string }> = {
  success: { border: "color-mix(in srgb, var(--success) 50%, transparent)",   icon: "var(--success)" },
  error:   { border: "color-mix(in srgb, var(--danger) 50%, transparent)",   icon: "var(--danger)" },
  info:    { border: "color-mix(in srgb, var(--accent-gold) 40%, transparent)",  icon: "var(--accent-gold)" },
};

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  // Split toasts by type so error toasts use assertive and others use polite
  const errorToasts = toasts.filter((t) => t.type === "error");
  const politeToasts = toasts.filter((t) => t.type !== "error");

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      style={{ width: "min(360px, calc(100vw - 2rem))" }}
    >
      {/* Polite live region — announces success/info toasts after current speech finishes */}
      <div aria-live="polite" role="status" aria-atomic="false" aria-relevant="additions">
        <AnimatePresence initial={false}>
          {politeToasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      </div>
      {/* Assertive live region — interrupts immediately for error toasts */}
      <div aria-live="assertive" role="alert" aria-atomic="false" aria-relevant="additions">
        <AnimatePresence initial={false}>
          {errorToasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToastItem({ toast: t, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = ICONS[t.type];
  const { border, icon } = COLORS[t.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl"
      style={{
        background: "var(--surface)",
        border: `1px solid ${border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.35)`,
      }}
    >
      <Icon size={16} style={{ color: icon, flexShrink: 0, marginTop: 2 }} />
      <p
        className="flex-1 text-sm leading-snug"
        style={{ color: "var(--text-primary)" }}
      >
        {t.message}
      </p>
      <button
        onClick={() => onDismiss(t.id)}
        className="flex-shrink-0 transition-opacity hover:opacity-100"
        style={{ color: "var(--text-muted)", opacity: 0.5, marginTop: 1 }}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
