"use client";

import { Plus, Tv, Code2, Package } from "lucide-react";
import { HelpIcon } from "@/components/ui/HelpIcon";

interface TapListHeaderProps {
  breweryId: string;
  onTapCount: number;
  totalCount: number;
  onAdd: () => void;
  brandId?: string | null;
  onAddFromCatalog?: () => void;
}

export function TapListHeader({ breweryId, onTapCount, totalCount, onAdd, brandId, onAddFromCatalog }: TapListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Menu</h1>
          <HelpIcon tooltip="Add, edit, and organize your beers on tap" href={`/brewery-admin/${breweryId}/resources#content`} />
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {onTapCount} on tap &middot; {totalCount} total items
        </p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={`/brewery-admin/${breweryId}/embed`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border min-h-[44px] no-underline"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
        >
          <Code2 size={16} /> <span className="hidden sm:inline">Embed</span>
        </a>
        <button
          onClick={() => window.open(`/brewery-admin/${breweryId}/board`, "_blank")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border min-h-[44px]"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
        >
          <Tv size={16} /> <span className="hidden sm:inline">The </span>Board
        </button>
        {brandId && onAddFromCatalog && (
          <button onClick={onAddFromCatalog}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border min-h-[44px]"
            style={{ borderColor: "var(--accent-gold)", color: "var(--accent-gold)", background: "transparent" }}>
            <Package size={16} /> <span className="hidden sm:inline">From Catalog</span>
          </button>
        )}
        <button onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 min-h-[44px]"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
          <Plus size={16} /> Add Item
        </button>
      </div>
    </div>
  );
}
