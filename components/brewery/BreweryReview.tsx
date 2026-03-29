"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, Trash2, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/utils";

interface BreweryReviewProps {
  breweryId: string;
  currentUserId: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function BreweryReview({ breweryId, currentUserId }: BreweryReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [breweryId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchReviews() {
    const res = await fetch(`/api/brewery/${breweryId}/reviews`);
    if (!res.ok) return;
    const data = await res.json();
    setReviews(data.reviews);
    setUserReview(data.userReview);
    setAvgRating(data.avgRating);
    setTotalReviews(data.totalReviews);
    if (data.userReview) {
      setRating(data.userReview.rating);
      setComment(data.userReview.comment ?? "");
    }
  }

  async function handleSubmit() {
    if (rating === 0) return;
    setSubmitting(true);
    const res = await fetch(`/api/brewery/${breweryId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) {
      await fetchReviews();
      setShowForm(false);
    }
    setSubmitting(false);
  }

  async function handleDelete() {
    const res = await fetch(`/api/brewery/${breweryId}/reviews`, { method: "DELETE" });
    if (res.ok) {
      setUserReview(null);
      setRating(0);
      setComment("");
      setConfirmDelete(false);
      await fetchReviews();
    }
  }

  const displayRating = hoverRating || rating;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
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
            {userReview ? "Edit Review" : "Rate"}
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
              className="rounded-2xl border p-4 mb-4 space-y-3"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {/* Star picker */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      style={{
                        color: n <= displayRating ? "var(--accent-gold)" : "var(--border)",
                        fill: n <= displayRating ? "var(--accent-gold)" : "transparent",
                      }}
                    />
                  </button>
                ))}
                {displayRating > 0 && (
                  <span className="ml-2 text-sm font-mono" style={{ color: "var(--text-muted)" }}>
                    {displayRating}/5
                  </span>
                )}
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)..."
                rows={3}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none transition-colors outline-none"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              />

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || submitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                >
                  <Send size={13} />
                  {submitting ? "Saving..." : userReview ? "Update" : "Submit"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setConfirmDelete(false); }}
                  className="px-4 py-2 rounded-xl text-sm transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
                {userReview && !confirmDelete && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-xs transition-colors"
                    style={{ color: "var(--danger)" }}
                  >
                    <Trash2 size={12} />
                    Delete
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
              className="rounded-2xl border p-4"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start gap-3">
                <UserAvatar profile={review.profile as any} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {review.profile.display_name ?? review.profile.username}
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
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatRelativeTime(review.created_at)}
                    </span>
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
            className="text-center py-10 rounded-2xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <MessageSquare size={24} className="mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No reviews yet</p>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Be the first to rate this brewery</p>
          </div>
        )
      )}
    </div>
  );
}
