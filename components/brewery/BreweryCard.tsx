"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { MapPin, Users, Calendar, Eye, Share2, Copy, Compass } from "lucide-react";
import { cn, formatCount } from "@/lib/utils";
import { breweryTransitionName } from "@/lib/view-transitions";
import type { BreweryWithStats } from "@/types/database";
import { useLongPress } from "@/hooks/useLongPress";
import { ContextMenu, type ContextMenuItem } from "@/components/ui/ContextMenu";

const BREWERY_PLACEHOLDER_IMAGES = [
  "https://picsum.photos/seed/brewery1/400/200",
  "https://picsum.photos/seed/brewery2/400/200",
  "https://picsum.photos/seed/brewery3/400/200",
  "https://picsum.photos/seed/brewery4/400/200",
  "https://picsum.photos/seed/brewery5/400/200",
  "https://picsum.photos/seed/brewery6/400/200",
  "https://picsum.photos/seed/brewery7/400/200",
  "https://picsum.photos/seed/brewery8/400/200",
];

/** Pick a deterministic placeholder image from the brewery name */
export function getBreweryPlaceholder(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return BREWERY_PLACEHOLDER_IMAGES[Math.abs(hash) % BREWERY_PLACEHOLDER_IMAGES.length];
}

const BREWERY_TYPE_LABELS: Record<string, string> = {
  micro: "Microbrewery",
  nano: "Nanobrewery",
  regional: "Regional",
  brewpub: "Brewpub",
  large: "Large",
  taproom: "Taproom",
  bar: "Bar",
  contract: "Contract",
  proprietor: "Proprietor",
  planning: "Planning",
  closed: "Closed",
};

interface BreweryCardProps {
  brewery: BreweryWithStats;
  distance?: string;
  variant?: "default" | "featured" | "compact";
  className?: string;
}

export function BreweryCard({ brewery, distance, variant = "default", className }: BreweryCardProps) {
  const placeholderSrc = getBreweryPlaceholder(brewery.name);
  const coverSrc = brewery.cover_image_url || placeholderSrc;
  const typeLabel = brewery.brewery_type ? BREWERY_TYPE_LABELS[brewery.brewery_type] ?? brewery.brewery_type : null;

  if (variant === "compact") {
    return (
      <Link href={`/brewery/${brewery.id}`} aria-label={brewery.name}>
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-2xl",
            "bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-gold)]/30",
            "transition-colors duration-150 group",
            className
          )}
        >
          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden relative">
            <Image src={coverSrc} alt={brewery.name} fill className="object-cover" sizes="48px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-[var(--text-primary)] truncate text-sm group-hover:text-[var(--accent-gold)] transition-colors">
              {brewery.name}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
              {distance && ` · ${distance}`}
            </p>
          </div>
          {typeLabel && (
            <span className="text-xs text-[var(--text-secondary)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full flex-shrink-0">
              {typeLabel}
            </span>
          )}
        </motion.div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/brewery/${brewery.id}`} aria-label={brewery.name}>
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "relative rounded-3xl overflow-hidden h-64",
            "border border-[var(--border)] group cursor-pointer",
            className
          )}
        >
          {/* Background */}
          <div className="absolute inset-0">
            <Image
              src={coverSrc}
              alt={brewery.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/40 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            {typeLabel && (
              <span className="text-xs text-[var(--accent-gold)] font-mono uppercase tracking-wider mb-1 block">
                {typeLabel}
              </span>
            )}
            <h3
              className="font-display text-2xl font-bold text-[var(--text-primary)] mb-1"
              style={breweryTransitionName(brewery.id)}
            >
              {brewery.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
              </span>
              {distance && <span>{distance} away</span>}
              {brewery.visit_count !== undefined && brewery.visit_count > 0 && (
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {formatCount(brewery.visit_count)} visits
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default card (with long-press context menu — Sprint 161)
  return (
    <DefaultBreweryCard
      brewery={brewery}
      coverSrc={coverSrc}
      typeLabel={typeLabel}
      className={className}
    />
  );
}

function DefaultBreweryCard({
  brewery,
  coverSrc,
  typeLabel,
  className,
}: {
  brewery: BreweryWithStats;
  coverSrc: string;
  typeLabel: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number } | null>(null);

  const longPress = useLongPress({
    onLongPress: (coords) => {
      setMenuAnchor(coords);
      setMenuOpen(true);
    },
  });

  const breweryUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/brewery/${brewery.id}`
      : `/brewery/${brewery.id}`;

  const menuItems: ContextMenuItem[] = [
    {
      label: "View Details",
      icon: <Eye size={16} />,
      onSelect: () => router.push(`/brewery/${brewery.id}`),
    },
    {
      label: "Find on Map",
      icon: <Compass size={16} />,
      onSelect: () => router.push(`/explore?b=${brewery.id}`),
    },
    {
      label: "Share",
      icon: <Share2 size={16} />,
      onSelect: async () => {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          try {
            await navigator.share({ title: brewery.name, url: breweryUrl });
            return;
          } catch {
            // User cancelled or share failed — fall through to clipboard
          }
        }
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(breweryUrl).catch(() => {});
        }
      },
    },
    {
      label: "Copy Link",
      icon: <Copy size={16} />,
      onSelect: () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(breweryUrl).catch(() => {});
        }
      },
    },
  ];

  return (
    <>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "bg-[var(--surface)] rounded-2xl overflow-hidden h-full flex flex-col",
          "border border-[var(--border)] hover:border-[var(--accent-gold)]/30",
          "transition-colors duration-150 group",
          className
        )}
        onPointerDown={longPress.onPointerDown}
        onPointerMove={longPress.onPointerMove}
        onPointerUp={longPress.onPointerUp}
        onPointerLeave={longPress.onPointerLeave}
        onPointerCancel={longPress.onPointerCancel}
        onContextMenu={longPress.onContextMenu}
      >
        <Link
          href={`/brewery/${brewery.id}`}
          aria-label={brewery.name}
          onClickCapture={(e) => {
            if (longPress.didFire()) {
              e.preventDefault();
              e.stopPropagation();
              longPress.reset();
            }
          }}
        >
          {/* Cover */}
          <div className="h-36 w-full relative overflow-hidden flex-shrink-0">
            <Image
              src={coverSrc}
              alt={brewery.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {brewery.user_visit && (
              <div className="absolute top-3 right-3 bg-[#3D7A52]/90 text-white text-xs font-mono px-2 py-0.5 rounded-full">
                ✓ Visited
              </div>
            )}
            {brewery.has_upcoming_events && !brewery.user_visit && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#5B8DEF]/90 text-white text-xs font-mono px-2 py-0.5 rounded-full">
                <Calendar size={10} /> Event
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1 gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-display font-semibold text-[var(--text-primary)] leading-tight group-hover:text-[var(--accent-gold)] transition-colors line-clamp-2"
                style={breweryTransitionName(brewery.id)}
              >
                {brewery.name}
              </h3>
              {typeLabel && (
                <span className="text-xs text-[var(--text-secondary)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full flex-shrink-0">
                  {typeLabel}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">
                {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
              </span>
            </div>

            {/* Spacer pushes bottom content down for equal-height grid alignment */}
            <div className="mt-auto">
              {brewery.beer_count !== undefined && brewery.beer_count > 0 && (
                <p className="text-xs text-[var(--text-muted)]">
                  {brewery.beer_count} beer{brewery.beer_count !== 1 ? "s" : ""} on tap
                </p>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      <ContextMenu
        open={menuOpen}
        anchor={menuAnchor}
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}
