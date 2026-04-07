"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Send, Trash2, MessageSquare } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ReportButton } from "@/components/ui/ReportButton";
import { formatRelativeTime } from "@/lib/utils";
import { RatingDisclosure } from "@/components/ui/RatingDisclosure";

interface BeerReviewSectionProps {
  beerId: string;
  currentUserId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function BeerReviewSection({ beerId, currentUserId }: BeerReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/beer/${beerId}/reviews`);
    if (!res.ok) return;
    const data = await res.json();
    setReviews(data.reviews);
    setUserReview(data.userReview);
    setAvgRating(data.avgRating);
    setTotalReviews(data.totalReviews);
    if (data.userReview) {
      setFormRating(data.userReview.rating);
      setComment(data.userReview.comment ?? "");
    }
  }, [beerId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  async function handleSubmit() {
    if (formRating === 0) return;
    setSubmitting(true);
    const res = await fetch(`/api/beer/${beerId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: formRating, comment: comment || null }),
    });
    if (res.ok) {
      await fetchReviews();
      setShowForm(false);
      setShowComment(false);
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    const res = await fetch(`/api/beer/${beerId}/reviews`, { method: "DELETE" });
    if (res.ok) {
      setUserReview(null);
      setFormRating(0);
      setComment("");
      setConfirmDelete(false);
      await fetchReviews();
    }
  }

  return (
    <div>
      {/* Header with rating + CTA */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Reviews
          </h2>
          {avgRating != null && (
            <div className="flex items-center gap-1.5">
              <Star size={16} style={{ color: "var(--accent-gold)", fill: "var(--accent-gold)" }} />
              <span className="font-mono font-bold text-lg" style={{ color: "var(--accent-gold)" }}>
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                ({totalReviews})
              </span>
            </div>
          )}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Star size={13} />
            {userReview ? "Edit" : "Rate"}
          </button>
        )}
      </div>

      {/* Review form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-[14px] border p-4 mb-4 space-y-3"
              style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Tap to rate:</span>
                <StarRating
                  value={formRating}
                  onChange={(v) => {
                    setFormRating(v);
                    setShowComment(true);
                  }}
                  size="lg"
                />
                {formRating > 0 && (
                  <span className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>{formRating}/5</span>
                )}
              </div>
              <RatingDisclosure />

              <AnimatePresence>
                {showComment && formRating > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-3"
                  >
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you think? (optional)..."
                      rows={2}
                      className="w-full rounded-xl border px-4 py-3 text-sm resize-none outline-none"
                      style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                      >
                        <Send size={13} />
                        {submitting ? "Saving..." : userReview ? "Update" : "Submit"}
                      </button>
                      <button
                        onClick={() => { setShowForm(false); setShowComment(false); setConfirmDelete(false); }}
                        className="px-4 py-2 rounded-xl text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                      {userReview && !confirmDelete && (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-xs"
                          style={{ color: "var(--danger)" }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <AnimatePresence>
                        {confirmDelete && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="ml-auto flex items-center gap-2"
                          >
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Delete?</span>
                            <button
                              onClick={handleDelete}
                              className="px-3 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: "var(--danger)", color: "white" }}
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setConfirmDelete(false)}
                              className="px-3 py-1 rounded-lg text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              No
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-[14px] border p-4"
              style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-3">
                <UserAvatar profile={review.profile ?? { display_name: null, avatar_url: null }} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {review.profile.display_name ?? review.profile.username}
                    </span>
                    <StarRating value={review.rating} readonly size="sm" />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatRelativeTime(review.created_at)}
                    </span>
                    {currentUserId && review.user_id !== currentUserId && (
                      <ReportButton reviewId={review.id} reviewType="beer" />
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div
            className="text-center py-10 rounded-[14px] border"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            <MessageSquare size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No reviews yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Be the first to rate this beer</p>
          </div>
        )
      )}
    </div>
  );
}
