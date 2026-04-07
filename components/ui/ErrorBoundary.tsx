"use client";

import React, { Component, type ReactNode, type ErrorInfo } from "react";
import { motion } from "motion/react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Context label for logging (e.g. "SessionRecap", "TapList") */
  context?: string;
  /** Show a minimal inline error instead of a full-page fallback */
  inline?: boolean;
  /** Called when reset is triggered */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  eventId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, eventId: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, eventId: null };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const context = this.props.context ?? "Unknown";
    // Structured log for Vercel Log Drain
    if (typeof window === "undefined") return;
    try {
      const payload = {
        level: "error",
        context: `ErrorBoundary/${context}`,
        message: error.message,
        stack: error.stack?.split("\n").slice(0, 5).join("\n"),
        componentStack: info.componentStack?.split("\n").slice(0, 5).join("\n"),
        timestamp: new Date().toISOString(),
      };
      console.error(JSON.stringify(payload));
    } catch {
      // Never throw from componentDidCatch
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null, eventId: null });
    this.props.onReset?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;
    if (this.props.inline) return <InlineError onRetry={this.reset} />;
    return <FullPageError onRetry={this.reset} />;
  }
}

function InlineError({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl"
      style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
    >
      <AlertTriangle size={24} style={{ color: "var(--danger)" }} />
      <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
        Something went wrong loading this section.
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl"
        style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
      >
        <RefreshCw size={14} />
        Try again
      </button>
    </motion.div>
  );
}

function FullPageError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex flex-col items-center gap-4 text-center max-w-sm"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)" }}
        >
          <AlertTriangle size={28} style={{ color: "var(--danger)" }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Something went wrong
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            We hit an unexpected error. Your data is safe — this is just a display issue.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl min-h-[44px]"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
          >
            <RefreshCw size={16} />
            Try again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl min-h-[44px]"
            style={{ background: "var(--surface-2)", color: "var(--text-primary)" }}
          >
            <Home size={16} />
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

/** Convenience wrapper for wrapping pages server-side via a client boundary shell */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<Props, "children"> = {}
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `WithErrorBoundary(${Component.displayName ?? Component.name})`;
  return Wrapped;
}
