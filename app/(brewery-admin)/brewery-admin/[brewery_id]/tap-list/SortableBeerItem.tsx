"use client";

import { motion, AnimatePresence } from "motion/react";
import { Edit2, Trash2, ToggleLeft, ToggleRight, AlertTriangle, Award, GripVertical, Ban, CheckSquare, Square, Loader2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import type { BeerStyle } from "@/types/database";
import { ITEM_TYPE_LABELS, ITEM_TYPE_EMOJI } from "@/types/database";
import type { Beer } from "./tap-list-types";

export interface SortableBeerItemProps {
  beer: Beer;
  confirmDeleteId: string | null;
  deletingId: string | null;
  batchMode: boolean;
  isSelected: boolean;
  activeId: string | null;
  onToggleSelect: () => void;
  onToggleTap: (beer: Beer) => void;
  onToggle86d: (beer: Beer) => void;
  onToggleFeatured: (beer: Beer) => void;
  onEdit: (beer: Beer) => void;
  onConfirmDelete: (id: string) => void;
  onDelete: (beer: Beer) => void;
  onCancelDelete: () => void;
}

export function SortableBeerItem({ beer, confirmDeleteId, deletingId, batchMode, isSelected, activeId, onToggleSelect, onToggleTap, onToggle86d, onToggleFeatured, onEdit, onConfirmDelete, onDelete, onCancelDelete }: SortableBeerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: beer.id });

  const isDragActive = activeId !== null;
  const showDropIndicator = isOver && activeId !== beer.id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : beer.is_on_tap ? 1 : 0.6,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {/* Drop target indicator */}
      <AnimatePresence>
        {showDropIndicator && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="h-0.5 rounded-full mb-2"
            style={{ background: "var(--accent-gold)", boxShadow: "0 0 8px var(--accent-gold)" }}
          />
        )}
      </AnimatePresence>

    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border transition-all overflow-hidden"
      style={{
        borderColor: confirmDeleteId === beer.id ? "var(--danger)" : isDragActive && isOver ? "var(--accent-gold)" : "var(--border)",
        borderWidth: isDragActive && isOver ? 2 : 1,
      }}
    >
      <div
        className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4"
        style={{ background: isSelected ? "color-mix(in srgb, var(--accent-gold) 6%, var(--surface))" : "var(--surface)" }}
      >
        {/* Batch checkbox */}
        {batchMode && (
          <button
            onClick={onToggleSelect}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: isSelected ? "var(--accent-gold)" : "var(--text-muted)" }}
          >
            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
          </button>
        )}

        {/* Drag handle */}
        {!batchMode && (
          <button {...listeners} className="flex-shrink-0 cursor-grab active:cursor-grabbing p-1.5 touch-none min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: "var(--text-muted)" }}>
            <GripVertical size={16} />
          </button>
        )}

        {/* Tap indicator */}
        <button onClick={() => onToggleTap(beer)} className="flex-shrink-0 transition-opacity hover:opacity-70 min-w-[44px] min-h-[44px] flex items-center justify-center">
          {beer.is_on_tap
            ? <ToggleRight size={24} style={{ color: "var(--accent-gold)" }} />
            : <ToggleLeft size={24} style={{ color: "var(--text-muted)" }} />}
        </button>

        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
          style={{ background: beer.is_86d ? "rgba(196,75,58,0.15)" : beer.is_on_tap ? "rgba(212,168,67,0.15)" : "var(--surface-2)" }}>
          {beer.is_86d ? "\u274C" : (ITEM_TYPE_EMOJI[beer.item_type] ?? "\u{1F37A}")}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn("font-display font-semibold", beer.is_86d && "line-through")}
              style={{ color: beer.is_86d ? "var(--text-muted)" : "var(--text-primary)" }}>
              {beer.name}
            </p>
            {beer.is_featured && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}>
                Beer of the Week
              </span>
            )}
            {beer.is_86d && (
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "rgba(196,75,58,0.15)", color: "var(--danger)" }}>
                86'd
              </span>
            )}
            {!beer.is_on_tap && !beer.is_86d && (
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                Off tap
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {beer.item_type === "beer" && beer.style ? (
              <BeerStyleBadge style={beer.style as BeerStyle} size="xs" />
            ) : beer.item_type !== "beer" ? (
              <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: "rgba(212,168,67,0.1)", color: "var(--accent-gold)" }}>
                {ITEM_TYPE_LABELS[beer.item_type] ?? beer.item_type}{beer.category ? ` \u00B7 ${beer.category}` : ""}
              </span>
            ) : null}
            {beer.abv != null && beer.abv > 0 && <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{beer.abv}% ABV</span>}
            {beer.ibu != null && beer.ibu > 0 && <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{beer.ibu} IBU</span>}
            {beer.price_per_pint != null && <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>${beer.price_per_pint}</span>}
            {beer.avg_rating && <span className="text-xs font-mono" style={{ color: "var(--accent-gold)" }}>{"\u2605"} {beer.avg_rating.toFixed(1)}</span>}
            {beer.total_checkins > 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{beer.total_checkins} pours</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {beer.is_on_tap && (
            <button onClick={() => onToggle86d(beer)}
              title={beer.is_86d ? "Back in stock" : "Mark as 86'd (out of stock)"}
              className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              style={{ color: beer.is_86d ? "var(--danger)" : "var(--text-muted)" }}>
              <Ban size={15} />
            </button>
          )}
          <button onClick={() => onToggleFeatured(beer)}
            title={beer.is_featured ? "Remove featured" : "Set as Beer of the Week"}
            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 hidden sm:flex items-center justify-center"
            style={{ color: beer.is_featured ? "var(--accent-gold)" : "var(--text-muted)" }}>
            <Award size={15} />
          </button>
          <button onClick={() => onEdit(beer)}
            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            style={{ color: "var(--text-secondary)" }}>
            <Edit2 size={15} />
          </button>
          <button
            onClick={() => onConfirmDelete(beer.id)}
            disabled={deletingId === beer.id}
            className="p-2.5 sm:p-2 rounded-lg transition-colors hover:opacity-70 disabled:opacity-40 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            style={{ color: confirmDeleteId === beer.id ? "var(--danger)" : "var(--text-secondary)" }}>
            {deletingId === beer.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        </div>
      </div>

      {/* Inline delete confirmation */}
      <AnimatePresence>
        {confirmDeleteId === beer.id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-t"
              style={{ background: "rgba(196,75,58,0.06)", borderColor: "var(--danger)" }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} style={{ color: "var(--danger)" }} />
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Remove <strong style={{ color: "var(--text-primary)" }}>{beer.name}</strong> from your beer list?
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={onCancelDelete}
                  className="px-3 py-1 rounded-lg text-xs font-medium"
                  style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}>
                  Cancel
                </button>
                <button onClick={() => onDelete(beer)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: "var(--danger)", color: "#fff" }}>
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
