"use client";

import { useState, useCallback } from "react";
import { MessageCircle, Share2 } from "lucide-react";

interface ReactionBarProps {
  sessionId?: string;
  /** Reaction counts by type, e.g. { beer: 7, flame: 2 } */
  reactionCounts?: Record<string, number>;
  /** Types the current user has already reacted with */
  userReactions?: string[];
  /** Number of comments on this session */
  commentCount?: number;
  /** Show share button */
  showShare?: boolean;
  /** Centered layout (for streak/achievement cards) */
  centered?: boolean;
}

export function ReactionBar({
  sessionId,
  reactionCounts = {},
  userReactions = [],
  commentCount,
  showShare = true,
  centered = false,
}: ReactionBarProps) {
  const [counts, setCounts] = useState(reactionCounts);
  const [myReactions, setMyReactions] = useState<string[]>(userReactions);
  const [animating, setAnimating] = useState<string | null>(null);

  const beerCount = counts.beer ?? 0;
  const hasReacted = myReactions.includes("beer");

  const toggleReaction = useCallback(async () => {
    if (!sessionId) return;
    const type = "beer";
    const wasActive = myReactions.includes(type);

    // Optimistic update
    setMyReactions((prev) =>
      wasActive ? prev.filter((t) => t !== type) : [...prev, type]
    );
    setCounts((prev) => ({
      ...prev,
      [type]: Math.max(0, (prev[type] ?? 0) + (wasActive ? -1 : 1)),
    }));
    setAnimating(type);
    setTimeout(() => setAnimating(null), 300);

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, type }),
      });
      if (!res.ok) throw new Error("Reaction failed");
    } catch {
      // Rollback on error
      setMyReactions((prev) =>
        wasActive ? [...prev, type] : prev.filter((t) => t !== type)
      );
      setCounts((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] ?? 0) + (wasActive ? 1 : -1)),
      }));
    }
  }, [sessionId, myReactions]);

  const handleShare = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        url: `${window.location.origin}/session/${sessionId}`,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(
        `${window.location.origin}/session/${sessionId}`
      );
    }
  }, [sessionId]);

  return (
    <div
      className={`flex items-center gap-4 px-4 py-3 mt-1 border-t ${centered ? "justify-center" : ""}`}
      style={{ borderColor: "color-mix(in srgb, var(--border) 50%, transparent)" }}
    >
      {/* Cheers button — only shown for session cards */}
      {sessionId && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleReaction();
          }}
          className="flex items-center gap-1.5 text-[13px] transition-colors"
          style={{
            color: hasReacted ? "var(--accent-amber, #c0583a)" : "var(--text-muted)",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: animating === "beer" ? "scale(1.3)" : "scale(1)",
              transition: "transform 0.2s ease",
            }}
          >
            🍺
          </span>
          {beerCount > 0 && <span>{beerCount}</span>}
        </button>
      )}

      {/* Comment count */}
      {commentCount != null && (
        <div
          className="flex items-center gap-1.5 text-[13px]"
          style={{ color: "var(--text-muted)" }}
        >
          <MessageCircle size={14} />
          <span>{commentCount}</span>
        </div>
      )}

      {/* Share button */}
      {showShare && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShare();
          }}
          className={`flex items-center gap-1 text-[13px] transition-colors ${centered ? "" : "ml-auto"}`}
          style={{ color: "var(--text-muted)" }}
        >
          <Share2 size={14} />
        </button>
      )}
    </div>
  );
}
