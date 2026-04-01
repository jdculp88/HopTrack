"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SyncLog {
  id: string;
  pos_connection_id: string;
  brewery_id: string;
  sync_type: "webhook" | "manual" | "scheduled";
  provider: "toast" | "square";
  items_added: number;
  items_updated: number;
  items_removed: number;
  items_unmapped: number;
  status: "success" | "partial" | "failed";
  error: string | null;
  duration_ms: number;
  created_at: string;
}

interface PosSyncLogClientProps {
  breweryId: string;
}

const STATUS_FILTERS = ["all", "success", "partial", "failed"] as const;
const PROVIDER_FILTERS = ["all", "toast", "square"] as const;
const TYPE_FILTERS = ["all", "webhook", "manual", "scheduled"] as const;

const statusColor: Record<string, string> = {
  success: "#22c55e",
  partial: "#eab308",
  failed: "#ef4444",
};

export function PosSyncLogClient({ breweryId }: PosSyncLogClientProps) {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        brewery_id: breweryId,
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (providerFilter !== "all") params.set("provider", providerFilter);
      if (typeFilter !== "all") params.set("sync_type", typeFilter);

      const res = await fetch(`/api/pos/sync-logs?${params}`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.data?.logs ?? []);
        setTotalPages(json.data?.total_pages ?? 1);
        setTotal(json.data?.total ?? 0);
      }
    } catch {
      // Non-critical
    } finally {
      setLoading(false);
    }
  }, [breweryId, page, statusFilter, providerFilter, typeFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [statusFilter, providerFilter, typeFilter]);

  function formatTimestamp(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  return (
    <div>
      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Status filter */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Status</p>
          <div className="flex gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize min-h-[32px]"
                style={{
                  background: statusFilter === f ? "var(--accent-gold)" : "var(--surface-2)",
                  color: statusFilter === f ? "var(--bg)" : "var(--text-muted)",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Provider + Type filters */}
        <div className="flex gap-6 flex-wrap">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Provider</p>
            <div className="flex gap-1.5">
              {PROVIDER_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setProviderFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize min-h-[32px]"
                  style={{
                    background: providerFilter === f ? "var(--accent-gold)" : "var(--surface-2)",
                    color: providerFilter === f ? "var(--bg)" : "var(--text-muted)",
                  }}
                >
                  {f === "toast" ? "🍞 Toast" : f === "square" ? "⬛ Square" : "All"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>Trigger</p>
            <div className="flex gap-1.5">
              {TYPE_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setTypeFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize min-h-[32px]"
                  style={{
                    background: typeFilter === f ? "var(--accent-gold)" : "var(--surface-2)",
                    color: typeFilter === f ? "var(--bg)" : "var(--text-muted)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
        {total} sync{total !== 1 ? "s" : ""} total
      </p>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={20} className="animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      ) : logs.length === 0 ? (
        /* Empty state */
        <div className="rounded-2xl border p-8 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <p className="text-3xl mb-2">📊</p>
          <p className="font-display font-bold" style={{ color: "var(--text-primary)" }}>No sync activity yet</p>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {statusFilter !== "all" || providerFilter !== "all" || typeFilter !== "all"
              ? "No syncs match your filters. Try adjusting them."
              : "Connect your POS and run a sync to see activity here."}
          </p>
        </div>
      ) : (
        /* Log rows */
        <div className="space-y-1.5">
          {logs.map(log => {
            const isExpanded = expandedRow === log.id;
            const hasFailed = log.status === "failed" && log.error;

            return (
              <div key={log.id}>
                <button
                  onClick={() => hasFailed ? setExpandedRow(isExpanded ? null : log.id) : undefined}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-xs transition-colors"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    cursor: hasFailed ? "pointer" : "default",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status dot */}
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: statusColor[log.status] }}
                    />
                    {/* Provider */}
                    <span className="flex-shrink-0">{log.provider === "toast" ? "🍞" : "⬛"}</span>
                    {/* Type */}
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono capitalize flex-shrink-0"
                      style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                    >
                      {log.sync_type}
                    </span>
                    {/* Items */}
                    <span className="font-mono flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                      <span style={{ color: "#22c55e" }}>+{log.items_added}</span>
                      {" "}
                      <span style={{ color: "var(--accent-gold)" }}>~{log.items_updated}</span>
                      {" "}
                      <span style={{ color: "#ef4444" }}>-{log.items_removed}</span>
                    </span>
                    {log.items_unmapped > 0 && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono flex-shrink-0"
                        style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}
                      >
                        {log.items_unmapped} unmapped
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                    <span className="font-mono">{formatDuration(log.duration_ms)}</span>
                    <span>{formatTimestamp(log.created_at)}</span>
                    {hasFailed && (
                      isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </button>

                {/* Expanded error detail */}
                <AnimatePresence>
                  {isExpanded && hasFailed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-4 px-4 py-3 rounded-b-xl text-xs flex items-start gap-2"
                        style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                      >
                        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
                        <span className="font-mono">{log.error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 min-h-[36px]"
            style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <ChevronLeft size={12} /> Previous
          </button>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 min-h-[36px]"
            style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
