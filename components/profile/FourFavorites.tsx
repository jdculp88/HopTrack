"use client";

// Four Favorites — Sprint 162 (The Identity)
// Displays a user's 4 pinned beers on their profile hero. Own-profile shows
// an edit toggle that opens an inline picker. Other profiles hide when empty.

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, X, Plus, Search, Check, Share2 } from "lucide-react";
import { cn, generateGradientFromString } from "@/lib/utils";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { Modal } from "@/components/ui/Modal";
import { Card, CardTitle } from "@/components/ui/Card";
import { getStyleVars } from "@/lib/beerStyleColors";
import {
  generateOGImageUrl,
  getFavoritesShareText,
  shareOrCopy,
} from "@/lib/share";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FourFavoritesBeer {
  id: string;
  name: string;
  style: string | null;
  item_type: string | null;
  abv: number | null;
  avg_rating: number | null;
  cover_image_url?: string | null;
  brewery?: { id: string; name: string } | null;
}

export interface PinnedBeerItem {
  beer_id: string;
  position: number;
  beer: FourFavoritesBeer | null;
}

interface FourFavoritesProps {
  userId: string;
  isOwnProfile: boolean;
  initialPins: PinnedBeerItem[];
}

// ─── Main Component ────────────────────────────────────────────────────────

export function FourFavorites({
  userId,
  isOwnProfile,
  initialPins,
}: FourFavoritesProps) {
  const [pins, setPins] = useState<PinnedBeerItem[]>(initialPins);
  const [isEditing, setIsEditing] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<
    "idle" | "copied" | "shared" | "failed"
  >("idle");

  // Build 4-slot grid: fill pins by position, null for empty slots.
  const slots: (PinnedBeerItem | null)[] = Array.from({ length: 4 }, (_, i) => {
    return pins.find((p) => p.position === i) ?? null;
  });

  const pinCount = pins.length;

  // Hide entirely for other profiles with no pins.
  if (!isOwnProfile && pinCount === 0) return null;

  const save = useCallback(
    async (nextPins: PinnedBeerItem[]) => {
      setSaving(true);
      setError(null);
      try {
        const beerIds = nextPins
          .sort((a, b) => a.position - b.position)
          .map((p) => p.beer_id);
        const res = await fetch("/api/profile/pinned-beers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beer_ids: beerIds }),
        });
        const payload = await res.json();
        if (!res.ok || payload.error) {
          setError(payload.error?.message ?? "Failed to save pins");
          return false;
        }
        // Use server response as authoritative
        const fresh: PinnedBeerItem[] = (payload.data ?? []).map(
          (row: { beer_id: string; position: number; beer: FourFavoritesBeer | null }) => ({
            beer_id: row.beer_id,
            position: row.position,
            beer: row.beer,
          }),
        );
        setPins(fresh);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const handleRemove = async (position: number) => {
    const next = pins
      .filter((p) => p.position !== position)
      // Compact positions after removal (0, 1, 2, 3 contiguous)
      .sort((a, b) => a.position - b.position)
      .map((p, i) => ({ ...p, position: i }));
    await save(next);
  };

  const handleAdd = async (beer: FourFavoritesBeer) => {
    if (pickerSlot === null) return;
    // Prevent duplicate
    if (pins.some((p) => p.beer_id === beer.id)) {
      setError("That beer is already pinned");
      setPickerSlot(null);
      return;
    }
    // Append at pickerSlot position (fills next open slot)
    const nextPosition = pickerSlot;
    const nextPins = [
      ...pins.filter((p) => p.position !== nextPosition),
      { beer_id: beer.id, position: nextPosition, beer },
    ];
    setPickerSlot(null);
    await save(nextPins);
  };

  const handleShareFavorites = async () => {
    const topBeerName = pins.find((p) => p.position === 0)?.beer?.name ?? null;
    const beerNames = pins
      .sort((a, b) => a.position - b.position)
      .map((p) => p.beer?.name ?? "")
      .filter(Boolean);
    const breweryNames = pins
      .sort((a, b) => a.position - b.position)
      .map((p) => p.beer?.brewery?.name ?? "")
      .filter(Boolean);

    const url = generateOGImageUrl("favorites", { user_id: userId });
    // Append repeated beer/brewery params for the OG route
    const urlObj = new URL(url);
    beerNames.forEach((n) => urlObj.searchParams.append("beer", n));
    breweryNames.forEach((n) => urlObj.searchParams.append("brewery", n));

    const text = getFavoritesShareText({ topBeerName });
    const result = await shareOrCopy({
      title: "My Four Favorites",
      text,
      url: urlObj.toString(),
    });
    if (result === "shared") setShareState("shared");
    else if (result === "copied") setShareState("copied");
    else if (result === "cancelled") return;
    else setShareState("failed");
    setTimeout(() => setShareState("idle"), 2000);
  };

  return (
    <Card padding="spacious" className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <CardTitle as="h3">Four Favorites</CardTitle>
        <div className="flex items-center gap-2">
          {pinCount > 0 && (
            <button
              type="button"
              onClick={handleShareFavorites}
              className={cn(
                "text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-colors",
                shareState === "shared" || shareState === "copied"
                  ? "text-[var(--accent-gold)]"
                  : "text-[var(--text-muted)] hover:text-[var(--accent-gold)]",
              )}
              aria-label="Share Four Favorites"
            >
              {shareState === "shared" || shareState === "copied" ? (
                <Check size={14} />
              ) : (
                <Share2 size={14} />
              )}
              {shareState === "copied" ? "Copied" : shareState === "shared" ? "Shared" : "Share"}
            </button>
          )}
          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1.5"
              aria-label={isEditing ? "Done editing favorites" : "Edit favorites"}
            >
              {isEditing ? <Check size={14} /> : <Pencil size={14} />}
              {isEditing ? "Done" : "Edit"}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-[var(--danger)] mb-3"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {slots.map((slot, i) => (
          <SlotCard
            key={i}
            slot={slot}
            position={i}
            isEditing={isEditing}
            isOwnProfile={isOwnProfile}
            saving={saving}
            onRemove={() => handleRemove(i)}
            onAdd={() => setPickerSlot(i)}
          />
        ))}
      </div>

      <BeerPickerModal
        open={pickerSlot !== null}
        onClose={() => setPickerSlot(null)}
        onSelect={handleAdd}
        excludeBeerIds={pins.map((p) => p.beer_id)}
      />
    </Card>
  );
}

