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
  const [loaded, setLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Eagerly fetch comments (not just count) so we can show previews
  useEffect(() => {
    let cancelled = false;
    async function fetchComments() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/comments`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setComments(data);
            setLoaded(true);
          }
        }
      } catch {
        // silently fail
      }
    }
    fetchComments();
    return () => { cancelled = true; };
  }, [sessionId]);

  function handleExpand() {
    setExpanded(!expanded);
    if (!expanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    const optimisticComment: SessionComment = {
      id: `temp-${Date.now()}`,
      session_id: sessionId,
      user_id: currentUserId,
      body: body.trim(),
      created_at: new Date().toISOString(),
      profile: undefined,
    };
    setComments((prev) => [...prev, optimisticComment]);
    const savedBody = body;
    setBody("");

    // Auto-expand so user sees their comment
    if (!expanded) setExpanded(true);

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
      setComments((prev) => prev.map((c) => (c.id === optimisticComment.id ? newComment : c)));
    } catch (e: any) {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setError(e.message);
      setBody(savedBody);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: string) {
    const prev = comments;
    setComments((c) => c.filter((cm) => cm.id !== commentId));

    try {
      const res = await fetch(`/api/sessions/${sessionId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      setComments(prev);
    }
  }

  const canDelete = (comment: SessionComment) =>
    comment.user_id === currentUserId || sessionOwnerId === currentUserId;

  // Preview: show last 2 comments when collapsed
  const previewComments = comments.slice(-2);
  const hiddenCount = Math.max(0, comments.length - 2);

  return (
    <div className="border-t" style={{ borderColor: "var(--border)" }}>
      {/* Preview comments (always visible, last 2) */}
      {loaded && previewComments.length > 0 && !expanded && (
        <div className="px-4 pt-2 space-y-1.5">
          {previewComments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <UserAvatar
                profile={comment.profile ?? { id: comment.user_id, username: "?", display_name: null, avatar_url: null }}
                size="xs"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  {comment.profile?.display_name ?? comment.profile?.username ?? "User"}
                </span>{" "}
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {comment.body}
                </span>
                <span className="text-[10px] ml-1.5" style={{ color: "var(--text-muted)" }}>
                  {formatRelativeTime(comment.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View all / expand toggle */}
      {comments.length > 0 && (
        <button
          onClick={handleExpand}
          className="flex items-center gap-1.5 px-4 py-2 text-xs transition-colors w-full"
          style={{ color: "var(--text-muted)" }}
        >
          <MessageCircle size={12} />
          {expanded
            ? "Hide comments"
            : hiddenCount > 0
              ? `View all ${comments.length} comments`
              : `${comments.length} comment${comments.length !== 1 ? "s" : ""}`
          }
        </button>
      )}

      {/* Expanded comments */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2 space-y-2">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 group"
                >
                  <UserAvatar
                    profile={comment.profile ?? { id: comment.user_id, username: "?", display_name: null, avatar_url: null }}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                        {comment.profile?.display_name ?? comment.profile?.username ?? "You"}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 break-words" style={{ color: "var(--text-secondary)" }}>
                      {comment.body}
                    </p>
                  </div>
                  {canDelete(comment) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 transition-all flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                      aria-label="Delete comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </motion.div>
              ))}

              {error && (
                <p className="text-xs text-center" style={{ color: "var(--danger)" }}>{error}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment input — always visible */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-2">
        <input
          ref={inputRef}
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          maxLength={500}
          className="flex-1 rounded-xl px-3 py-1.5 text-xs outline-none transition-colors"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
        <button
          type="submit"
          disabled={!body.trim() || submitting}
          className="p-1.5 rounded-xl disabled:opacity-30 transition-colors"
          style={{ color: "var(--accent-gold)" }}
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </form>
    </div>
  );
}
