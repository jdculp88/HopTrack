"use client";

import { useState, useEffect, useCallback } from "react";
import { Plug, RefreshCw, Loader2, ArrowUpRight, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

interface PosConnection {
  id: string;
  provider: string;
  status: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_item_count: number;
  connected_at: string;
  health: "green" | "yellow" | "red";
}

interface PosDashboardCardProps {
  breweryId: string;
}

const healthColor: Record<string, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
};

const healthLabel: Record<string, string> = {
  green: "Healthy",
  yellow: "Stale",
  red: "Error",
};

export function PosDashboardCard({ breweryId }: PosDashboardCardProps) {
  const [connections, setConnections] = useState<PosConnection[]>([]);
  const [unmappedCount, setUnmappedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { success, error: toastError } = useToast();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/pos/status?brewery_id=${breweryId}`);
      if (res.ok) {
        const json = await res.json();
        const conns: PosConnection[] = json.data?.connections || [];
        setConnections(conns);

        // Fetch unmapped count if we have active connections
        if (conns.some(c => c.status === "active")) {
          const mapRes = await fetch(`/api/pos/mapping?brewery_id=${breweryId}`);
          if (mapRes.ok) {
            const mapJson = await mapRes.json();
            setUnmappedCount(mapJson.data?.unmapped_count ?? 0);
          }
        }
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, [breweryId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function handleSync(provider: string) {
    setSyncing(provider);
    try {
      const res = await fetch(`/api/pos/sync/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: breweryId }),
      });
      const json = await res.json();
      if (res.ok) {
        const d = json.data;
        success(`Sync complete! +${d.items_added} added, ${d.items_updated} updated, ${d.items_removed} removed`);
        fetchStatus();
      } else {
        toastError(json.error?.message || "Sync failed");
      }
    } catch {
      toastError("Sync failed");
    } finally {
      setSyncing(null);
    }
  }

  const activeConnections = connections.filter(c => c.status === "active");

  if (loading) {
    return (
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Plug size={14} style={{ color: "var(--accent-gold)" }} />
          <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>POS Sync</h3>
        </div>
        <div className="flex items-center justify-center py-4">
          <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      </div>
    );
  }

  // No connections — show CTA
  if (activeConnections.length === 0) {
    return (
      <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Plug size={14} style={{ color: "var(--accent-gold)" }} />
          <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>POS Sync</h3>
        </div>
        <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
          Connect your POS to keep your tap list in sync automatically.
        </p>
        <Link
          href={`/brewery-admin/${breweryId}/settings`}
          className="text-xs font-semibold flex items-center gap-1"
          style={{ color: "var(--accent-gold)" }}
        >
          Connect POS <ArrowUpRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Plug size={14} style={{ color: "var(--accent-gold)" }} />
          <h3 className="font-display font-bold" style={{ color: "var(--text-primary)" }}>POS Sync</h3>
        </div>
        <Link
          href={`/brewery-admin/${breweryId}/pos-sync`}
          className="text-[10px] flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: "var(--accent-gold)" }}
        >
          Sync Log <ArrowUpRight size={10} />
        </Link>
      </div>

      <div className="space-y-3">
        {activeConnections.map(conn => {
          const isSyncing = syncing === conn.provider;

          return (
            <div key={conn.id} className="rounded-xl p-3" style={{ background: "var(--surface-2)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{conn.provider === "toast" ? "🍞" : "⬛"}</span>
                  <span className="text-sm font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                    {conn.provider}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: healthColor[conn.health] }}
                  />
                  <span className="text-[10px] font-mono" style={{ color: healthColor[conn.health] }}>
                    {healthLabel[conn.health]}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[10px] space-y-0.5" style={{ color: "var(--text-muted)" }}>
                  <p>Last sync: {formatTimeAgo(conn.last_sync_at)}</p>
                  <p>{conn.last_sync_item_count} items synced</p>
                </div>
                <button
                  onClick={() => handleSync(conn.provider)}
                  disabled={isSyncing}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition-colors min-h-[32px]"
                  style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  {isSyncing ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                  Sync
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unmapped badge */}
      <AnimatePresence>
        {unmappedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Link
              href={`/brewery-admin/${breweryId}/settings`}
              className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-opacity hover:opacity-80"
              style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}
            >
              <AlertTriangle size={12} />
              {unmappedCount} unmapped item{unmappedCount !== 1 ? "s" : ""} — review in Settings
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
