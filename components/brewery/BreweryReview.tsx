"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Send, Trash2, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ReportButton } from "@/components/ui/ReportButton";
import { formatRelativeTime } from "@/lib/utils";
import { RatingDisclosure } from "@/components/ui/RatingDisclosure";
import { StarRating } from "@/components/ui/StarRating";

interface BreweryReviewProps {
  breweryId: string;
  currentUserId: string | null;
  isBreweryAdmin?: boolean;
  isAuthenticated?: boolean;
  returnPath?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  owner_response: string | null;
  responded_at: string | null;
  profile: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function BreweryReview({ breweryId, currentUserId, isBreweryAdmin, isAuthenticated = true, returnPath }: BreweryReviewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [respondingSubmitting, setRespondingSubmitting] = useState(false);

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [breweryId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleRespond(reviewId: string) {
    if (!responseText.trim()) return;
    setRespondingSubmitting(true);
    const res = await fetch(`/api/brewery/${breweryId}/reviews/${reviewId}/respond`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner_response: responseText }),
    });
    if (res.ok) {
      setRespondingTo(null);
      setResponseText("");
      await fetchReviews();
    }
    setRespondingSubmitting(false);
  }

  async function handleDeleteResponse(reviewId: string) {
    const res = await fetch(`/api/brewery/${breweryId}/reviews/${reviewId}/respond`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchReviews();
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[22px] font-bold tracking-[-0.01em]" style={{ color: "var(--text-primary)" }}>
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
          isAuthenticated ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Star size={13} />
              {userReview ? "Edit Review" : "Rate"}
            </button>
          ) : (
            <a
              href={`/signup?next=${encodeURIComponent(returnPath ?? "/")}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Star size={13} />
              Sign Up to Review
            </a>
          )
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
              {/* Star picker (half-star support — Sprint 162) */}
              <div className="flex items-center gap-2">
                <StarRating value={rating} onChange={setRating} size="lg" />
                {rating > 0 && (
                  <span className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
                    {rating.toFixed(1)}/5
                  </span>
                )}
              </div>

              <RatingDisclosure />

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

      {/* Reviews list — Design System v2.0: text reviews = full card, rating-only = compact row */}
      {reviews.length > 0 ? (
        <div className="space-y-2">
          {reviews.map((review, i) => {
            const hasText = !!review.comment;

            // Rating-only: compact row, NO card wrapper (Card Type 5)
            if (!hasText && !review.owner_response) {
              return (
                <div
                  key={review.id}
                  className="flex items-center gap-2.5 py-2 px-1"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <UserAvatar profile={review.profile ?? { display_name: null, avatar_url: null }} size="sm" />
                  <span className="text-[13px] font-medium flex-1 min-w-0 truncate" style={{ color: "var(--text-secondary)" }}>
                    {review.profile.display_name ?? review.profile.username}
                  </span>
                  <StarRating value={review.rating} readonly size="sm" />
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    {formatRelativeTime(review.created_at)}
                  </span>
                </div>
              );
            }

            // Text review: full card (featured treatment for first review = warm gradient)
            return (
            <div
              key={review.id}
              className="rounded-[14px] border p-4"
              style={{
                background: i === 0 ? "linear-gradient(180deg, var(--warm-bg, var(--surface-2)) 0%, var(--card-bg, #FFFFFF) 100%)" : "var(--card-bg)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex items-start gap-3">
                <UserAvatar profile={review.profile ?? { display_name: null, avatar_url: null }} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {review.profile.display_name ?? review.profile.username}
                    </span>
                    <StarRating value={review.rating} readonly size="sm" />
                    {review.rating % 1 !== 0 && (
                      <span className="text-[10px] font-mono" style={{ color: "var(--amber, var(--accent-gold))" }}>
                        {review.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatRelativeTime(review.created_at)}
                    </span>
                    {currentUserId && review.user_id !== currentUserId && (
                      <ReportButton reviewId={review.id} reviewType="brewery" />
                    )}
                  </div>
                  {review.comment && (
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {review.comment}
                    </p>
                  )}

                  {/* Owner Response */}
                  {review.owner_response && (
                    <div
                      className="mt-3 ml-2 pl-3 border-l-2 py-2"
                      style={{ borderColor: "var(--accent-gold)" }}
                    >
                      <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "var(--accent-gold)" }}>
                        Owner Response
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {review.owner_response}
                      </p>
                      {review.responded_at && (
                        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                          {formatRelativeTime(review.responded_at)}
                        </p>
                      )}
                      {isBreweryAdmin && (
                        <button
                          onClick={() => handleDeleteResponse(review.id)}
                          className="text-[10px] mt-1 transition-opacity hover:opacity-70"
                          style={{ color: "var(--danger)" }}
                        >
                          Remove response
                        </button>
                      )}
                    </div>
                  )}

                  {/* Respond button for brewery admins */}
                  {isBreweryAdmin && !review.owner_response && respondingTo !== review.id && (
                    <button
                      onClick={() => { setRespondingTo(review.id); setResponseText(""); }}
                      className="text-xs mt-2 flex items-center gap-1 transition-opacity hover:opacity-70"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      <MessageSquare size={11} />
                      Respond
                    </button>
                  )}

                  {/* Response form */}
                  <AnimatePresence>
                    {respondingTo === review.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            placeholder="Write your response..."
                            rows={2}
                            className="w-full rounded-xl border px-3 py-2 text-sm resize-none outline-none"
                            style={{
                              background: "var(--surface-2)",
                              borderColor: "var(--border)",
                              color: "var(--text-primary)",
                            }}
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRespond(review.id)}
                              disabled={!responseText.trim() || respondingSubmitting}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                            >
                              <Send size={11} />
                              {respondingSubmitting ? "Sending..." : "Send Response"}
                            </button>
                            <button
                              onClick={() => { setRespondingTo(null); setResponseText(""); }}
                              className="px-3 py-1.5 rounded-xl text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        !showForm && (
          <div
            className="text-center py-10 rounded-[14px] border"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
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
