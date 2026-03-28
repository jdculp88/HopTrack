"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Trophy, Search, UserPlus, Loader2, UserX, Clock, X } from "lucide-react";
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
  const [tab, setTab] = useState<Tab>("leaderboard");
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
      // Find the friendship row
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Friends</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-1">
        {([
          { key: "leaderboard", label: "Leaderboards", icon: Trophy },
          { key: "friends",     label: "My Friends",    icon: Users },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === key
                ? "bg-[#D4A843]/10 text-[#D4A843]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            <Icon size={14} />
            {label}
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
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  leaderboardType === t
                    ? "bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[#6B6456]"
                }`}
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
          {/* Pending incoming requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-[#D4A843] uppercase tracking-wider">
                Requests ({pendingRequests.length})
              </p>
              {pendingRequests.map((req: any) => (
                <div key={req.id} className="flex items-center gap-3">
                  <UserAvatar profile={req.requester} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{req.requester.display_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">@{req.requester.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(req.id)}
                      disabled={loadingRequest === req.id}
                      className="text-xs bg-[#3D7A52]/20 text-[#3D7A52] border border-[#3D7A52]/30 px-3 py-1.5 rounded-xl hover:bg-[#3D7A52]/30 transition-colors disabled:opacity-50"
                    >
                      {loadingRequest === req.id ? <Loader2 size={12} className="animate-spin" /> : "Accept"}
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      disabled={loadingRequest === req.id}
                      className="text-xs bg-[#C44B3A]/10 text-[#C44B3A] border border-[#C44B3A]/20 px-3 py-1.5 rounded-xl hover:bg-[#C44B3A]/20 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outgoing sent requests */}
          {sentRequests.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-3">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Sent ({sentRequests.length})
              </p>
              {sentRequests.map((req: any) => (
                <div key={req.id} className="flex items-center gap-3">
                  <UserAvatar profile={req.addressee} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{req.addressee.display_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">@{req.addressee.username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock size={12} />
                      Pending
                    </span>
                    <button
                      onClick={() => handleCancelSent(req.id)}
                      disabled={loadingRequest === req.id}
                      className="text-xs text-[var(--text-muted)] hover:text-[#C44B3A] border border-[var(--border)] hover:border-[#C44B3A]/30 px-2.5 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {loadingRequest === req.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search friends or find new ones..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors text-sm"
            />
            {searching && (
              <Loader2 size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] animate-spin" />
            )}
          </div>

          {/* Search results — users not yet friends */}
          {searchQuery.length >= 2 && filteredSearchResults.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider px-1">Add Friends</p>
              {filteredSearchResults.map((user: any) => (
                <div key={user.id} className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
                  <UserAvatar profile={user} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.display_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => handleAddFriend(user.id)}
                    disabled={sendingRequest === user.id}
                    className="flex items-center gap-1.5 text-xs bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30 px-3 py-1.5 rounded-xl hover:bg-[#D4A843]/25 transition-colors disabled:opacity-50"
                  >
                    {sendingRequest === user.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <UserPlus size={12} />
                    )}
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !searching && filteredSearchResults.length === 0 && filteredFriends.length === 0 && (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No users found for &ldquo;{searchQuery}&rdquo;</p>
          )}

          {/* Friends list */}
          {filteredFriends.length === 0 && searchQuery.length < 2 && pendingRequests.length === 0 && sentRequests.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-5xl">🍻</p>
              <p className="font-display text-xl text-[var(--text-primary)]">Drinking solo?</p>
              <p className="text-sm text-[var(--text-secondary)]">Search by username above to find friends and share the round.</p>
            </div>
          ) : filteredFriends.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider px-1">
                Friends ({filteredFriends.length})
              </p>
              {filteredFriends.map((friend: any) => (
                <div key={friend.id} className="overflow-hidden rounded-2xl border border-[var(--border)]">
                  <div className="flex items-center gap-3 p-3 bg-[var(--surface)] group">
                    <Link href={`/profile/${friend.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                      <UserAvatar profile={friend} size="sm" showLevel />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-semibold text-[var(--text-primary)] truncate group-hover:text-[#D4A843] transition-colors text-sm">
                          {friend.display_name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">@{friend.username} · {friend.total_checkins} sessions</p>
                      </div>
                    </Link>
                    <button
                      onClick={() => setConfirmUnfriendId(confirmUnfriendId === friend.id ? null : friend.id)}
                      className="p-2 rounded-lg transition-colors flex-shrink-0 hover:bg-[var(--surface-2)]"
                      style={{ color: confirmUnfriendId === friend.id ? "var(--danger)" : "var(--text-muted)" }}
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
                        <div className="flex items-center justify-between px-4 py-3 border-t"
                          style={{ background: "rgba(196,75,58,0.06)", borderColor: "var(--border)" }}>
                          <span className="text-xs text-[var(--text-secondary)]">
                            Remove <strong className="text-[var(--text-primary)]">{friend.display_name}</strong>?
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
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
