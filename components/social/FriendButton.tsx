"use client";

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FriendButtonProps {
  profileId: string;
  currentUserId: string;
}

type FriendStatus = "none" | "friends" | "pending_sent" | "pending_received" | "loading";

export function FriendButton({ profileId, currentUserId }: FriendButtonProps) {
  const { success, error: toastError } = useToast();
  const [status, setStatus] = useState<FriendStatus>("loading");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/friends");
        if (!res.ok) { setStatus("none"); return; }
        const data = await res.json();
        const friendships = data.friendships ?? [];

        const match = friendships.find(
          (f: any) =>
            (f.requester_id === currentUserId && f.addressee_id === profileId) ||
            (f.requester_id === profileId && f.addressee_id === currentUserId)
        );

        if (!match) { setStatus("none"); return; }
        if (match.status === "accepted") { setStatus("friends"); return; }
        if (match.status === "pending" && match.requester_id === currentUserId) { setStatus("pending_sent"); return; }
        if (match.status === "pending" && match.addressee_id === currentUserId) { setStatus("pending_received"); return; }
        setStatus("none");
      } catch {
        setStatus("none");
      }
    }
    checkStatus();
  }, [profileId, currentUserId]);

  async function handleAdd() {
    setActing(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressee_id: profileId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      setStatus("pending_sent");
      success("Friend request sent!");
    } catch (err: any) {
      toastError(err.message || "Failed to send friend request");
    } finally {
      setActing(false);
    }
  }

  if (status === "loading") return null;

  if (status === "friends") {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "color-mix(in srgb, #22c55e 12%, transparent)", border: "1px solid color-mix(in srgb, #22c55e 25%, transparent)", color: "#22c55e" }}>
        <UserCheck size={14} />
        Friends
      </div>
    );
  }

  if (status === "pending_sent") {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] rounded-xl text-sm font-medium">
        <Clock size={14} />
        Pending
      </div>
    );
  }

  if (status === "pending_received") {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] rounded-xl text-sm font-medium">
        <Clock size={14} />
        Respond in Friends
      </div>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={acting}
      className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] rounded-xl text-sm font-medium hover:bg-[var(--accent-gold)]/25 transition-colors disabled:opacity-50"
    >
      {acting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
      Add Friend
    </button>
  );
}
