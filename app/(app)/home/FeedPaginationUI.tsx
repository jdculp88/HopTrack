"use client";

import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/SkeletonLoader";

export function FeedLoadingSpinner() {
  return (
    <div className="flex justify-center py-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: "var(--accent-gold)",
          borderRightColor: "var(--accent-gold)",
        }}
      />
    </div>
  );
}

export function FeedEndMessage() {
  return (
    <div className="text-center py-6">
      <p
        className="text-xs font-mono uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        You're all caught up
      </p>
    </div>
  );
}

/** Skeleton placeholder that matches SessionCard proportions. */
export function FeedCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Avatar + name row */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-12 flex-shrink-0" />
      </div>

      {/* Brewery / session headline */}
      <Skeleton className="h-4 w-3/4" />

      {/* Beer list lines */}
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>

      {/* Reaction bar stub */}
      <div className="flex items-center gap-4 pt-1">
        <Skeleton className="h-7 w-20 rounded-lg" />
        <Skeleton className="h-7 w-16 rounded-lg" />
        <Skeleton className="h-7 w-14 rounded-lg ml-auto" />
      </div>
    </div>
  );
}

/** Renders `count` FeedCardSkeleton cards (default 3). */
export function FeedCardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </>
  );
}
