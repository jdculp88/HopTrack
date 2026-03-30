"use client";

import { motion } from "framer-motion";
import { MapPin, Beer, Copy } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ReactionBar } from "@/components/social/ReactionBar";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export interface HopRouteFeedItem {
  route_id: string;
  title: string;
  location_city: string | null;
  completed_at: string;
  stop_count: number;
  stops: Array<{ brewery_name: string }>;
  user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface HopRouteFeedCardProps {
  route: HopRouteFeedItem;
  index: number;
  currentUserId: string;
}

export function HopRouteFeedCard({ route, index, currentUserId }: HopRouteFeedCardProps) {
  const { success } = useToast();
  const isOwn = route.user.id === currentUserId;
  const displayName = route.user.display_name || route.user.username;

  function handleClone() {
    const city = encodeURIComponent(route.location_city ?? "");
    window.location.href = `/hop-route/new?clone=${route.route_id}&city=${city}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.28 }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div className="p-4 pb-3 flex items-center gap-3">
        <Link href={`/profile/${route.user.username}`}>
          <UserAvatar profile={{ display_name: displayName, avatar_url: route.user.avatar_url }} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            <Link href={`/profile/${route.user.username}`} className="hover:underline">{displayName}</Link>
            {" "}
            <span className="font-normal text-[var(--text-secondary)]">completed a HopRoute</span>
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {route.location_city && (
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-0.5">
                <MapPin size={10} /> {route.location_city}
              </span>
            )}
            <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(route.completed_at)}</span>
          </div>
        </div>
      </div>

      {/* Route title + stops */}
      <div className="px-4 pb-3 space-y-2">
        <Link href={`/hop-route/${route.route_id}`} className="block">
          <h3 className="font-display font-bold text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors">
            {route.title}
          </h3>
        </Link>
        <div className="flex flex-wrap gap-1.5">
          {route.stops.slice(0, 4).map((stop, i) => (
            <span
              key={i}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
            >
              <Beer size={9} className="text-[var(--accent-gold)]" />
              {stop.brewery_name}
            </span>
          ))}
          {route.stops.length > 4 && (
            <span className="text-xs text-[var(--text-muted)] px-2 py-1">+{route.stops.length - 4} more</span>
          )}
        </div>
      </div>

      {/* Clone CTA */}
      {!isOwn && (
        <div className="px-4 pb-3">
          <button
            onClick={handleClone}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-colors"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 25%, transparent)", color: "var(--accent-gold)" }}
          >
            <Copy size={11} /> Clone this route
          </button>
        </div>
      )}

      {/* Reaction bar */}
      <div className="px-4 pb-4">
        <ReactionBar />
      </div>
    </motion.div>
  );
}
