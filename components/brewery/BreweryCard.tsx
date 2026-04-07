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
import { Card } from "@/components/ui/Card";

/**
 * Design System v2.0 — Brewery Monogram Fallback
 * Two-letter initials on warm gradient. Never show solid color blocks or random stock photos.
 */
export function getBreweryMonogram(name: string): string {
  const words = name.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Deterministic warm gradient from brewery name */
function getBreweryGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  const gradients = [
    "linear-gradient(135deg, var(--amber, #C4883E), color-mix(in srgb, var(--amber, #C4883E) 70%, #8B6914))",
    "linear-gradient(135deg, var(--stout-espresso, #3D2B1F), var(--stout-espresso-mid, #6B5445))",
    "linear-gradient(135deg, var(--porter-plum, #5B3A6B), var(--porter-plum-soft, #9B7AAB))",
    "linear-gradient(135deg, var(--lager-sky, #2E6B8A), var(--lager-sky-soft, #6EABCA))",
    "linear-gradient(135deg, var(--ipa-green, #4A7C2E), var(--ipa-green-soft, #8BBD6F))",
    "linear-gradient(135deg, var(--sour-berry, #9B2D5E), var(--sour-berry-soft, #DB6D9E))",
  ];
  return gradients[Math.abs(hash) % gradients.length];
}

/** Brewery monogram placeholder — replaces random stock photos per Design System v2.0 */
export function BreweryMonogram({ name, className, textSize = "text-2xl" }: { name: string; className?: string; textSize?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ background: getBreweryGradient(name) }}
    >
      <span
        className={cn("font-display font-bold text-white/90", textSize)}
        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
      >
        {getBreweryMonogram(name)}
      </span>
    </div>
  );
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
  variant?: "default" | "featured" | "compact" | "list";
  className?: string;
}

export function BreweryCard({ brewery, distance, variant = "default", className }: BreweryCardProps) {
  const hasCover = !!brewery.cover_image_url;
  const coverSrc = brewery.cover_image_url ?? "";
  const typeLabel = brewery.brewery_type ? BREWERY_TYPE_LABELS[brewery.brewery_type] ?? brewery.brewery_type : null;

  if (variant === "list") {
    return (
      <ListBreweryCard
        brewery={brewery}
        coverSrc={coverSrc}
        hasCover={hasCover}
        typeLabel={typeLabel}
        distance={distance}
        className={className}
      />
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/brewery/${brewery.id}`} aria-label={brewery.name}>
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-[14px]",
            "bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--accent-gold)]/30",
            "transition-colors duration-150 group",
            className
          )}
        >
          <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden relative">
            {hasCover ? (
              <Image src={coverSrc} alt={brewery.name} fill className="object-cover" sizes="48px" />
            ) : (
              <BreweryMonogram name={brewery.name} className="w-full h-full" textSize="text-base" />
            )}
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
            {hasCover ? (
              <Image
                src={coverSrc}
                alt={brewery.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            ) : (
              <BreweryMonogram name={brewery.name} className="w-full h-full" textSize="text-4xl" />
            )}
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
              className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-1"
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
      hasCover={hasCover}
      typeLabel={typeLabel}
      className={className}
    />
  );
}

function ListBreweryCard({
  brewery,
  coverSrc,
  hasCover,
  typeLabel,
  distance,
  className,
}: {
  brewery: BreweryWithStats;
  coverSrc: string;
  hasCover: boolean;
  typeLabel: string | null;
  distance?: string;
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
      <Card
        padding="compact"
        flat
        hoverable
        className={cn("group", className)}
      >
        <div
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
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden relative">
              {hasCover ? (
                <Image src={coverSrc} alt={brewery.name} fill className="object-cover" sizes="48px" />
              ) : (
                <BreweryMonogram name={brewery.name} className="w-full h-full" textSize="text-base" />
              )}
              {brewery.user_visit && (
                <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--success)] border border-[var(--surface)]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-display font-semibold text-[var(--text-primary)] truncate text-sm group-hover:text-[var(--accent-gold)] transition-colors"
                style={breweryTransitionName(brewery.id)}
              >
                {brewery.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
                {distance && ` · ${distance}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {brewery.beer_count !== undefined && brewery.beer_count > 0 && (
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {brewery.beer_count} on tap
                </span>
              )}
              {typeLabel && (
                <span className="text-xs text-[var(--text-secondary)] bg-[var(--surface-2)] px-2 py-0.5 rounded-full">
                  {typeLabel}
                </span>
              )}
            </div>
          </Link>
        </div>
      </Card>

      <ContextMenu
        open={menuOpen}
        anchor={menuAnchor}
        items={menuItems}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
}

function DefaultBreweryCard({
  brewery,
  coverSrc,
  hasCover,
  typeLabel,
  className,
}: {
  brewery: BreweryWithStats;
  coverSrc: string;
  hasCover: boolean;
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
          "bg-[var(--card-bg)] rounded-[14px] overflow-hidden h-full flex flex-col",
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
          {/* Cover — Design System v2.0: monogram fallback, never stock photos */}
          <div className="h-[120px] w-full relative overflow-hidden flex-shrink-0">
            {hasCover ? (
              <Image
                src={coverSrc}
                alt={brewery.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <BreweryMonogram name={brewery.name} className="w-full h-full" textSize="text-3xl" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
            {brewery.user_visit && (
              <div className="absolute top-3 right-3 bg-[var(--success)]/90 text-white text-xs font-mono px-2 py-0.5 rounded-full">
                ✓ Visited
              </div>
            )}
            {brewery.has_upcoming_events && !brewery.user_visit && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-[var(--accent-blue)]/90 text-white text-xs font-mono px-2 py-0.5 rounded-full">
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
