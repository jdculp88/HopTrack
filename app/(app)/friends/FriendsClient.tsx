"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Trophy, Search, UserPlus, Loader2, UserX, Clock, X, Beer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardRow } from "@/components/social/LeaderboardRow";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import type { LeaderboardEntry } from "@/types/database";

type Tab = "leaderboard" | "friends";
type LeaderboardType = "sessions" | "beers" | "breweries";

interface FriendsClientProps {
  currentUserId: string;
  checkinLeaders: LeaderboardEntry[];
  beerLeaders: LeaderboardEntry[];
  breweryLeaders: LeaderboardEntry[];
  pendingRequests: any[];
  sentRequests: any[];
  friendships: any[];
}

export function FriendsClient({
  currentUserId,
  checkinLeaders,
  beerLeaders,
  breweryLeaders,
  pendingRequests: initialPending,
  sentRequests: initialSent,
  friendships,
}: FriendsClientProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<Tab>("friends");
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("sessions");
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRequests, setPendingRequests] = useState(initialPending);
  const [sentRequests, setSentRequests] = useState(initialSent);
  const [loadingRequest, setLoadingRequest] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [confirmUnfriendId, setConfirmUnfriendId] = useState<string | null>(null);
  const [unfriending, setUnfriending] = useState<string | null>(null);
  const [confirmCancelSentId, setConfirmCancelSentId] = useState<string | null>(null);

  const leaderboards: Record<LeaderboardType, { data: LeaderboardEntry[]; label: string }> = {
    sessions:  { data: checkinLeaders,  label: "sessions" },
    beers:     { data: beerLeaders,     label: "unique beers" },
    breweries: { data: breweryLeaders,  label: "breweries" },
  };

  const friends = friendships.map((f: any) =>
    f.requester_id === currentUserId ? { ...f.addressee, friendshipId: f.id ?? f.requester_id + f.addressee_id } : { ...f.requester, friendshipId: f.id ?? f.requester_id + f.addressee_id }
  );

  const filteredFriends = searchQuery
    ? friends.filter((f: any) =>
        f.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : friends;

  // Accept friend request
  const handleAccept = useCallback(async (reqId: string) => {
    setLoadingRequest(reqId);
    try {
      const res = await fetch("/api/friends", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId, status: "accepted" }),
      });
      if (!res.ok) throw new Error("Failed to accept");
      setPendingRequests((prev) => prev.filter((r: any) => r.id !== reqId));
      success("Friend request accepted!");
      router.refresh();
    } catch {
      toastError("Failed to accept friend request");
    } finally {
      setLoadingRequest(null);
    }
  }, [router, success, toastError]);

  // Decline friend request
  const handleDecline = useCallback(async (reqId: string) => {
    setLoadingRequest(reqId);
    try {
      const res = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId }),
      });
      if (!res.ok) throw new Error("Failed to decline");
      setPendingRequests((prev) => prev.filter((r: any) => r.id !== reqId));
      success("Friend request declined");
      router.refresh();
    } catch {
      toastError("Failed to decline friend request");
    } finally {
      setLoadingRequest(null);
    }
  }, [router, success, toastError]);

  // Cancel outgoing request
  const handleCancelSent = useCallback(async (reqId: string) => {
    setLoadingRequest(reqId);
    try {
      const res = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reqId }),
      });
      if (!res.ok) throw new Error("Failed to cancel");
      setSentRequests((prev) => prev.filter((r: any) => r.id !== reqId));
      setConfirmCancelSentId(null);
      success("Friend request cancelled");
    } catch {
      toastError("Failed to cancel request");
    } finally {
      setLoadingRequest(null);
    }
  }, [success, toastError]);

  // Unfriend
  const handleUnfriend = useCallback(async (friendId: string) => {
    setUnfriending(friendId);
    try {
      const friendship = friendships.find(
        (f: any) =>
          (f.requester_id === currentUserId && f.addressee_id === friendId) ||
          (f.requester_id === friendId && f.addressee_id === currentUserId)
      );
      if (!friendship) throw new Error("Friendship not found");

      const res = await fetch("/api/friends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: friendship.id ?? friendship.requester_id }),
      });
      if (!res.ok) throw new Error("Failed to unfriend");
      success("Friend removed");
      setConfirmUnfriendId(null);
      router.refresh();
    } catch {
      toastError("Failed to remove friend");
    } finally {
      setUnfriending(null);
    }
  }, [currentUserId, friendships, router, success, toastError]);

  // Search users
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users ?? []);
      }
    } catch {
      // silent — search is best-effort
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const onSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimer) clearTimeout(searchTimer);
    const timer = setTimeout(() => handleSearch(value), 300);
    setSearchTimer(timer);
  }, [searchTimer, handleSearch]);

  // Send friend request
  const handleAddFriend = useCallback(async (addresseeId: string) => {
    setSendingRequest(addresseeId);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addressee_id: addresseeId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send request");
      }
      success("Friend request sent!");
      setSearchResults((prev) => prev.filter((u: any) => u.id !== addresseeId));
    } catch (err: any) {
      toastError(err.message || "Failed to send friend request");
    } finally {
      setSendingRequest(null);
    }
  }, [success, toastError]);

  // Filter search results: exclude self, existing friends, pending requests
  const friendIds = new Set(friends.map((f: any) => f.id));
  const pendingIds = new Set([
    ...pendingRequests.map((r: any) => r.requester?.id),
    ...sentRequests.map((r: any) => r.addressee?.id),
  ]);
  const filteredSearchResults = searchResults.filter(
    (u: any) => u.id !== currentUserId && !friendIds.has(u.id) && !pendingIds.has(u.id)
  );

  const totalRequests = pendingRequests.length + sentRequests.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-sans text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Friends</h1>

      {/* Tab bar */}
      <div
        className="flex gap-1 rounded-2xl p-1"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {([
          { key: "friends" as Tab, label: "My Friends", icon: Users, count: friends.length },
          { key: "leaderboard" as Tab, label: "Leaderboards", icon: Trophy, count: null },
        ] as const).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={
              tab === key
                ? { background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }
                : { color: "var(--text-muted)" }
            }
          >
            <Icon size={14} />
            {label}
            {count !== null && count > 0 && (
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-md"
                style={{
                  background: tab === key
                    ? "color-mix(in srgb, var(--accent-gold) 15%, transparent)"
                    : "var(--surface-2)",
                  color: tab === key ? "var(--accent-gold)" : "var(--text-muted)",
                }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "leaderboard" && (
        <>
          {/* Leaderboard sub-tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(["sessions", "beers", "breweries"] as LeaderboardType[]).map((t) => (
              <button
                key={t}
                onClick={() => setLeaderboardType(t)}
                className="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={
                  leaderboardType === t
                    ? {
                        background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                        color: "var(--accent-gold)",
                        border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
                      }
                    : {
                        background: "var(--surface)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                {t === "sessions" ? "Sessions" : t === "beers" ? "Unique Beers" : "Breweries"}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            {leaderboards[leaderboardType].data.map((entry, i) => (
              <LeaderboardRow
                key={entry.profile.id}
                entry={entry}
                label={leaderboards[leaderboardType].label}
                currentUserId={currentUserId}
                index={i}
              />
            ))}
          </div>
        </>
      )}

      {tab === "friends" && (
        <>
          {/* Search — prominent at top */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search friends or find new ones..."
              className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm transition-colors focus:outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent-gold)"; }}
              onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--border)"; }}
            />
            {searching && (
              <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "var(--text-muted)" }} />
            )}
          </div>

          {/* Search results — users not yet friends */}
          <AnimatePresence>
            {searchQuery.length >= 2 && filteredSearchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-1 overflow-hidden"
              >
                <p className="text-xs font-medium uppercase tracking-wider px-1" style={{ color: "var(--text-muted)" }}>Add Friends</p>
                {filteredSearchResults.map((user: any) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <UserAvatar profile={user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.display_name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{user.username}</p>
                    </div>
                    <button
                      onClick={() => handleAddFriend(user.id)}
                      disabled={sendingRequest === user.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                      style={{
                        background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                        color: "var(--accent-gold)",
                        border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
                      }}
                    >
                      {sendingRequest === user.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <UserPlus size={12} />
                      )}
                      Add
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {searchQuery.length >= 2 && !searching && filteredSearchResults.length === 0 && filteredFriends.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>No users found for &ldquo;{searchQuery}&rdquo;</p>
          )}

          {/* Pending incoming requests */}
          <AnimatePresence>
            {pendingRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-bg-notification rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                  >
                    {pendingRequests.length}
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
                    Friend Request{pendingRequests.length > 1 ? "s" : ""}
                  </p>
                </div>
                {pendingRequests.map((req: any) => (
                  <motion.div
                    key={req.id}
                    layout
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="flex items-center gap-3"
                  >
                    <Link href={`/profile/${req.requester.username}`}>
                      <UserAvatar profile={req.requester} size="sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{req.requester.display_name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{req.requester.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req.id)}
                        disabled={loadingRequest === req.id}
                        className="text-xs px-3.5 py-1.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                        style={{
                          background: "color-mix(in srgb, #3D7A52 20%, transparent)",
                          color: "#3D7A52",
                          border: "1px solid color-mix(in srgb, #3D7A52 30%, transparent)",
                        }}
                      >
                        {loadingRequest === req.id ? <Loader2 size={12} className="animate-spin" /> : "Accept"}
                      </button>
                      <button
                        onClick={() => handleDecline(req.id)}
                        disabled={loadingRequest === req.id}
                        className="text-xs px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                        style={{
                          background: "color-mix(in srgb, var(--danger) 10%, transparent)",
                          color: "var(--danger)",
                          border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Outgoing sent requests */}
          <AnimatePresence>
            {sentRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl p-4 space-y-3"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                  Sent ({sentRequests.length})
                </p>
                {sentRequests.map((req: any) => (
                  <motion.div
                    key={req.id}
                    layout
                    exit={{ opacity: 0, x: -100, height: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="overflow-hidden rounded-2xl"
                    style={{ border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center gap-3 p-3" style={{ background: "var(--surface)" }}>
                      <Link href={`/profile/${req.addressee.username}`}>
                        <UserAvatar profile={req.addressee} size="sm" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{req.addressee.display_name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>@{req.addressee.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                          <Clock size={12} />
                          Pending
                        </span>
                        <button
                          onClick={() => setConfirmCancelSentId(confirmCancelSentId === req.id ? null : req.id)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{
                            color: confirmCancelSentId === req.id ? "var(--danger)" : "var(--text-muted)",
                            background: confirmCancelSentId === req.id ? "color-mix(in srgb, var(--danger) 8%, transparent)" : "transparent",
                            border: "1px solid var(--border)",
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Inline cancel confirmation */}
                    <AnimatePresence>
                      {confirmCancelSentId === req.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="flex items-center justify-between px-4 py-3 border-t"
                            style={{ background: "color-mix(in srgb, var(--danger) 5%, var(--surface))", borderColor: "var(--border)" }}
                          >
                            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              Cancel request to <strong style={{ color: "var(--text-primary)" }}>{req.addressee.display_name}</strong>?
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setConfirmCancelSentId(null)}
                                className="px-3 py-1 rounded-lg text-xs font-medium"
                                style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
                              >
                                Keep
                              </button>
                              <button
                                onClick={() => handleCancelSent(req.id)}
                                disabled={loadingRequest === req.id}
                                className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                                style={{ background: "var(--danger)", color: "#fff" }}
                              >
                                {loadingRequest === req.id ? <Loader2 size={12} className="animate-spin" /> : "Cancel Request"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Friends list */}
          {filteredFriends.length === 0 && searchQuery.length < 2 && pendingRequests.length === 0 && sentRequests.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)" }}
              >
                <Beer size={32} style={{ color: "var(--accent-gold)" }} />
              </div>
              <div>
                <p className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>Drinking solo?</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Find your crew! Search by username above to add friends and share the round.</p>
              </div>
              <button
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search friends"]');
                  input?.focus();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                  color: "var(--accent-gold)",
                  border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
                }}
              >
                <Search size={14} />
                Find Friends
              </button>
            </div>
          ) : filteredFriends.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider px-1" style={{ color: "var(--text-muted)" }}>
                Friends ({filteredFriends.length})
              </p>
              {filteredFriends.map((friend: any, i: number) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, type: "spring", stiffness: 400, damping: 30 }}
                  className="overflow-hidden rounded-2xl"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <div
                    className="flex items-center gap-3 p-3 group"
                    style={{ background: "var(--surface)" }}
                  >
                    <Link href={`/profile/${friend.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <UserAvatar profile={friend} size="sm" showLevel />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold truncate text-sm transition-colors" style={{ color: "var(--text-primary)" }}>
                          {friend.display_name}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          @{friend.username} · {friend.total_checkins} sessions
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => setConfirmUnfriendId(confirmUnfriendId === friend.id ? null : friend.id)}
                      className="p-2 rounded-lg transition-colors flex-shrink-0"
                      style={{
                        color: confirmUnfriendId === friend.id ? "var(--danger)" : "var(--text-muted)",
                        background: confirmUnfriendId === friend.id ? "color-mix(in srgb, var(--danger) 8%, transparent)" : "transparent",
                      }}
                    >
                      <UserX size={15} />
                    </button>
                  </div>

                  {/* Inline unfriend confirmation */}
                  <AnimatePresence>
                    {confirmUnfriendId === friend.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between px-4 py-3 border-t"
                          style={{ background: "color-mix(in srgb, var(--danger) 5%, var(--surface))", borderColor: "var(--border)" }}
                        >
                          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                            Remove <strong style={{ color: "var(--text-primary)" }}>{friend.display_name}</strong>?
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmUnfriendId(null)}
                              className="px-3 py-1 rounded-lg text-xs font-medium"
                              style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUnfriend(friend.id)}
                              disabled={unfriending === friend.id}
                              className="px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50"
                              style={{ background: "var(--danger)", color: "#fff" }}
                            >
                              {unfriending === friend.id ? <Loader2 size={12} className="animate-spin" /> : "Unfriend"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
