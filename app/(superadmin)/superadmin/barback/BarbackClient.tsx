"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
  Beer,
  Edit3,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { formatDate, formatDateTime, formatRelativeTime } from "@/lib/dates";

// ─── Types ──────────────────────────────────────────────────────────────────

type Stats = {
  totalSources: number;
  enabledSources: number;
  pendingCount: number;
  promotedCount: number;
  totalCost: number;
  lastCrawlDate: string | null;
};

type CrawledBeer = {
  id: string;
  crawl_job_id: string;
  brewery_id: string;
  name: string;
  style: string | null;
  mapped_style: string | null;
  abv: number | null;
  ibu: number | null;
  description: string | null;
  confidence: number;
  status: string;
  source_text: string | null;
  rejection_reason: string | null;
  created_at: string;
  brewery: { name: string; city: string; state: string } | null;
};

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

// ─── Component ──────────────────────────────────────────────────────────────

export function BarbackClient({
  stats,
  initialJobs,
  initialPending,
}: {
  stats: Stats;
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

  // ── Confidence color helper ──

  function confidenceColor(c: number): string {
    if (c >= 0.85) return "var(--success, #3d7a52)";
    if (c >= 0.6) return "var(--accent-amber, #e8841a)";
    return "var(--danger, #c44b3a)";
  }

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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section 1: Overview Stats                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Sources", value: localStats.totalSources, icon: Database },
          { label: "Active Sources", value: localStats.enabledSources, icon: Zap },
          { label: "Pending Review", value: localStats.pendingCount, icon: AlertTriangle, highlight: localStats.pendingCount > 0 },
          { label: "Total Promoted", value: localStats.promotedCount, icon: CheckCircle },
          { label: "Last Crawl", value: localStats.lastCrawlDate ? formatRelativeTime(localStats.lastCrawlDate) : "Never", icon: Clock, isText: true },
          { label: "Estimated Cost", value: `$${localStats.totalCost.toFixed(4)}`, icon: DollarSign, isText: true },
        ].map(({ label, value, icon: Icon, highlight, isText }) => (
          <div
            key={label}
            className="rounded-2xl border p-5"
            style={{
              background: "var(--surface)",
              borderColor: highlight ? "var(--accent-gold)" : "var(--border)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-xs font-mono uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {label}
              </p>
              <Icon
                size={15}
                style={{ color: highlight ? "var(--accent-gold)" : "var(--text-muted)" }}
              />
            </div>
            <p
              className={`${isText ? "text-xl" : "text-3xl"} font-bold tabular-nums font-mono`}
              style={{ color: highlight ? "var(--accent-gold)" : "var(--text-primary)" }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section 2: Pending Review                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-display text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Pending Review
          </h2>
          {highConfCount > 0 && (
            <button
              onClick={() => setShowBatchConfirm(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "rgba(61,122,82,0.12)", color: "var(--success)" }}
            >
              Approve All High Confidence ({highConfCount})
            </button>
          )}
        </div>

        {/* Batch confirm inline */}
        <AnimatePresence>
          {showBatchConfirm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div
                className="rounded-2xl border p-4 flex items-center justify-between gap-4"
                style={{ background: "var(--surface)", borderColor: "var(--accent-gold)" }}
              >
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                  Approve and promote{" "}
                  <span className="font-mono font-bold" style={{ color: "var(--accent-gold)" }}>
                    {highConfCount}
                  </span>{" "}
                  beer{highConfCount === 1 ? "" : "s"} with confidence &ge; 0.85?
                </p>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setShowBatchConfirm(false)}
                    disabled={batchLoading}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBatchApprove}
                    disabled={batchLoading}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
                    style={{ background: "rgba(61,122,82,0.9)", color: "#fff" }}
                  >
                    {batchLoading && <Loader2 size={14} className="animate-spin" />}
                    Confirm
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {pending.length === 0 ? (
          <div
            className="rounded-2xl border p-12 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Beer
              size={36}
              className="mx-auto mb-3"
              style={{ color: "var(--text-muted)", opacity: 0.4 }}
            />
            <p
              className="font-display font-semibold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              No beers pending review
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              The Barback is keeping things clean.
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
                gridTemplateColumns: "1.5fr 1.5fr 1fr 0.6fr 0.7fr 1.5fr 1fr",
              }}
            >
              <span>Brewery</span>
              <span>Beer Name</span>
              <span>Style</span>
              <span>ABV</span>
              <span>Confidence</span>
              <span>Source</span>
              <span>Actions</span>
            </div>

            <AnimatePresence initial={false}>
              {pending.map((beer) => {
                const isLoading = loadingIds.has(beer.id);
                const isRejecting = rejectingId === beer.id;
                const isEditing = editingId === beer.id;
                const isSourceExpanded = expandedSource === beer.id;

                return (
                  <motion.div
                    key={beer.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    {/* Main row */}
                    <div
                      className="lg:grid gap-4 px-5 py-4 flex flex-col"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        gridTemplateColumns: "1.5fr 1.5fr 1fr 0.6fr 0.7fr 1.5fr 1fr",
                      }}
                    >
                      {/* Brewery */}
                      <div className="min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {beer.brewery?.name ?? "Unknown"}
                        </p>
                        {beer.brewery && (
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {beer.brewery.city}, {beer.brewery.state}
                          </p>
                        )}
                      </div>

                      {/* Beer Name */}
                      <p
                        className="text-sm font-display font-semibold truncate self-center"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {beer.name}
                      </p>

                      {/* Style */}
                      <p
                        className="text-sm truncate self-center"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {beer.mapped_style ?? beer.style ?? "—"}
                      </p>

                      {/* ABV */}
                      <p
                        className="text-sm font-mono self-center"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {beer.abv != null ? `${beer.abv}%` : "—"}
                      </p>

                      {/* Confidence */}
                      <div className="self-center">
                        <span
                          className="text-sm font-mono font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: confidenceColor(beer.confidence),
                            background:
                              beer.confidence >= 0.85
                                ? "rgba(61,122,82,0.12)"
                                : beer.confidence >= 0.6
                                  ? "rgba(232,132,26,0.12)"
                                  : "rgba(196,75,58,0.1)",
                          }}
                        >
                          {(beer.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Source Text */}
                      <div className="self-center min-w-0">
                        {beer.source_text ? (
                          <button
                            onClick={() =>
                              setExpandedSource(isSourceExpanded ? null : beer.id)
                            }
                            className="flex items-center gap-1 text-xs text-left hover:opacity-80 transition-opacity"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <span className={isSourceExpanded ? "" : "truncate max-w-[180px] inline-block"}>
                              {beer.source_text}
                            </span>
                            {isSourceExpanded ? (
                              <ChevronUp size={12} className="shrink-0" />
                            ) : (
                              <ChevronDown size={12} className="shrink-0" />
                            )}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            —
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-center">
                        <button
                          onClick={() => handleApprove(beer.id)}
                          disabled={isLoading}
                          className="p-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40"
                          style={{ background: "rgba(61,122,82,0.12)", color: "var(--success)" }}
                          title="Approve"
                        >
                          {isLoading ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setRejectingId(isRejecting ? null : beer.id);
                            setRejectReason("");
                          }}
                          disabled={isLoading}
                          className="p-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40"
                          style={{ background: "rgba(196,75,58,0.1)", color: "var(--danger)" }}
                          title="Reject"
                        >
                          <XCircle size={14} />
                        </button>
                        <button
                          onClick={() => setEditingId(isEditing ? null : beer.id)}
                          disabled={isLoading}
                          className="p-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40"
                          style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                          title="View details"
                        >
                          <Edit3 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Reject reason inline */}
                    <AnimatePresence>
                      {isRejecting && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-5 py-3 flex items-center gap-3"
                            style={{
                              background: "rgba(196,75,58,0.04)",
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            <input
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Rejection reason (optional)..."
                              className="flex-1 bg-transparent text-sm outline-none"
                              style={{ color: "var(--text-primary)" }}
                            />
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium"
                              style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReject(beer.id)}
                              disabled={isLoading}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-50"
                              style={{ background: "rgba(196,75,58,0.9)", color: "#fff" }}
                            >
                              Confirm Reject
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Edit / detail inline */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="px-5 py-3 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm"
                            style={{
                              background: "var(--surface-2)",
                              borderBottom: "1px solid var(--border)",
                            }}
                          >
                            <div>
                              <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                                Raw Style
                              </span>
                              <p style={{ color: "var(--text-primary)" }}>
                                {beer.style ?? "—"}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                                Mapped Style
                              </span>
                              <p style={{ color: "var(--text-primary)" }}>
                                {beer.mapped_style ?? "—"}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                                IBU
                              </span>
                              <p style={{ color: "var(--text-primary)" }}>
                                {beer.ibu ?? "—"}
                              </p>
                            </div>
                            <div>
                              <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                                Crawled
                              </span>
                              <p style={{ color: "var(--text-primary)" }}>
                                {formatDate(beer.created_at)}
                              </p>
                            </div>
                            {beer.description && (
                              <div className="col-span-2 lg:col-span-4">
                                <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                                  Description
                                </span>
                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                  {beer.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Section 3: Recent Crawl Runs                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
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
              The Barback hasn&apos;t started crawling yet.
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
                  {/* Date */}
                  <span className="font-mono text-xs self-center" style={{ color: "var(--text-muted)" }}>
                    {job.completed_at
                      ? formatDateTime(job.completed_at)
                      : job.started_at
                        ? formatDateTime(job.started_at)
                        : formatDateTime(job.created_at)}
                  </span>

                  {/* Brewery */}
                  <span className="truncate self-center" style={{ color: "var(--text-primary)" }}>
                    {job.brewery?.name ?? "Unknown"}
                  </span>

                  {/* Status badge */}
                  <div className="self-center">
                    <span
                      className="text-xs font-mono font-medium px-2 py-0.5 rounded-full capitalize"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {job.status}
                    </span>
                  </div>

                  {/* Found */}
                  <span className="font-mono self-center" style={{ color: "var(--text-secondary)" }}>
                    {job.beers_found ?? 0}
                  </span>

                  {/* Added */}
                  <span className="font-mono self-center" style={{ color: "var(--text-secondary)" }}>
                    {job.beers_added ?? 0}
                  </span>

                  {/* Tokens */}
                  <span className="font-mono self-center" style={{ color: "var(--text-muted)" }}>
                    {job.tokens_used != null ? job.tokens_used.toLocaleString() : "—"}
                  </span>

                  {/* Cost */}
                  <span className="font-mono self-center" style={{ color: "var(--text-muted)" }}>
                    {job.cost_usd != null ? `$${Number(job.cost_usd).toFixed(4)}` : "—"}
                  </span>

                  {/* Error */}
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
