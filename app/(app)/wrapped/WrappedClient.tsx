"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Beer, Loader2 } from "lucide-react";
import Link from "next/link";
import { WrappedExperience } from "@/components/wrapped/WrappedExperience";
import type { WrappedStats } from "@/lib/wrapped";

export function WrappedClient({ username }: { username: string }) {
  const [stats, setStats] = useState<WrappedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWrapped() {
      try {
        const res = await fetch("/api/wrapped");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setStats(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWrapped();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--danger)" }}>Something went wrong</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{error}</p>
        </div>
      </div>
    );
  }

  // Empty state — no sessions
  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Beer size={40} className="mx-auto mb-4" style={{ color: "var(--accent-gold)" }} />
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Your story starts with a pour
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Start a session at a brewery or at home to build your Wrapped.
            Every beer tells a part of your story.
          </p>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            Start Your Journey
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <WrappedExperience stats={stats} username={username} />
    </div>
  );
}
