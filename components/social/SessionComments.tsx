"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, Trash2, Loader2 } from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { formatRelativeTime } from "@/lib/utils";
import type { SessionComment } from "@/types/database";

interface SessionCommentsProps {
  sessionId: string;
  currentUserId: string;
  sessionOwnerId: string;
}

export function SessionComments({ sessionId, currentUserId, sessionOwnerId }: SessionCommentsProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<SessionComment[]>([]);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch comment count on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchCount() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/comments`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setCommentCount(data.length);
        }
      } catch {
        // silently fail — count will show nothing
      }
    }
    fetchCount();
    return () => { cancelled = true; };
  }, [sessionId]);

  async function handleExpand() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      const data = await res.json();
      setComments(data);
      setCommentCount(data.length);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    // Optimistic insert
    const optimisticComment: SessionComment = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      user_id: currentUserId,
      body: body.trim(),
      created_at: new Date().toISOString(),
      profile: undefined, // Will be missing for optimistic
    };
    setComments((prev) => [...prev, optimisticComment]);
    setCommentCount((prev) => (prev ?? 0) + 1);
    const savedBody = body;
    setBody("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: savedBody }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to post comment");
      }
      const newComment = await res.json();
      // Replace optimistic with real
      setComments((prev) => prev.map((c) => (c.id === optimisticComment.id ? newComment : c)));
    } catch (e: any) {
      // Rollback optimistic
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setCommentCount((prev) => Math.max(0, (prev ?? 1) - 1));
      setError(e.message);
      setBody(savedBody);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    const prev = comments;
    setComments((c) => c.filter((cm) => cm.id !== commentId));
    setCommentCount((p) => Math.max(0, (p ?? 1) - 1));

    try {
      const res = await fetch(`/api/sessions/${sessionId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      setComments(prev);
      setCommentCount(prev.length);
    }
  }

  const canDelete = (comment: SessionComment) =>
    comment.user_id === currentUserId || sessionOwnerId === currentUserId;

  return (
    <div>
      {/* Toggle button */}
      <button
        onClick={handleExpand}
        className="flex items-center gap-1.5 px-4 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors w-full"
      >
        <MessageCircle size={13} />
        <span>
          {commentCount === null
            ? "Comments"
            : commentCount === 0
              ? "Add a comment..."
              : `${commentCount} comment${commentCount !== 1 ? "s" : ""}`}
        </span>
      </button>

      {/* Expanded comments section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: "var(--border)" }}>
              {/* Loading */}
              {loading && (
                <div className="flex justify-center py-2">
                  <Loader2 size={16} className="animate-spin text-[var(--text-muted)]" />
                </div>
              )}

              {/* Comments list */}
              {!loading && comments.length === 0 && (
                <p className="text-xs text-[var(--text-muted)] text-center py-1">
                  No comments yet. Be the first!
                </p>
              )}

              {!loading &&
                comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 group"
                  >
                    <UserAvatar
                      profile={comment.profile as any ?? { id: comment.user_id, username: "?", display_name: null, avatar_url: null }}
                      size="xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {comment.profile?.display_name ?? comment.profile?.username ?? "You"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {formatRelativeTime(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 break-words">
                        {comment.body}
                      </p>
                    </div>
                    {canDelete(comment) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--danger)] transition-all flex-shrink-0"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </motion.div>
                ))}

              {/* Error */}
              {error && (
                <p className="text-xs text-[var(--danger)] text-center">{error}</p>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write a comment..."
                  maxLength={500}
                  className="flex-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                />
                <button
                  type="submit"
                  disabled={!body.trim() || submitting}
                  className="p-1.5 rounded-xl text-[var(--accent-gold)] disabled:opacity-30 hover:bg-[var(--accent-gold)]/10 transition-colors"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
