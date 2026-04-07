"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Eye, Share2, Copy } from "lucide-react";
import { cn, formatABV } from "@/lib/utils";
import { beerTransitionName } from "@/lib/view-transitions";
import { getStyleVars } from "@/lib/beerStyleColors";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { StarRating } from "@/components/ui/StarRating";
import type { BeerWithBrewery } from "@/types/database";
import { IncompleteBeerBadge } from "@/components/beer/IncompleteBeerBadge";
import { useLongPress } from "@/hooks/useLongPress";
import { ContextMenu, type ContextMenuItem } from "@/components/ui/ContextMenu";
import { Card } from "@/components/ui/Card";

interface BeerCardProps {
  beer: BeerWithBrewery;
  variant?: "default" | "compact" | "grid" | "list";
  className?: string;
}

export function BeerCard({ beer, variant = "default", className }: BeerCardProps) {
  const styleVars = getStyleVars(beer.style, beer.item_type);

  if (variant === "compact") {
    return (
      <Link href={`/beer/${beer.id}`}>
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "flex items-center gap-3 py-3 px-1",
            "border-b border-[var(--border)] last:border-0",
            "group cursor-pointer",
            className
          )}
        >
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden relative flex items-center justify-center"
            style={!beer.cover_image_url ? { background: `${styleVars.light}`, border: `1px solid color-mix(in srgb, ${styleVars.primary} 15%, transparent)` } : undefined}
          >
            {beer.cover_image_url ? (
              <Image src={beer.cover_image_url} alt={beer.name} fill className="object-cover" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={`${styleVars.primary}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-medium text-[var(--text-primary)] truncate text-sm group-hover:text-[var(--accent-gold)] transition-colors">
              {beer.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <BeerStyleBadge style={beer.style} itemType={beer.item_type} size="xs" />
              <span className="text-xs font-mono text-[var(--text-muted)]">{formatABV(beer.abv)}</span>
            </div>
          </div>
          {beer.avg_rating && (
            <div className="flex-shrink-0 flex items-center gap-1">
              <span className="text-sm font-mono text-[var(--accent-gold)]">★</span>
              <span className="text-sm font-mono text-[var(--accent-gold)]">{beer.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </motion.div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <ListBeerCard beer={beer} styleVars={styleVars} className={className} />
    );
  }

  // Grid card (with long-press context menu — Sprint 161)
  return (
    <GridBeerCard beer={beer} styleVars={styleVars} className={className} />
  );
}

function ListBeerCard({
  beer,
  styleVars,
  className,
}: {
  beer: BeerWithBrewery;
  styleVars: { primary: string; light: string; soft: string };
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

  const beerUrl = typeof window !== "undefined" ? `${window.location.origin}/beer/${beer.id}` : `/beer/${beer.id}`;

  const menuItems: ContextMenuItem[] = [
    {
      label: "View Details",
      icon: <Eye size={16} />,
      onSelect: () => router.push(`/beer/${beer.id}`),
    },
    {
      label: "Share",
      icon: <Share2 size={16} />,
      onSelect: async () => {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          try {
            await navigator.share({ title: beer.name, url: beerUrl });
            return;
          } catch {
            // Fall through to clipboard
          }
        }
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(beerUrl).catch(() => {});
        }
      },
    },
    {
      label: "Copy Link",
      icon: <Copy size={16} />,
      onSelect: () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(beerUrl).catch(() => {});
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
            href={`/beer/${beer.id}`}
            onClickCapture={(e) => {
              if (longPress.didFire()) {
                e.preventDefault();
                e.stopPropagation();
                longPress.reset();
              }
            }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden relative flex items-center justify-center"
              style={!beer.cover_image_url ? { background: `${styleVars.light}`, border: `1px solid color-mix(in srgb, ${styleVars.primary} 15%, transparent)` } : undefined}
            >
              {beer.cover_image_url ? (
                <Image src={beer.cover_image_url} alt={beer.name} fill className="object-cover" sizes="40px" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={`${styleVars.primary}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                  <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-display font-medium text-[var(--text-primary)] truncate text-sm group-hover:text-[var(--accent-gold)] transition-colors"
                style={beerTransitionName(beer.id)}
              >
                {beer.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {(beer as any).brewery?.name ?? "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <BeerStyleBadge style={beer.style} itemType={beer.item_type} size="xs" />
              <span className="text-xs font-mono text-[var(--text-muted)]">{formatABV(beer.abv)}</span>
            </div>
            {beer.avg_rating && (
              <div className="flex-shrink-0 flex items-center gap-1">
                <span className="text-sm font-mono text-[var(--accent-gold)]">★</span>
                <span className="text-sm font-mono text-[var(--accent-gold)]">{beer.avg_rating.toFixed(1)}</span>
              </div>
            )}
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

function GridBeerCard({
  beer,
  styleVars,
  className,
}: {
  beer: BeerWithBrewery;
  styleVars: { primary: string; light: string; soft: string };
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

  const beerUrl = typeof window !== "undefined" ? `${window.location.origin}/beer/${beer.id}` : `/beer/${beer.id}`;

  const menuItems: ContextMenuItem[] = [
    {
      label: "View Details",
      icon: <Eye size={16} />,
      onSelect: () => router.push(`/beer/${beer.id}`),
    },
    {
      label: "Share",
      icon: <Share2 size={16} />,
      onSelect: async () => {
        if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
          try {
            await navigator.share({ title: beer.name, url: beerUrl });
            return;
          } catch {
            // User cancelled or share failed — fall through to clipboard
          }
        }
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(beerUrl).catch(() => {});
        }
      },
    },
    {
      label: "Copy Link",
      icon: <Copy size={16} />,
      onSelect: () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(beerUrl).catch(() => {});
        }
      },
    },
  ];

  return (
    <>
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "bg-[var(--card-bg)] rounded-[14px] overflow-hidden",
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
          href={`/beer/${beer.id}`}
          onClickCapture={(e) => {
            if (longPress.didFire()) {
              e.preventDefault();
              e.stopPropagation();
              longPress.reset();
            }
          }}
        >
          {/* Cover — style-tinted placeholder per Design System v2.0 (no solid color blocks) */}
          <div
            className="h-[100px] w-full relative overflow-hidden flex items-center justify-center"
            style={!beer.cover_image_url ? {
              background: `linear-gradient(135deg, ${styleVars.light}, color-mix(in srgb, ${styleVars.light} 50%, var(--card-bg)))`,
            } : undefined}
          >
            {beer.cover_image_url ? (
              <>
                <Image src={beer.cover_image_url} alt={beer.name} fill className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/30 to-transparent" />
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={`${styleVars.primary}`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                  <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                  <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
                  <line x1="12" y1="19.8" x2="12" y2="22"/>
                  <line x1="9" y1="22" x2="15" y2="22"/>
                </svg>
                <BeerStyleBadge style={beer.style} itemType={beer.item_type} size="xs" />
              </div>
            )}
            {beer.seasonal && (
              <div className="absolute top-2 left-2 bg-[var(--func-warning)]/90 text-white text-[8px] font-mono font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded">
                Seasonal
              </div>
            )}
          </div>

          <div className="p-3 space-y-2">
            <h3
              className="font-display font-semibold text-[var(--text-primary)] text-sm leading-tight group-hover:text-[var(--accent-gold)] transition-colors line-clamp-2"
              style={beerTransitionName(beer.id)}
            >
              {beer.name}
            </h3>

            <div className="flex items-center gap-1.5 flex-wrap">
              <BeerStyleBadge style={beer.style} itemType={beer.item_type} size="xs" />
              <span className="text-xs font-mono text-[var(--text-muted)]">{formatABV(beer.abv)}</span>
            </div>

            {beer.avg_rating ? (
              <div className="flex items-center gap-1">
                <StarRating value={beer.avg_rating} readonly size="sm" />
                <span className="text-xs font-mono text-[var(--accent-gold)]">{beer.avg_rating.toFixed(1)}</span>
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">No ratings yet</p>
            )}

            <IncompleteBeerBadge beer={beer} compact />
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
