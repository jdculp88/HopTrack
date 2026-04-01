"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn, formatABV, generateGradientFromString } from "@/lib/utils";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { StarRating } from "@/components/ui/StarRating";
import type { BeerWithBrewery } from "@/types/database";

interface BeerCardProps {
  beer: BeerWithBrewery;
  variant?: "default" | "compact" | "grid";
  className?: string;
}

export function BeerCard({ beer, variant = "default", className }: BeerCardProps) {
  const gradient = generateGradientFromString(beer.name + beer.brewery_id);

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
            className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
            style={!beer.cover_image_url ? { background: gradient } : undefined}
          >
            {beer.cover_image_url && (
              <Image src={beer.cover_image_url} alt={beer.name} fill className="object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-medium text-[var(--text-primary)] truncate text-sm group-hover:text-[var(--accent-gold)] transition-colors">
              {beer.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <BeerStyleBadge style={beer.style} itemType={(beer as any).item_type} size="xs" />
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

  // Grid card
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "bg-[var(--surface)] rounded-2xl overflow-hidden",
        "border border-[var(--border)] hover:border-[var(--accent-gold)]/30",
        "transition-colors duration-150 group",
        className
      )}
    >
      <Link href={`/beer/${beer.id}`}>
        {/* Cover */}
        <div
          className="h-24 w-full relative overflow-hidden"
          style={!beer.cover_image_url ? { background: gradient } : undefined}
        >
          {beer.cover_image_url && (
            <Image src={beer.cover_image_url} alt={beer.name} fill className="object-cover" />
          )}
          {beer.seasonal && (
            <div className="absolute top-2 left-2 bg-[var(--accent-amber)]/90 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full">
              Seasonal
            </div>
          )}
        </div>

        <div className="p-3 space-y-2">
          <h3 className="font-display font-semibold text-[var(--text-primary)] text-sm leading-tight group-hover:text-[var(--accent-gold)] transition-colors line-clamp-2">
            {beer.name}
          </h3>

          <div className="flex items-center gap-1.5 flex-wrap">
            <BeerStyleBadge style={beer.style} itemType={(beer as any).item_type} size="xs" />
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
        </div>
      </Link>

    </motion.div>
  );
}
