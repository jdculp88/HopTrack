"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Beer, Clock, Loader2, Bot } from "lucide-react";
import { formatDateTime } from "@/lib/dates";
import { BarbackOverview, type BarbackStats } from "./BarbackOverview";
import { BarbackReviewTable, type CrawledBeer } from "./BarbackReviewTable";
import { BarbackBatchActions } from "./BarbackBatchActions";

// ─── Types ──────────────────────────────────────────────────────────────────

type CrawlJob = {
  id: string;
  brewery_id: string;
  status: string;
  beers_found: number;
  beers_added: number;
  tokens_used: number | null;
  cost_usd: number | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  brewery: { name: string; city: string; state: string } | null;
};

type Toast = {
  message: string;
  type: "success" | "error";
};

// Re-export shared types so the server page only needs one import
export type { BarbackStats, CrawledBeer };

// ─── Run Crawl Button (Sprint 146) ──────────────────────────────────────────

function RunCrawlButton({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/barback/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.status === 429) {
        onToast("Rate limited — try again in 5 minutes", "error");
        return;
      }
      const json = await res.json();
      if (res.ok) {
        onToast(`Crawl queued: ${json.data?.sourcesQueued ?? 0} sources`, "success");
      } else {
        onToast("Failed to trigger crawl", "error");
      }
    } catch {
      onToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-80 disabled:opacity-40"
      style={{
        background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
        color: "var(--accent-gold)",
        border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
      }}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
      Run Crawl
    </button>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BarbackClient({
  stats,
  initialJobs,
  initialPending,
}: {
  stats: BarbackStats;
  initialJobs: CrawlJob[];
  initialPending: CrawledBeer[];
}) {
  const [pending, setPending] = useState<CrawledBeer[]>(initialPending);
  const [jobs] = useState<CrawlJob[]>(initialJobs);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [localStats, setLocalStats] = useState(stats);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Individual Approve ──

  async function handleApprove(id: string) {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/superadmin/barback/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approve" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPending((prev) => prev.filter((b) => b.id !== id));
        setLocalStats((prev) => ({
          ...prev,
          pendingCount: prev.pendingCount - 1,
          promotedCount: prev.promotedCount + 1,
        }));
        showToast("Beer approved and promoted", "success");
      } else {
        showToast(data.error ?? "Failed to approve", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ── Individual Reject ──

  async function handleReject(id: string) {
    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch("/api/superadmin/barback/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "reject", reason: rejectReason || undefined }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPending((prev) => prev.filter((b) => b.id !== id));
        setLocalStats((prev) => ({
          ...prev,
          pendingCount: prev.pendingCount - 1,
        }));
        setRejectingId(null);
        setRejectReason("");
        showToast("Beer rejected", "success");
      } else {
        showToast(data.error ?? "Failed to reject", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  // ── Batch Approve ──

  const highConfCount = pending.filter((b) => b.confidence >= 0.85).length;

  async function handleBatchApprove() {
    setBatchLoading(true);
    try {
      const res = await fetch("/api/superadmin/barback/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_high_confidence", threshold: 0.85 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPending((prev) => prev.filter((b) => b.confidence < 0.85));
        setLocalStats((prev) => ({
          ...prev,
          pendingCount: prev.pendingCount - data.count,
          promotedCount: prev.promotedCount + data.count,
        }));
        setShowBatchConfirm(false);
        showToast(`${data.count} beer${data.count === 1 ? "" : "s"} approved and promoted`, "success");
      } else {
        showToast(data.error ?? "Batch approve failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setBatchLoading(false);
    }
  }

  // ── Reject toggle helper ──

  function handleRejectToggle(id: string) {
    setRejectingId((prev) => (prev === id ? null : id));
    setRejectReason("");
  }

  // ── Edit toggle helper ──

  function handleEditToggle(id: string) {
    setEditingId((prev) => (prev === id ? null : id));
  }

  // ── Source expand toggle ──

  function handleSourceToggle(id: string) {
    setExpandedSource((prev) => (prev === id ? null : id));
  }

  // ── Job status style ──

  function jobStatusStyle(status: string) {
    switch (status) {
      case "completed":
        return { bg: "rgba(61,122,82,0.12)", color: "var(--success)" };
      case "failed":
        return { bg: "rgba(196,75,58,0.1)", color: "var(--danger)" };
      case "skipped":
        return { bg: "rgba(232,132,26,0.12)", color: "var(--accent-amber)" };
      default:
        return { bg: "var(--surface-2)", color: "var(--text-muted)" };
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
            style={{
              background: toast.type === "success" ? "rgba(61,122,82,0.95)" : "rgba(196,75,58,0.95)",
              color: "#fff",
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Beer size={16} style={{ color: "var(--accent-gold)" }} />
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--accent-gold)" }}
          >
            The Barback
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="font-display text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Beer Review Queue
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Review AI-crawled beers before they go live
            </p>
          </div>
          <RunCrawlButton onToast={showToast} />
        </div>
      </div>

      {/* ─── Overview Stats ─────────────────────────────────────────────── */}
      <BarbackOverview stats={localStats} />

      {/* ─── Pending Review ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-display text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Pending Review
          </h2>
          <BarbackBatchActions
            highConfCount={highConfCount}
            showBatchConfirm={showBatchConfirm}
            batchLoading={batchLoading}
            onOpenConfirm={() => setShowBatchConfirm(true)}
            onCancelConfirm={() => setShowBatchConfirm(false)}
            onBatchApprove={handleBatchApprove}
          />
        </div>

        <BarbackReviewTable
          pending={pending}
          loadingIds={loadingIds}
          expandedSource={expandedSource}
          editingId={editingId}
          rejectingId={rejectingId}
          rejectReason={rejectReason}
          onApprove={handleApprove}
          onRejectToggle={handleRejectToggle}
          onRejectConfirm={handleReject}
          onRejectReasonChange={setRejectReason}
          onEditToggle={handleEditToggle}
          onSourceToggle={handleSourceToggle}
        />
      </div>

      {/* ─── Recent Crawl Runs ──────────────────────────────────────────── */}
      <div>
        <h2
          className="font-display text-lg font-bold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Crawl Runs
        </h2>

        {jobs.length === 0 ? (
          <div
            className="rounded-2xl border p-12 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Clock
              size={36}
              className="mx-auto mb-3"
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <p
              className="font-display font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              No crawl runs yet
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              The Barback hasn't started crawling yet.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Table header */}
            <div
              className="hidden lg:grid gap-4 px-5 py-3 text-xs font-mono uppercase tracking-wider"
              style={{
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--border)",
                gridTemplateColumns: "1fr 1.5fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 1.5fr",
              }}
            >
              <span>Date</span>
              <span>Brewery</span>
              <span>Status</span>
              <span>Found</span>
              <span>Added</span>
              <span>Tokens</span>
              <span>Cost</span>
              <span>Error</span>
            </div>

            {jobs.map((job, i) => {
              const style = jobStatusStyle(job.status);
              return (
                <div
                  key={job.id}
                  className="lg:grid gap-4 px-5 py-3 flex flex-col text-sm"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--border)" : undefined,
                    gridTemplateColumns: "1fr 1.5fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 1.5fr",
                  }}
                >
                  <span className="font-mono text-xs self-center" style={{ color: "var(--text-muted)" }}>
                    {job.completed_at
                      ? formatDateTime(job.completed_at)
                      : job.started_at
                        ? formatDateTime(job.started_at)
                        : formatDateTime(job.created_at)}
                  </span>
                  <span className="truncate self-center" style={{ color: "var(--text-primary)" }}>
                    {job.brewery?.name ?? "Unknown"}
                  </span>
                  <div className="self-center">
                    <span
                      className="text-xs font-mono font-medium px-2 py-0.5 rounded-full capitalize"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {job.status}
                    </span>
                  </div>
                  <span className="font-mono self-center" style={{ color: "var(--text-secondary)" }}>
                    {job.beers_found ?? 0}
                  </span>
                  <span className="font-mono self-center" style={{ color: "var(--text-secondary)" }}>
                    {job.beers_added ?? 0}
                  </span>
                  <span className="font-mono self-center" style={{ color: "var(--text-muted)" }}>
                    {job.tokens_used != null ? job.tokens_used.toLocaleString() : "—"}
                  </span>
                  <span className="font-mono self-center" style={{ color: "var(--text-muted)" }}>
                    {job.cost_usd != null ? `$${Number(job.cost_usd).toFixed(4)}` : "—"}
                  </span>
                  <span
                    className="text-xs truncate self-center"
                    style={{ color: job.error_message ? "var(--danger)" : "var(--text-muted)" }}
                    title={job.error_message ?? undefined}
                  >
                    {job.error_message ?? "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
