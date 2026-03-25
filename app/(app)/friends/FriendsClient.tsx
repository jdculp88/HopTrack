"use client";

import { useState } from "react";
import { Users, Trophy, Search } from "lucide-react";
import { LeaderboardRow } from "@/components/social/LeaderboardRow";
import { UserAvatar } from "@/components/ui/UserAvatar";
import Link from "next/link";
import type { LeaderboardEntry } from "@/types/database";

type Tab = "leaderboard" | "friends";
type LeaderboardType = "checkins" | "beers" | "breweries";

interface FriendsClientProps {
  currentUserId: string;
  checkinLeaders: LeaderboardEntry[];
  beerLeaders: LeaderboardEntry[];
  breweryLeaders: LeaderboardEntry[];
  pendingRequests: any[];
  friendships: any[];
}

export function FriendsClient({
  currentUserId,
  checkinLeaders,
  beerLeaders,
  breweryLeaders,
  pendingRequests,
  friendships,
}: FriendsClientProps) {
  const [tab, setTab] = useState<Tab>("leaderboard");
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("checkins");
  const [searchQuery, setSearchQuery] = useState("");

  const leaderboards: Record<LeaderboardType, { data: LeaderboardEntry[]; label: string }> = {
    checkins:  { data: checkinLeaders,  label: "check-ins" },
    beers:     { data: beerLeaders,     label: "unique beers" },
    breweries: { data: breweryLeaders,  label: "breweries" },
  };

  const friends = friendships.map((f) =>
    f.requester_id === currentUserId ? f.addressee : f.requester
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
            {(["checkins", "beers", "breweries"] as LeaderboardType[]).map((t) => (
              <button
                key={t}
                onClick={() => setLeaderboardType(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  leaderboardType === t
                    ? "bg-[#D4A843]/15 text-[#D4A843] border border-[#D4A843]/30"
                    : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[#6B6456]"
                }`}
              >
                {t === "checkins" ? "Check-ins" : t === "beers" ? "Unique Beers" : "Breweries"}
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
          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div className="bg-[#D4A843]/5 border border-[#D4A843]/20 rounded-2xl p-4 space-y-3">
              <p className="text-sm font-medium text-[#D4A843]">{pendingRequests.length} pending request{pendingRequests.length > 1 ? "s" : ""}</p>
              {pendingRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3">
                  <UserAvatar profile={req.requester} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{req.requester.display_name}</p>
                    <p className="text-xs text-[var(--text-muted)]">@{req.requester.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs bg-[#3D7A52]/20 text-[#3D7A52] border border-[#3D7A52]/30 px-3 py-1.5 rounded-xl">Accept</button>
                    <button className="text-xs bg-[#C44B3A]/10 text-[#C44B3A] border border-[#C44B3A]/20 px-3 py-1.5 rounded-xl">Decline</button>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#D4A843] transition-colors text-sm"
            />
          </div>

          {/* Friends list */}
          {friends.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <p className="text-5xl">👥</p>
              <p className="font-display text-xl text-[var(--text-primary)]">No friends yet</p>
              <p className="text-sm text-[var(--text-secondary)]">Search for friends by username to connect.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend: any) => (
                <Link key={friend.id} href={`/profile/${friend.username}`}>
                  <div className="flex items-center gap-3 p-3 bg-[var(--surface)] border border-[var(--border)] hover:border-[#D4A843]/30 rounded-2xl transition-colors group">
                    <UserAvatar profile={friend} size="sm" showLevel />
                    <div className="flex-1 min-w-0">
                      <p className="font-sans font-semibold text-[var(--text-primary)] truncate group-hover:text-[#D4A843] transition-colors text-sm">
                        {friend.display_name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">@{friend.username} · {friend.total_checkins} check-ins</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
