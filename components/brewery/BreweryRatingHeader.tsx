"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";

interface BreweryRatingHeaderProps {
  breweryId: string;
  currentUserId: string;
}

export function BreweryRatingHeader({ breweryId }: BreweryRatingHeaderProps) {
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/brewery/${breweryId}/reviews`);
    if (!res.ok) return;
    const data = await res.json();
    setAvgRating(data.avgRating);
    setTotalReviews(data.totalReviews);
    if (data.userReview) {
      setUserRating(data.userReview.rating);
    }
  }, [breweryId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  async function handleSubmit(rating: number) {
    setSubmitting(true);
    const res = await fetch(`/api/brewery/${breweryId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment: comment || null }),
    });
    if (res.ok) {
      setUserRating(rating);
      setShowForm(false);
      setShowComment(false);
      setComment("");
      await fetchData();
    }
    setSubmitting(false);
  }

  async function handleQuickRate(value: number) {
    setFormRating(value);
    // Show comment field briefly — user can submit with or without
    setShowComment(true);
  }

  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avgRating != null ? (
            <>
              <div className="flex items-center gap-1">
                <Star
                  size={20}
                  style={{ color: "var(--accent-gold)", fill: "var(--accent-gold)" }}
                />
                <span
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </span>
            </>
          ) : (
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              No reviews yet
            </span>
          )}
        </div>

        {!showForm && (
          userRating != null ? (
            <button
              onClick={() => {
                setFormRating(userRating);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <span>You rated</span>
              <StarRating value={userRating} readonly size="sm" />
              <span
                className="underline underline-offset-2"
                style={{ color: "var(--accent-gold)" }}
              >
                Edit
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Star size={14} />
              Rate
            </button>
          )
        )}
      </div>

      {/* Inline star picker */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Tap to rate:
                </span>
                <StarRating
                  value={formRating}
                  onChange={handleQuickRate}
                  size="lg"
                />
                {formRating > 0 && (
                  <span className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                    {formRating}/5
                  </span>
                )}
              </div>

              {/* Comment field — appears after star selection */}
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
                      placeholder="Share your experience (optional)..."
                      rows={2}
                      className="w-full rounded-xl border px-4 py-3 text-sm resize-none transition-colors outline-none"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSubmit(formRating)}
                        disabled={submitting}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                      >
                        <Send size={13} />
                        {submitting ? "Saving..." : "Submit"}
                      </button>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setShowComment(false);
                          setFormRating(0);
                          setComment("");
                        }}
                        className="px-4 py-2 rounded-xl text-sm transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick submit without comment */}
              {formRating > 0 && !showComment && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSubmit(formRating)}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                    style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                  >
                    <Send size={13} />
                    {submitting ? "Saving..." : "Submit"}
                  </button>
                  <button
                    onClick={() => setShowComment(true)}
                    className="px-4 py-2 rounded-xl text-sm transition-colors underline underline-offset-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Add a comment
                  </button>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setShowComment(false);
                      setFormRating(0);
                      setComment("");
                    }}
                    className="px-4 py-2 rounded-xl text-sm transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
