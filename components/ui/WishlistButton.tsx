"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface WishlistButtonProps {
  beerId: string;
  initialWishlisted: boolean;
}

export function WishlistButton({ beerId, initialWishlisted }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  async function toggle() {
    if (loading) return;
    const prev = wishlisted;
    setWishlisted(!prev);
    setLoading(true);

    try {
      const res = await fetch("/api/wishlist", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beer_id: beerId }),
      });

      if (!res.ok) {
        setWishlisted(prev);
        error("Something went wrong");
        return;
      }

      success(prev ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      setWishlisted(prev);
      error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="p-2 rounded-xl bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] transition-colors flex-shrink-0"
    >
      <motion.div
        key={wishlisted ? "on" : "off"}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        {wishlisted ? (
          <BookmarkCheck size={18} className="text-[var(--accent-gold)]" />
        ) : (
          <Bookmark size={18} />
        )}
      </motion.div>
    </button>
  );
}
