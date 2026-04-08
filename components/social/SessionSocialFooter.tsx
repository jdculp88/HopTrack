"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "motion/react";
import { spring, microInteraction } from "@/lib/animation";
import { ThumbsUp, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useHaptic } from "@/hooks/useHaptic";

interface SessionSocialFooterProps {
  sessionId: string;
  reactionCounts?: Record<string, number>;
  userReactions?: string[];
  commentCount?: number;
  onToggleComments?: () => void;
}

/**
 * Session card social footer — exact design spec.
 * Layout: 👍 (cheers button) · 🍻 Cheers {count} · 💬 Comment {count}
 * No share icon. Comments toggle on tap.
 */
export function SessionSocialFooter({
  sessionId,
  reactionCounts = {},
  userReactions = [],
  commentCount,
  onToggleComments,
}: SessionSocialFooterProps) {
  const [counts, setCounts] = useState(reactionCounts);
  const [myReactions, setMyReactions] = useState<string[]>(userReactions);
  const [animating, setAnimating] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; angle: number }>>([]);
  const particleIdRef = useRef(0);
  const { error: showError } = useToast();
  const { haptic } = useHaptic();

  const cheersCount = counts.beer ?? 0;
  const hasReacted = myReactions.includes("beer");

  const toggleCheers = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const wasActive = myReactions.includes("beer");

      // Optimistic
      setMyReactions((prev) =>
        wasActive ? prev.filter((t) => t !== "beer") : [...prev, "beer"]
      );
      setCounts((prev) => ({
        ...prev,
        beer: Math.max(0, (prev.beer ?? 0) + (wasActive ? -1 : 1)),
      }));
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);

      if (!wasActive) {
        haptic("success");
        const newP = Array.from({ length: 6 }, (_, i) => ({
          id: particleIdRef.current++,
          angle: (i / 6) * 360 + Math.random() * 30,
        }));
        setParticles(newP);
        setTimeout(() => setParticles([]), 600);
      }

      try {
        const res = await fetch("/api/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, type: "beer" }),
        });
        if (!res.ok) throw new Error();
      } catch {
        setMyReactions((prev) =>
          wasActive ? [...prev, "beer"] : prev.filter((t) => t !== "beer")
        );
        setCounts((prev) => ({
          ...prev,
          beer: Math.max(0, (prev.beer ?? 0) + (wasActive ? 1 : -1)),
        }));
        showError("Couldn't send cheers. Try again.");
      }
    },
    [sessionId, myReactions, haptic, showError]
  );

  return (
    <div
      className="flex items-center mx-4 py-3 border-t"
      style={{ gap: "16px", borderColor: "var(--border)" }}
    >
      {/* 👍 Cheers button */}
      <button
        onClick={toggleCheers}
        aria-label={hasReacted ? "Remove cheers" : "Send cheers"}
        className="relative flex items-center transition-colors"
        style={{ gap: "6px" }}
      >
        <motion.span
          className="flex items-center"
          whileTap={microInteraction.press}
          transition={spring.default}
          style={{
            transform: animating ? "scale(1.3)" : "scale(1)",
            transition: "transform 0.2s ease",
            color: hasReacted ? "var(--accent-gold)" : "var(--text-muted)",
          }}
        >
          <ThumbsUp size={16} />
        </motion.span>
        {/* Gold particle burst */}
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "var(--accent-gold)",
              animation: "cheers-burst 0.5s ease-out forwards",
              transform: `rotate(${p.angle}deg)`,
            }}
          />
        ))}
      </button>

      {/* 🍻 Cheers count */}
      <span
        className="flex items-center font-mono"
        style={{
          gap: "4px",
          fontSize: "12px",
          color: hasReacted ? "var(--accent-gold)" : "var(--text-muted)",
        }}
      >
        🍻 Cheers {cheersCount}
      </span>

      {/* 💬 Comment count (toggles comments) — always visible */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleComments?.();
        }}
        className="flex items-center font-mono transition-colors"
        style={{
          gap: "4px",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
        aria-label={`${commentCount ?? 0} comment${(commentCount ?? 0) !== 1 ? "s" : ""}`}
      >
        <MessageCircle size={14} /> Comment {commentCount ?? 0}
      </button>
    </div>
  );
}
