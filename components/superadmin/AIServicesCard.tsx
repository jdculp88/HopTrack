"use client";

import { useState } from "react";
import { Bot, ArrowUpRight, Loader2, Database, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface AIServicesCardProps {
  barbackPendingCount: number;
  barbackLastCrawl: string | null;
  barbackTotalCost: number;
}

export function AIServicesCard({ barbackPendingCount, barbackLastCrawl, barbackTotalCost }: AIServicesCardProps) {
  const [triggering, setTriggering] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const res = await fetch("/api/superadmin/barback/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (res.ok) {
        setToast(`Crawl queued: ${json.data?.sourcesQueued ?? 0} sources`);
      } else {
        setToast(res.status === 429 ? "Rate limited — try again in 5 minutes" : "Failed to trigger crawl");
      }
    } catch {
      setToast("Failed to trigger crawl");
    } finally {
      setTriggering(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 1) return "< 1h ago";
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card padding="spacious">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} style={{ color: "var(--accent-gold)" }} />
          <CardTitle as="h3">AI Services</CardTitle>
        </div>
        <Link
          href="/superadmin/barback"
          className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: "var(--accent-gold)" }}
        >
          Barback <ArrowUpRight size={12} />
        </Link>
      </CardHeader>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Database size={12} style={{ color: "var(--text-muted)" }} />
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Pending Review
            </p>
          </div>
          <p className="font-display text-xl font-bold" style={{ color: barbackPendingCount > 0 ? "var(--accent-gold)" : "var(--text-primary)" }}>
            {barbackPendingCount}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={12} style={{ color: "var(--text-muted)" }} />
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Last Crawl
            </p>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {formatDate(barbackLastCrawl)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign size={12} style={{ color: "var(--text-muted)" }} />
            <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Total Cost
            </p>
          </div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            ${barbackTotalCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Trigger button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:opacity-80 disabled:opacity-40"
          style={{
            background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
            color: "var(--accent-gold)",
            border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
          }}
        >
          {triggering ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
          Run Crawl
        </button>
        {toast && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{toast}</span>
        )}
      </div>
    </Card>
  );
}