// ─── Slot Card ────────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: PinnedBeerItem | null;
  position: number;
  isEditing: boolean;
  isOwnProfile: boolean;
  saving: boolean;
  onRemove: () => void;
  onAdd: () => void;
}

function SlotCard({ slot, isEditing, isOwnProfile, saving, onRemove, onAdd }: SlotCardProps) {
  if (!slot || !slot.beer) {
    // Empty slot
    if (isOwnProfile) {
      return (
        <button
          type="button"
          onClick={onAdd}
          disabled={saving}
          className={cn(
            "aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--border)]",
            "flex flex-col items-center justify-center gap-2",
            "text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/50",
            "transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          aria-label="Add favorite beer"
        >
          <Plus size={20} />
          <span className="text-xs font-mono uppercase tracking-wider">Add</span>
        </button>
      );
    }
    // Hide empty slots on other profiles (but keep grid shape)
    return <div aria-hidden="true" />;
  }

  const { beer } = slot;
  const gradient = generateGradientFromString(beer.name + (beer.brewery?.id ?? ""));
  const styleVars = getStyleVars(beer.style, beer.item_type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="relative group"
    >
      <Link
        href={`/beer/${beer.id}`}
        className={cn(
          "block aspect-[3/4] rounded-xl overflow-hidden",
          "border border-[var(--border)] hover:border-[var(--accent-gold)]/40",
          "transition-all",
        )}
      >
        <div
          className="relative w-full aspect-square"
          style={
            beer.cover_image_url
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${styleVars.primary} 0%, ${styleVars.soft} 100%), ${gradient}`,
                }
          }
        >
          {beer.cover_image_url && (
            <Image
              src={beer.cover_image_url}
              alt={beer.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
        </div>
        <div className="p-2.5">
          <p className="font-display font-medium text-[var(--text-primary)] text-sm line-clamp-1">
            {beer.name}
          </p>
          <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
            {beer.brewery?.name ?? "—"}
          </p>
          <div className="mt-2">
            <BeerStyleBadge style={beer.style} itemType={beer.item_type} size="xs" />
          </div>
        </div>
      </Link>
      {isEditing && (
        <button
          type="button"
          onClick={onRemove}
          disabled={saving}
          className={cn(
            "absolute top-1.5 right-1.5 w-7 h-7 rounded-full",
            "bg-[var(--danger)] text-white flex items-center justify-center",
            "shadow-lg hover:scale-110 transition-transform disabled:opacity-50",
          )}
          aria-label={`Remove ${beer.name} from favorites`}
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
}

// ─── Beer Picker Modal ────────────────────────────────────────────────────

interface BeerPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (beer: FourFavoritesBeer) => void;
  excludeBeerIds: string[];
}

function BeerPickerModal({ open, onClose, onSelect, excludeBeerIds }: BeerPickerModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FourFavoritesBeer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSearchError(null);
      return;
    }
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setSearchError(null);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=12`,
          { signal: controller.signal },
        );
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error ?? "Search failed");
        const beers: FourFavoritesBeer[] = payload.beers ?? [];
        setResults(beers.filter((b) => !excludeBeerIds.includes(b.id)));
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setSearchError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query, open, excludeBeerIds]);

  return (
    <Modal open={open} onClose={onClose} title="Pin a Favorite" size="md">
      <div className="mb-4 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search beers by name..."
          className={cn(
            "w-full pl-10 pr-3 py-2.5 rounded-xl bg-[var(--surface-2)]",
            "border border-[var(--border)] text-[var(--text-primary)]",
            "focus:outline-none focus:border-[var(--accent-gold)]/50",
          )}
          autoFocus
        />
      </div>

      {searchError && (
        <p className="text-sm text-[var(--danger)] mb-3">{searchError}</p>
      )}

      {loading && (
        <p className="text-sm text-[var(--text-muted)] text-center py-4">Searching…</p>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && !searchError && (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          No beers found for "{query}"
        </p>
      )}

      {query.trim().length < 2 && (
        <p className="text-sm text-[var(--text-muted)] text-center py-8">
          Type at least 2 characters to search
        </p>
      )}

      <div className="max-h-80 overflow-y-auto -mx-2">
        {results.map((beer) => (
          <button
            key={beer.id}
            type="button"
            onClick={() => onSelect(beer)}
            className={cn(
              "w-full flex items-center gap-3 p-2.5 rounded-xl",
              "text-left hover:bg-[var(--surface-2)] transition-colors",
            )}
          >
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${getStyleVars(beer.style, beer.item_type).primary} 0%, ${getStyleVars(beer.style, beer.item_type).soft} 100%)`,
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-display font-medium text-[var(--text-primary)] text-sm line-clamp-1">
                {beer.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                {beer.brewery?.name ?? "—"} {beer.style && `· ${beer.style}`}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
