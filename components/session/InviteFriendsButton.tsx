"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, X, UserPlus, Check, PlusCircle, Search } from "lucide-react";
import Image from "next/image";
import { cn, getInitials, generateGradientFromString } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import type { SessionParticipant } from "@/types/database";

interface Friend {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface InviteFriendsButtonProps {
  sessionId: string;
  isOwner: boolean;
  /** Optional externally-fetched participants (e.g. from banner) */
  participants?: SessionParticipant[];
  /** When true, show a pulse ring on recently-active participants */
  showActivityPulse?: boolean;
}

const SPRING = { type: "spring" as const, stiffness: 400, damping: 30 };

/** Returns true if participant was updated within the last 5 minutes */
function isRecentlyActive(p: SessionParticipant): boolean {
  if (!p.updated_at) return false;
  return Date.now() - new Date(p.updated_at).getTime() < 5 * 60 * 1000;
}

export function InviteFriendsButton({ sessionId, isOwner, participants: externalParticipants, showActivityPulse = false }: InviteFriendsButtonProps) {
  const [open, setOpen] = useState(false);
  const [localParticipants, setLocalParticipants] = useState<SessionParticipant[]>([]);
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviting, setInviting] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError } = useToast();

  // Use external participants if provided, otherwise use locally-fetched
  const participants = externalParticipants ?? localParticipants;

  useEffect(() => {
    if (!externalParticipants) {
      fetchParticipants();
    }
  }, [sessionId, externalParticipants]);

  useEffect(() => {
    if (!open) return;
    fetchFriends();
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  async function fetchParticipants() {
    const res = await fetch(`/api/sessions/${sessionId}/participants`);
    if (res.ok) setLocalParticipants(await res.json());
  }

  async function fetchFriends() {
    const res = await fetch("/api/friends");
    if (!res.ok) return;
    const data = await res.json();
    const list: Friend[] = (data.friends ?? data).map((f: any) => ({
      id: f.profile?.id ?? f.friend_id ?? f.id,
      username: f.profile?.username ?? f.username,
      display_name: f.profile?.display_name ?? f.display_name ?? null,
      avatar_url: f.profile?.avatar_url ?? f.avatar_url ?? null,
    }));
    setAllFriends(list);
  }

  async function invite(friend: Friend) {
    setInviting((prev) => new Set(prev).add(friend.id));
    try {
      const res = await fetch(`/api/sessions/${sessionId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: friend.id }),
      });
      if (!res.ok) throw new Error();
      if (!externalParticipants) await fetchParticipants();
      success(`Invite sent to ${friend.display_name ?? friend.username}!`);
    } catch {
      toastError("Failed to send invite");
    } finally {
      setInviting((prev) => { const s = new Set(prev); s.delete(friend.id); return s; });
    }
  }

  const invitedIds = new Set(participants.map((p) => p.user_id));
  const acceptedParticipants = participants.filter((p) => p.status === "accepted");

  // Filter friends by search query
  const filteredFriends = searchQuery.trim()
    ? allFriends.filter((f) => {
        const q = searchQuery.toLowerCase();
        return (
          (f.display_name?.toLowerCase().includes(q) ?? false) ||
          f.username.toLowerCase().includes(q)
        );
      })
    : allFriends;

  if (!isOwner) {
    // Non-owners: read-only participant strip with optional pulse rings
    if (acceptedParticipants.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5">
        {acceptedParticipants.slice(0, 3).map((p) => {
          const active = showActivityPulse && isRecentlyActive(p);
          const profile = p.profile;
          const displayName = profile?.display_name ?? profile?.username ?? "?";
          const gradient = generateGradientFromString(displayName + (profile?.username ?? ""));
          return (
            <div key={p.id} className="relative flex-shrink-0">
              {active && (
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 40%, transparent)" }}
                />
              )}
              <div
                className="w-6 h-6 relative rounded-full overflow-hidden flex items-center justify-center border-2"
                style={{ borderColor: "var(--bg)", background: profile?.avatar_url ? undefined : gradient }}
                title={displayName}
              >
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt={displayName} fill className="object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-white select-none">{getInitials(displayName)}</span>
                )}
              </div>
            </div>
          );
        })}
        {acceptedParticipants.length > 3 && (
          <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
            +{acceptedParticipants.length - 3}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger row */}
      <div className="flex items-center gap-1.5">
        {/* Participant avatars with optional pulse rings */}
        {acceptedParticipants.length > 0 && (
          <div className="flex items-center">
            {acceptedParticipants.slice(0, 3).map((p, i) => {
              const active = showActivityPulse && isRecentlyActive(p);
              const profile = p.profile;
              const displayName = profile?.display_name ?? profile?.username ?? "?";
              const gradient = generateGradientFromString(displayName + (profile?.username ?? ""));
              return (
                <div
                  key={p.id}
                  className={cn("relative flex-shrink-0", i > 0 && "-ml-1.5")}
                  style={{ zIndex: acceptedParticipants.length - i }}
                >
                  {active && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: "color-mix(in srgb, var(--accent-gold) 40%, transparent)" }}
                    />
                  )}
                  <div
                    className="w-6 h-6 relative rounded-full overflow-hidden flex items-center justify-center border-2"
                    style={{ borderColor: "var(--bg)", background: profile?.avatar_url ? undefined : gradient }}
                    title={displayName}
                  >
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt={displayName} fill className="object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-white select-none">{getInitials(displayName)}</span>
                    )}
                  </div>
                </div>
              );
            })}
            {acceptedParticipants.length > 3 && (
              <span className="ml-1 text-xs font-medium tabular-nums" style={{ color: "var(--text-muted)" }}>
                +{acceptedParticipants.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Invite button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors"
          style={{
            background: "var(--surface-2)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          <PlusCircle size={12} />
          Invite
        </button>
      </div>

      {/* Invite panel — slides up from banner */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={SPRING}
            className="absolute bottom-full mb-2 right-0 w-72 rounded-2xl overflow-hidden z-50"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-3 py-2.5"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span
                className="text-xs font-semibold font-mono uppercase tracking-wide flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Users size={12} />
                Invite Friends
              </span>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full transition-colors"
                style={{ color: "var(--text-muted)" }}
                aria-label="Close invite panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Search */}
            <div className="px-3 pt-2.5 pb-1.5">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search friends..."
                  className="w-full rounded-xl pl-8 pr-3 py-2 text-xs outline-none"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent-gold)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; }}
                />
              </div>
            </div>

            {/* Friends list */}
            <div className="max-h-52 overflow-y-auto pb-1.5">
              {allFriends.length === 0 && (
                <p className="px-3 py-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  No friends to invite yet
                </p>
              )}
              {allFriends.length > 0 && filteredFriends.length === 0 && (
                <p className="px-3 py-4 text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  No friends match "{searchQuery}"
                </p>
              )}
              {filteredFriends.map((friend) => {
                const already = invitedIds.has(friend.id);
                const busy = inviting.has(friend.id);
                const displayName = friend.display_name ?? friend.username;
                const gradient = generateGradientFromString(displayName + friend.username);

                return (
                  <div
                    key={friend.id}
                    className="flex items-center gap-2.5 px-3 py-2 transition-colors"
                    style={{ background: "transparent" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 relative rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: friend.avatar_url ? undefined : gradient }}
                    >
                      {friend.avatar_url ? (
                        <Image src={friend.avatar_url} alt={displayName} fill className="object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-white">{getInitials(displayName)}</span>
                      )}
                    </div>

                    {/* Name */}
                    <span
                      className="flex-1 text-sm font-medium truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {displayName}
                    </span>

                    {/* Invite button */}
                    <button
                      onClick={() => !already && !busy && invite(friend)}
                      disabled={already || busy}
                      aria-label={already ? `${displayName} invited` : `Invite ${displayName}`}
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 transition-colors",
                        already ? "opacity-50 cursor-default" : "cursor-pointer hover:opacity-80"
                      )}
                      style={{
                        background: already ? "var(--surface-2)" : "var(--accent-gold)",
                        color: already ? "var(--text-muted)" : "#000",
                      }}
                    >
                      {already ? (
                        <Check size={13} />
                      ) : busy ? (
                        <div className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      ) : (
                        <UserPlus size={13} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
