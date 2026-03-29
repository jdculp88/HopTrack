"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FollowBreweryButtonProps {
  breweryId: string;
  variant?: "default" | "compact";
}

export function FollowBreweryButton({ breweryId, variant = "default" }: FollowBreweryButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    fetch(`/api/brewery/${breweryId}/follow`)
      .then((r) => r.json())
      .then((data) => {
        setIsFollowing(data.isFollowing);
        setCount(data.count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [breweryId]);

  async function toggle() {
    if (loading) return;
    const prev = isFollowing;
    const prevCount = count;
    setIsFollowing(!prev);
    setCount(prev ? count - 1 : count + 1);
    setLoading(true);

    try {
      const res = await fetch(`/api/brewery/${breweryId}/follow`, {
        method: prev ? "DELETE" : "POST",
      });

      if (!res.ok) {
        setIsFollowing(prev);
        setCount(prevCount);
        error("Something went wrong");
        return;
      }

      success(prev ? "Unfollowed brewery" : "Following brewery");
    } catch {
      setIsFollowing(prev);
      setCount(prevCount);
      error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (variant === "compact") {
    return (
      <button
        onClick={toggle}
        disabled={loading && count === 0}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
        style={{
          background: isFollowing
            ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)"
            : "var(--surface-2)",
          color: isFollowing ? "var(--accent-gold)" : "var(--text-secondary)",
          border: isFollowing
            ? "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)"
            : "1px solid var(--border)",
        }}
      >
        <motion.div
          key={isFollowing ? "on" : "off"}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <Heart
            size={13}
            className={isFollowing ? "fill-[var(--accent-gold)] text-[var(--accent-gold)]" : ""}
          />
        </motion.div>
        {isFollowing ? "Following" : "Follow"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={loading && count === 0}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={{
        background: isFollowing
          ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)"
          : "var(--surface)",
        color: isFollowing ? "var(--accent-gold)" : "var(--text-primary)",
        border: isFollowing
          ? "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)"
          : "1px solid var(--border)",
      }}
    >
      <motion.div
        key={isFollowing ? "on" : "off"}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        <Heart
          size={16}
          className={isFollowing ? "fill-[var(--accent-gold)] text-[var(--accent-gold)]" : ""}
        />
      </motion.div>
      <span>{isFollowing ? "Following" : "Follow"}</span>
      {count > 0 && (
        <span
          className="text-xs font-mono ml-1 opacity-60"
        >
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
}
