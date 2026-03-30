"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Globe,
  Share2,
  Trash2,
  X,
  Beer,
  GripVertical,
  Copy,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/components/ui/Toast";
import { StarRating } from "@/components/ui/StarRating";
import { UserAvatar } from "@/components/ui/UserAvatar";
import Link from "next/link";

interface BeerItem {
  id: string;
  beer_id: string;
  position: number;
  note?: string | null;
  beer?: {
    id: string;
    name: string;
    style?: string | null;
    abv?: number | null;
    avg_rating?: number | null;
  } | null;
}

interface BeerListDetailClientProps {
  list: any;
  isOwner: boolean;
  currentUserId: string;
}

// ── Sortable row ─────────────────────────────────────────────────────────────

interface SortableItemProps {
  item: BeerItem;
  isOwner: boolean;
  isConfirming: boolean;
  activeId: string | null;
  onConfirmToggle: (id: string) => void;
  onRemove: (itemId: string) => void;
}

function SortableItem({
  item,
  isOwner,
  isConfirming,
  activeId,
  onConfirmToggle,
  onRemove,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const beer = item.beer;

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-2xl overflow-hidden"
      {...attributes}
    >
      <div
        style={{
          background: "var(--surface)",
          border: `1px solid ${activeId && !isDragging ? "var(--border)" : "var(--border)"}`,
        }}
        className="rounded-2xl overflow-hidden"
      >
        <div className="flex items-start gap-3 px-4 py-3">
          {/* Drag handle — owner only */}
          {isOwner && (
            <button
              {...listeners}
              className="flex-shrink-0 cursor-grab active:cursor-grabbing pt-0.5 touch-none"
              style={{ color: "var(--text-muted)" }}
              aria-label="Drag to reorder"
              tabIndex={-1}
            >
              <GripVertical size={16} />
            </button>
          )}

          {/* Position number */}
          <span
            className="text-lg font-bold font-mono flex-shrink-0 w-7 text-center pt-0.5"
            style={{ color: "var(--accent-gold)" }}
          >
            {item.position + 1}
          </span>

          {/* Beer info */}
          <div className="flex-1 min-w-0">
            <Link
              href={`/beer/${beer?.id ?? ""}`}
              className="font-semibold text-sm hover:underline underline-offset-2"
              style={{ color: "var(--text-primary)" }}
            >
              {beer?.name ?? "Unknown"}
            </Link>

            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {beer?.style && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {beer.style}
                </span>
              )}
              {beer?.abv != null && (
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  · {beer.abv}%
                </span>
              )}
            </div>

            {beer?.avg_rating != null && (
              <div className="mt-1.5">
                <StarRating value={Math.round(beer.avg_rating)} readonly size="sm" />
              </div>
            )}

            {item.note && (
              <p className="text-xs mt-1.5 italic" style={{ color: "var(--text-secondary)" }}>
                &ldquo;{item.note}&rdquo;
              </p>
            )}
          </div>

          {/* Remove button — owner only */}
          {isOwner && (
            <button
              onClick={() => onConfirmToggle(item.id)}
              className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
              style={{
                color: isConfirming ? "var(--danger)" : "var(--text-muted)",
              }}
              title="Remove beer"
            >
              {isConfirming ? <X size={14} /> : <Trash2 size={14} />}
            </button>
          )}
        </div>

        {/* Inline remove confirmation */}
        <AnimatePresence>
          {isConfirming && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                className="px-4 py-2.5 border-t flex items-center justify-between"
                style={{
                  borderColor: "var(--border)",
                  background: "color-mix(in srgb, var(--danger) 8%, transparent)",
                }}
              >
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Remove &ldquo;{beer?.name}&rdquo; from this list?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onConfirmToggle(item.id)}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "var(--danger)", color: "#fff" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Ghost card rendered in DragOverlay ───────────────────────────────────────

function DragGhost({ item }: { item: BeerItem }) {
  const beer = item.beer;
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-start gap-3"
      style={{
        background: "var(--surface)",
        border: "1.5px solid var(--accent-gold)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        transform: "scale(1.02)",
        color: "var(--text-primary)",
      }}
    >
      <GripVertical size={16} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
      <span
        className="text-lg font-bold font-mono flex-shrink-0 w-7 text-center"
        style={{ color: "var(--accent-gold)" }}
      >
        {item.position + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
          {beer?.name ?? "Unknown"}
        </p>
        {beer?.style && (
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {beer.style}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BeerListDetailClient({
  list,
  isOwner,
}: BeerListDetailClientProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [items, setItems] = useState<BeerItem[]>(
    [...(list.items ?? [])].sort((a: BeerItem, b: BeerItem) => a.position - b.position)
  );
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Duplicate list state
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Debounce reorder saves with a ref
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Share ────────────────────────────────────────────────────────────────

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/lists/${list.profile?.username}/${list.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => success("Link copied!"))
      .catch(() => showError("Couldn't copy link"));
  }, [list, success, showError]);

  // ── Remove beer ──────────────────────────────────────────────────────────

  const handleRemoveBeer = useCallback(
    async (itemId: string) => {
      // Optimistic
      const prev = items;
      setItems((cur) => {
        const filtered = cur.filter((i) => i.id !== itemId);
        return filtered.map((item, idx) => ({ ...item, position: idx }));
      });
      setConfirmRemoveId(null);

      try {
        const res = await fetch(
          `/api/beer-lists/${list.id}/items?itemId=${itemId}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error();
        success("Removed from list");
      } catch {
        setItems(prev);
        showError("Failed to remove beer");
      }
    },
    [items, list.id, success, showError]
  );

  // ── Drag reorder ─────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    setConfirmRemoveId(null); // Close any open confirm panel
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      position: idx,
    }));

    // Optimistic update
    setItems(reordered);

    // Debounce persist — fire after 500ms of no further drags
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    reorderTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/beer-lists/${list.id}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order: reordered.map(({ id, position }) => ({ id, position })),
          }),
        });
        if (!res.ok) throw new Error();
      } catch {
        showError("Failed to save order");
      }
    }, 500);
  }

  const activeItem = activeId ? items.find((i) => i.id === activeId) ?? null : null;

  // ── Duplicate list ───────────────────────────────────────────────────────

  const handleDuplicate = useCallback(async () => {
    setIsDuplicating(true);
    try {
      // 1. Create new list
      const createRes = await fetch("/api/beer-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${list.title} (copy)`,
          description: list.description ?? undefined,
          is_public: list.is_public,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to create list");
      const newList = await createRes.json();

      // 2. Add all items in order
      await Promise.all(
        items.map((item) =>
          fetch(`/api/beer-lists/${newList.id}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ beer_id: item.beer_id, note: item.note ?? undefined }),
          })
        )
      );

      success("List duplicated!");
      router.push(`/beer-lists/${newList.id}`);
    } catch {
      showError("Failed to duplicate list");
      setIsDuplicating(false);
      setShowDuplicateConfirm(false);
    }
  }, [list, items, success, showError, router]);

  const profile = list.profile;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Back link */}
      <Link
        href="/beer-lists"
        className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={14} />
        My Lists
      </Link>

      {/* Header card */}
      <div
        className="rounded-2xl p-5 mb-5"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-start gap-3">
          {profile && (
            <Link href={`/profile/${profile.username}`}>
              <UserAvatar
                profile={{
                  display_name: profile.display_name ?? null,
                  avatar_url: profile.avatar_url ?? null,
                  username: profile.username,
                }}
                size="sm"
              />
            </Link>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h1
                className="font-display font-bold text-2xl leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {list.title}
              </h1>
              <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                {/* Public/private badge */}
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                >
                  {list.is_public ? <Globe size={10} /> : <Lock size={10} />}
                  {list.is_public ? "Public" : "Private"}
                </span>

                {/* Share button */}
                {list.is_public && (
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      background:
                        "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
                      color: "var(--accent-gold)",
                      border:
                        "1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
                    }}
                  >
                    <Share2 size={11} />
                    Share
                  </button>
                )}

                {/* Duplicate button — owner only */}
                {isOwner && (
                  <button
                    onClick={() => setShowDuplicateConfirm((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-all"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border)",
                    }}
                    title="Duplicate list"
                  >
                    <Copy size={11} />
                    Duplicate
                  </button>
                )}
              </div>
            </div>

            {profile?.username && (
              <Link
                href={`/profile/${profile.username}`}
                className="text-xs hover:underline mt-0.5 inline-block"
                style={{ color: "var(--accent-gold)" }}
              >
                @{profile.username}
              </Link>
            )}

            {list.description && (
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                {list.description}
              </p>
            )}

            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {items.length} {items.length === 1 ? "beer" : "beers"}
            </p>
          </div>
        </div>

        {/* Duplicate confirmation panel */}
        <AnimatePresence>
          {showDuplicateConfirm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <div
                className="mt-4 pt-4 border-t flex items-center justify-between gap-3"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Duplicate &ldquo;{list.title}&rdquo;?
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowDuplicateConfirm(false)}
                    disabled={isDuplicating}
                    className="px-3 py-1.5 rounded-xl text-xs transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                    className="px-4 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background:
                        "color-mix(in srgb, var(--accent-gold) 90%, transparent)",
                      color: "var(--bg)",
                      opacity: isDuplicating ? 0.6 : 1,
                    }}
                  >
                    <motion.span
                      animate={{ opacity: isDuplicating ? 0.6 : 1 }}
                    >
                      {isDuplicating ? "Duplicating…" : "Duplicate"}
                    </motion.span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drag hint — owner with items */}
      {isOwner && items.length > 1 && (
        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          <GripVertical size={12} />
          Drag to reorder
        </p>
      )}

      {/* Beer items */}
      {items.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Beer size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p className="font-medium" style={{ color: "var(--text-secondary)" }}>
            No beers on this list yet
          </p>
          {isOwner && (
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Add beers from any brewery or beer page.
            </p>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  isOwner={isOwner}
                  isConfirming={confirmRemoveId === item.id}
                  activeId={activeId}
                  onConfirmToggle={(id) =>
                    setConfirmRemoveId((prev) => (prev === id ? null : id))
                  }
                  onRemove={handleRemoveBeer}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag overlay — gold border ghost */}
          <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
            {activeItem ? <DragGhost item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
