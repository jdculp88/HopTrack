"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  XCircle,
  Edit3,
  ChevronDown,
  ChevronUp,
  Loader2,
  Beer,
} from "lucide-react";
import { formatDate } from "@/lib/dates";

export type CrawledBeer = {
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

interface BarbackReviewTableProps {
  pending: CrawledBeer[];
  loadingIds: Set<string>;
  expandedSource: string | null;
  editingId: string | null;
  rejectingId: string | null;
  rejectReason: string;
  onApprove: (id: string) => void;
  onRejectToggle: (id: string) => void;
  onRejectConfirm: (id: string) => void;
  onRejectReasonChange: (reason: string) => void;
  onEditToggle: (id: string) => void;
  onSourceToggle: (id: string) => void;
}

function confidenceColor(c: number): string {
  if (c >= 0.85) return "var(--success, #3d7a52)";
  if (c >= 0.6) return "var(--accent-amber, #e8841a)";
  return "var(--danger, #c44b3a)";
}

function confidenceBg(c: number): string {
  if (c >= 0.85) return "rgba(61,122,82,0.12)";
  if (c >= 0.6) return "rgba(232,132,26,0.12)";
  return "rgba(196,75,58,0.1)";
}

export function BarbackReviewTable({
  pending,
  loadingIds,
  expandedSource,
  editingId,
  rejectingId,
  rejectReason,
  onApprove,
  onRejectToggle,
  onRejectConfirm,
  onRejectReasonChange,
  onEditToggle,
  onSourceToggle,
}: BarbackReviewTableProps) {
  if (pending.length === 0) {
    return (
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
    );
  }

  return (
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
                      background: confidenceBg(beer.confidence),
                    }}
                  >
                    {(beer.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Source Text */}
                <div className="self-center min-w-0">
                  {beer.source_text ? (
                    <button
                      onClick={() => onSourceToggle(beer.id)}
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
                    onClick={() => onApprove(beer.id)}
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
                    onClick={() => onRejectToggle(beer.id)}
                    disabled={isLoading}
                    className="p-2 rounded-xl transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ background: "rgba(196,75,58,0.1)", color: "var(--danger)" }}
                    title="Reject"
                  >
                    <XCircle size={14} />
                  </button>
                  <button
                    onClick={() => onEditToggle(beer.id)}
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
                        onChange={(e) => onRejectReasonChange(e.target.value)}
                        placeholder="Rejection reason (optional)..."
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: "var(--text-primary)" }}
                      />
                      <button
                        onClick={() => onRejectToggle(beer.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => onRejectConfirm(beer.id)}
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
                        <p style={{ color: "var(--text-primary)" }}>{beer.style ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                          Mapped Style
                        </span>
                        <p style={{ color: "var(--text-primary)" }}>{beer.mapped_style ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                          IBU
                        </span>
                        <p style={{ color: "var(--text-primary)" }}>{beer.ibu ?? "—"}</p>
                      </div>
                      <div>
                        <span className="text-xs font-mono uppercase" style={{ color: "var(--text-muted)" }}>
                          Crawled
                        </span>
                        <p style={{ color: "var(--text-primary)" }}>{formatDate(beer.created_at)}</p>
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
  );
}
