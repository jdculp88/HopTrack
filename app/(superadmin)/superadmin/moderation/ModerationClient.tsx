"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Shield, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatRelativeTime } from "@/lib/utils";
import { spring, stagger } from "@/lib/animation";

interface FlaggedReview {
  id: string;
  review_type: "beer" | "brewery";
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  is_flagged: boolean;
  flag_reason: string | null;
  flagged_by: string | null;
  flagged_at: string | null;
  moderation_status: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  reviewer_name: string | null;
  reporter_name: string | null;
}

interface ModerationClientProps {
  initialReviews: FlaggedReview[];
}

type FilterState = "all" | "flagged" | "cleared" | "removed";

export function ModerationClient({ initialReviews }: ModerationClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState<FilterState>("all");
  const [actingOn, setActingOn] = useState<string | null>(null);
  const { success, error: showError } = useToast();

  const filtered = reviews.filter((r) => {
    if (filter === "all") return true;
    return r.moderation_status === filter;
  });

  async function handleAction(reviewId: string, reviewType: string, action: "clear" | "remove") {
    setActingOn(reviewId);
    try {
      const res = await fetch("/api/superadmin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId, review_type: reviewType, action }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, moderation_status: action === "clear" ? "cleared" : "removed" }
              : r
          )
        );
        success(action === "clear" ? "Review cleared" : "Review removed");
      } else {
        showError("Action failed");
      }
    } catch {
      showError("Action failed");
    }
    setActingOn(null);
  }

  function getStatusVariant(status: string | null): "danger" | "success" | "muted" {
    switch (status) {
      case "flagged":
        return "danger";
      case "cleared":
        return "success";
      case "removed":
        return "muted";
      default:
        return "danger";
    }
  }

  const FILTERS: { value: FilterState; label: string }[] = [
    { value: "all", label: `All (${reviews.length})` },
    { value: "flagged", label: `Flagged (${reviews.filter((r) => r.moderation_status === "flagged").length})` },
    { value: "cleared", label: `Cleared (${reviews.filter((r) => r.moderation_status === "cleared").length})` },
    { value: "removed", label: `Removed (${reviews.filter((r) => r.moderation_status === "removed").length})` },
  ];

  if (reviews.length === 0) {
    return (
      <EmptyState
        emoji="🛡️"
        title="All clear!"
        description="No reviews need attention."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={
              filter === f.value
                ? { background: "var(--accent-gold)", color: "var(--bg)" }
                : { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Review cards */}
      <motion.div
        className="space-y-4"
        variants={stagger.container()}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((review) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={spring.default}
            >
              <Card>
                {/* Header: type + status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Pill variant={review.review_type === "beer" ? "gold" : "ghost"} size="xs">
                      {review.review_type === "beer" ? "Beer Review" : "Brewery Review"}
                    </Pill>
                    <Pill variant={getStatusVariant(review.moderation_status)} size="xs">
                      {review.moderation_status ?? "flagged"}
                    </Pill>
                  </div>
                  {review.flagged_at && (
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      {formatRelativeTime(review.flagged_at)}
                    </span>
                  )}
                </div>

                {/* Reviewer + rating */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {review.reviewer_name ?? "Unknown"}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={11}
                        style={{
                          color: n <= review.rating ? "var(--accent-gold)" : "var(--border)",
                          fill: n <= review.rating ? "var(--accent-gold)" : "transparent",
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p
                    className="text-sm leading-relaxed mb-3 rounded-xl p-3"
                    style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                  >
                    {review.comment}
                  </p>
                )}

                {/* Flag reason + reporter */}
                <div
                  className="rounded-xl p-3 mb-3 space-y-1"
                  style={{ background: "color-mix(in srgb, var(--danger) 8%, transparent)" }}
                >
                  <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>
                    <Shield size={10} className="inline mr-1" />
                    {review.flag_reason ?? "No reason provided"}
                  </p>
                  {review.reporter_name && (
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      Reported by {review.reporter_name}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {review.moderation_status === "flagged" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(review.id, review.review_type, "clear")}
                      disabled={actingOn === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                      style={{ background: "color-mix(in srgb, #22c55e 15%, transparent)", color: "#22c55e" }}
                    >
                      <CheckCircle size={12} />
                      Clear
                    </button>
                    <button
                      onClick={() => handleAction(review.id, review.review_type, "remove")}
                      disabled={actingOn === review.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                      style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}
                    >
                      <XCircle size={12} />
                      Remove
                    </button>
                  </div>
                )}

                {/* Already actioned */}
                {review.moderation_status === "cleared" && (
                  <p className="text-xs" style={{ color: "#22c55e" }}>
                    <CheckCircle size={10} className="inline mr-1" />
                    Cleared — review restored
                  </p>
                )}
                {review.moderation_status === "removed" && (
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    <XCircle size={10} className="inline mr-1" />
                    Removed — review hidden from users
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <EmptyState
          emoji="🔍"
          title="No reviews in this filter"
          description="Try a different filter to see reviews."
          size="sm"
        />
      )}
    </div>
  );
}
