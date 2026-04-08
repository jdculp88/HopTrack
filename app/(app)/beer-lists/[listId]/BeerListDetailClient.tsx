"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
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
  Plus,
  Pencil,
  Search,
  Loader2,
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
import { PillTabs } from "@/components/ui/PillTabs";
import Link from "next/link";
import { generateGradientFromString } from "@/lib/utils";

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
    cover_image_url?: string | null;
    item_type?: string | null;
    brewery?: { id: string; name: string } | null;
  } | null;
}

type ViewMode = "list" | "mosaic";

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
      className="rounded-[14px] overflow-hidden"
      {...attributes}
    >
      <div
        style={{
          background: "var(--card-bg)",
          border: `1px solid ${activeId && !isDragging ? "var(--border)" : "var(--border)"}`,
        }}
        className="rounded-[14px] overflow-hidden"
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

          {/* Beer thumbnail (Sprint 169) */}
          <div
            className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{
              background: beer?.cover_image_url
                ? `url(${beer.cover_image_url}) center/cover`
                : generateGradientFromString(beer?.name ?? "beer"),
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {!beer?.cover_image_url && (beer?.name?.[0]?.toUpperCase() ?? "?")}
          </div>

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
              {beer?.brewery?.name && (
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {beer.brewery.name}
                </span>
              )}
              {beer?.style && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {beer?.brewery?.name ? "· " : ""}{beer.style}
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
                "{item.note}"
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
                  Remove "{beer?.name}" from this list?
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
      className="rounded-[14px] px-4 py-3 flex items-start gap-3"
      style={{
        background: "var(--card-bg)",
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
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Duplicate list state
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Delete list state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit metadata state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title ?? "");
  const [editDesc, setEditDesc] = useState(list.description ?? "");
  const [editPublic, setEditPublic] = useState(list.is_public ?? false);
  const [isSaving, setIsSaving] = useState(false);

  // Local overrides for edited metadata
  const [localTitle, setLocalTitle] = useState(list.title ?? "");
  const [localDesc, setLocalDesc] = useState(list.description ?? "");
  const [localIsPublic, setLocalIsPublic] = useState(list.is_public ?? false);

  // Add beer state
  const [showAddBeer, setShowAddBeer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [addingBeerId, setAddingBeerId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

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

  // ── Close all action panels ────────────────────────────────────────────
  const closeAllPanels = useCallback(() => {
    setShowDuplicateConfirm(false);
    setShowDeleteConfirm(false);
    setIsEditing(false);
    setShowAddBeer(false);
    setSearchQuery("");
    setSearchResults(null);
  }, []);

  // ── Delete list ─────────────────────────────────────────────────────────
  const handleDeleteList = useCallback(async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/beer-lists/${list.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      success("List deleted");
      router.push("/beer-lists");
    } catch {
      showError("Failed to delete list");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [list.id, success, showError, router]);

  // ── Edit metadata ───────────────────────────────────────────────────────
  const handleSaveEdit = useCallback(async () => {
    if (!editTitle.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/beer-lists/${list.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim() || null,
          is_public: editPublic,
        }),
      });
      if (!res.ok) throw new Error();
      setLocalTitle(editTitle.trim());
      setLocalDesc(editDesc.trim());
      setLocalIsPublic(editPublic);
      setIsEditing(false);
      success("List updated!");
    } catch {
      showError("Failed to update list");
    } finally {
      setIsSaving(false);
    }
  }, [list.id, editTitle, editDesc, editPublic, success, showError]);

  // ── Add beer search ─────────────────────────────────────────────────────
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults(null);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const existingBeerIds = new Set(items.map((i) => i.beer_id));
        const beers = (data.beers ?? []).filter(
          (b: any) => !existingBeerIds.has(b.id)
        );
        setSearchResults(beers);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => { cancelled = true; };
  }, [debouncedSearch, items]);

  const handleAddBeer = useCallback(
    async (beerId: string, beerData: any) => {
      setAddingBeerId(beerId);
      try {
        const res = await fetch(`/api/beer-lists/${list.id}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ beer_id: beerId }),
        });
        if (res.status === 409) {
          showError("Already in this list");
          setAddingBeerId(null);
          return;
        }
        if (!res.ok) throw new Error();
        // Append to local items
        const newItem: BeerItem = {
          id: crypto.randomUUID(),
          beer_id: beerId,
          position: items.length,
          beer: beerData,
        };
        setItems((cur) => [...cur, newItem]);
        // Remove from search results
        setSearchResults((cur) => cur?.filter((b: any) => b.id !== beerId) ?? null);
        success("Added to list!");
      } catch {
        showError("Failed to add beer");
      } finally {
        setAddingBeerId(null);
      }
    },
    [list.id, items.length, success, showError]
  );

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
        className="rounded-[14px] p-5 mb-5"
        style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
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
            <h1
              className="font-display font-bold text-2xl leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {localTitle}
            </h1>

            {profile?.username && (
              <div className="flex items-center gap-2 mt-0.5">
                <Link
                  href={`/profile/${profile.username}`}
                  className="text-xs hover:underline"
                  style={{ color: "var(--accent-gold)" }}
                >
                  @{profile.username}
                </Link>
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md"
                  style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                >
                  {localIsPublic ? <Globe size={9} /> : <Lock size={9} />}
                  {localIsPublic ? "Public" : "Private"}
                </span>
              </div>
            )}

            {localDesc && (
              <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                {localDesc}
              </p>
            )}

            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              {items.length} {items.length === 1 ? "beer" : "beers"}
            </p>
          </div>
        </div>

        {/* Action buttons — below header */}
        {/* Action buttons — below header */}
        <div className="flex items-center gap-1.5 flex-wrap mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          {localIsPublic && (
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-all"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
                color: "var(--accent-gold)",
                border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
              }}
            >
              <Share2 size={11} />
              Share
            </button>
          )}

          {isOwner && (
            <>
              <button
                onClick={() => { closeAllPanels(); setShowAddBeer(true); }}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
                  color: "var(--accent-gold)",
                  border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
                }}
                title="Add a beer"
              >
                <Plus size={11} />
                Add Beer
              </button>
              <button
                onClick={() => { closeAllPanels(); setIsEditing(true); setEditTitle(localTitle); setEditDesc(localDesc); setEditPublic(localIsPublic); }}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                title="Edit list"
              >
                <Pencil size={11} />
                Edit
              </button>
              <button
                onClick={() => { closeAllPanels(); setShowDeleteConfirm(true); }}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl transition-all"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
                title="Delete list"
              >
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>

        {/* Action panels — only one open at a time */}
        <AnimatePresence>
          {/* Duplicate confirmation */}
          {showDuplicateConfirm && (
            <motion.div
              key="duplicate"
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
                  Duplicate &ldquo;{localTitle}&rdquo;?
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
                      background: "color-mix(in srgb, var(--accent-gold) 90%, transparent)",
                      color: "var(--bg)",
                      opacity: isDuplicating ? 0.6 : 1,
                    }}
                  >
                    {isDuplicating ? "Duplicating\u2026" : "Duplicate"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <motion.div
              key="delete"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <div
                className="mt-4 pt-4 border-t flex items-center justify-between gap-3"
                style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--danger) 6%, transparent)", borderRadius: "0 0 14px 14px", padding: "12px 16px" }}
              >
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Delete &ldquo;{localTitle}&rdquo;? This can&apos;t be undone.
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-lg text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteList}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium"
                    style={{ background: "var(--danger)", color: "#fff", opacity: isDeleting ? 0.6 : 1 }}
                  >
                    {isDeleting ? "Deleting\u2026" : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Edit metadata form */}
          {isEditing && (
            <motion.div
              key="edit"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="List title"
                  className="w-full rounded-xl px-3 py-2 text-sm border outline-none"
                  style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full rounded-xl px-3 py-2 text-sm border outline-none"
                  style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditPublic((v: boolean) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors"
                    style={{
                      borderColor: editPublic ? "var(--accent-gold)" : "var(--border)",
                      color: editPublic ? "var(--accent-gold)" : "var(--text-muted)",
                      background: editPublic ? "color-mix(in srgb, var(--accent-gold) 8%, transparent)" : "transparent",
                    }}
                  >
                    {editPublic ? <Globe size={12} /> : <Lock size={12} />}
                    {editPublic ? "Public" : "Private"}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving || !editTitle.trim()}
                      className="px-4 py-1.5 rounded-xl text-xs font-medium"
                      style={{
                        background: "var(--accent-gold)",
                        color: "var(--bg)",
                        opacity: isSaving || !editTitle.trim() ? 0.5 : 1,
                      }}
                    >
                      {isSaving ? "Saving\u2026" : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Add beer search panel */}
          {showAddBeer && (
            <motion.div
              key="add-beer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search beers to add\u2026"
                    className="w-full rounded-xl pl-9 pr-3 py-2 text-sm border outline-none"
                    style={{ background: "var(--card-bg)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                    autoFocus
                  />
                  {isSearching && (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
                {searchResults !== null && (
                  <div className="max-h-[240px] overflow-y-auto space-y-1">
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                        {searchQuery.length < 2 ? "Type to search\u2026" : "No beers found"}
                      </p>
                    ) : (
                      searchResults.map((beer: any) => (
                        <div
                          key={beer.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
                          style={{ background: "color-mix(in srgb, var(--surface-2) 50%, transparent)" }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                            style={{
                              background: generateGradientFromString(beer.name ?? "beer"),
                              color: "rgba(255,255,255,0.8)",
                            }}
                          >
                            {beer.name?.[0]?.toUpperCase() ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                              {beer.name}
                            </p>
                            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                              {beer.brewery_name ?? beer.brewery?.name ?? ""}
                              {beer.style ? ` · ${beer.style}` : ""}
                              {beer.abv != null ? ` · ${beer.abv}%` : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAddBeer(beer.id, {
                              id: beer.id,
                              name: beer.name,
                              style: beer.style ?? null,
                              abv: beer.abv ?? null,
                              avg_rating: beer.avg_rating ?? null,
                              cover_image_url: beer.cover_image_url ?? null,
                              brewery: beer.brewery ?? (beer.brewery_name ? { id: beer.brewery_id, name: beer.brewery_name } : null),
                            })}
                            disabled={addingBeerId === beer.id}
                            className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors"
                            style={{
                              background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
                              color: "var(--accent-gold)",
                              border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, transparent)",
                              opacity: addingBeerId === beer.id ? 0.5 : 1,
                            }}
                          >
                            {addingBeerId === beer.id ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => { setShowAddBeer(false); setSearchQuery(""); setSearchResults(null); }}
                    className="px-3 py-1.5 rounded-xl text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats panel + view toggle (Sprint 169) */}
      {items.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          {/* Stats summary */}
          <div className="flex items-center gap-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {(() => {
              const styles = new Set(items.map(i => (i.beer as any)?.style).filter(Boolean));
              const breweries = new Set(items.map(i => (i.beer as any)?.brewery?.name).filter(Boolean));
              const ratings = items.map(i => (i.beer as any)?.avg_rating).filter((r: any) => r != null) as number[];
              const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null;
              return (
                <>
                  <span>{items.length} beers</span>
                  {styles.size > 0 && <span>· {styles.size} styles</span>}
                  {breweries.size > 0 && <span>· {breweries.size} breweries</span>}
                  {avg && <span>· {avg} avg</span>}
                </>
              );
            })()}
          </div>

          {/* View toggle */}
          <PillTabs
            ariaLabel="View mode"
            variant="segmented"
            size="sm"
            tabs={[
              { key: "list", label: "List" },
              { key: "mosaic", label: "Mosaic" },
            ]}
            value={viewMode}
            onChange={(key) => setViewMode(key as ViewMode)}
          />
        </div>
      )}

      {/* Drag hint — owner with items (list mode only) */}
      {isOwner && items.length > 1 && viewMode === "list" && (
        <p className="text-xs mb-3 flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
          <GripVertical size={12} />
          Drag to reorder
        </p>
      )}

      {/* Beer items */}
      {items.length === 0 ? (
        <div
          className="rounded-[14px] p-10 text-center"
          style={{ background: "var(--card-bg)", border: "1px solid var(--border)" }}
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
      ) : viewMode === "mosaic" ? (
        /* Mosaic grid view (Sprint 169) */
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {items.map((item, i) => {
            const beer = item.beer as any;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 350, damping: 28 }}
              >
                <Link href={`/beer/${beer?.id ?? ""}`} className="block group">
                  <div
                    className="aspect-square rounded-[14px] overflow-hidden relative"
                    style={{
                      background: beer?.cover_image_url
                        ? `url(${beer.cover_image_url}) center/cover`
                        : generateGradientFromString(beer?.name ?? "beer"),
                    }}
                  >
                    {/* Position badge */}
                    <div
                      className="absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold"
                      style={{ background: "rgba(0,0,0,0.6)", color: "var(--accent-gold)" }}
                    >
                      {item.position + 1}
                    </div>

                    {/* Initial overlay when no image */}
                    {!beer?.cover_image_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {beer?.name?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}

                    {/* Bottom info overlay */}
                    <div
                      className="absolute inset-x-0 bottom-0 p-2.5 pt-8"
                      style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.75))" }}
                    >
                      <p className="text-xs font-semibold text-white truncate group-hover:text-[var(--accent-gold)] transition-colors">
                        {beer?.name ?? "Unknown"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {beer?.style && (
                          <span className="text-[10px] text-white/60 truncate">{beer.style}</span>
                        )}
                        {beer?.avg_rating != null && (
                          <span className="text-[10px] text-[var(--accent-gold)] font-mono">
                            ★ {beer.avg_rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
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
