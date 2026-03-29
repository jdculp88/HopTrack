"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Session } from "@/types/database";

interface FeedPage {
  sessions: Session[];
  reactionCounts: Record<string, Record<string, number>>;
  userReactions: Record<string, string[]>;
  commentCounts: Record<string, number>;
  hasMore: boolean;
}

interface UseFeedPaginationOptions {
  initialSessions: Session[];
  initialReactionCounts?: Record<string, Record<string, number>>;
  initialUserReactions?: Record<string, string[]>;
  initialCommentCounts?: Record<string, number>;
  tab: "friends" | "you";
}

export function useFeedPagination({
  initialSessions,
  initialReactionCounts,
  initialUserReactions,
  initialCommentCounts,
  tab,
}: UseFeedPaginationOptions) {
  // Initial page is 1 (SSR), so next fetch starts at page 2
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialSessions.length >= 20);

  const [extraSessions, setExtraSessions] = useState<Session[]>([]);
  const [extraReactionCounts, setExtraReactionCounts] = useState<
    Record<string, Record<string, number>>
  >({});
  const [extraUserReactions, setExtraUserReactions] = useState<
    Record<string, string[]>
  >({});
  const [extraCommentCounts, setExtraCommentCounts] = useState<
    Record<string, number>
  >({});

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch(`/api/feed?tab=${tab}&page=${page}`);
      if (!res.ok) throw new Error("Feed fetch failed");

      const data: FeedPage = await res.json();

      setExtraSessions((prev) => [...prev, ...data.sessions]);
      setExtraReactionCounts((prev) => ({ ...prev, ...data.reactionCounts }));
      setExtraUserReactions((prev) => ({ ...prev, ...data.userReactions }));
      setExtraCommentCounts((prev) => ({ ...prev, ...data.commentCounts }));
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch {
      // Silently fail — user can scroll again to retry
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [hasMore, page, tab]);

  // IntersectionObserver to auto-trigger loadMore
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingRef.current && hasMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  // Merge initial + extra data
  const sessions = [...initialSessions, ...extraSessions];
  const reactionCounts = {
    ...(initialReactionCounts ?? {}),
    ...extraReactionCounts,
  };
  const userReactions = {
    ...(initialUserReactions ?? {}),
    ...extraUserReactions,
  };
  const commentCounts = {
    ...(initialCommentCounts ?? {}),
    ...extraCommentCounts,
  };

  return {
    sessions,
    reactionCounts,
    userReactions,
    commentCounts,
    loading,
    hasMore,
    sentinelRef,
  };
}
