"use client";

import { ArrowDownAZ, Layers, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterValue = "all" | "on_tap" | "off_tap";

interface TapListFiltersProps {
  filter: FilterValue;
  onFilterChange: (f: FilterValue) => void;
  totalCount: number;
  onTapCount: number;
  batchMode: boolean;
  onSortAlphabetical: () => void;
  onSortByStyle: () => void;
  onToggleBatchMode: () => void;
}

export function TapListFilters({
  filter,
  onFilterChange,
  totalCount,
  onTapCount,
  batchMode,
  onSortAlphabetical,
  onSortByStyle,
  onToggleBatchMode,
}: TapListFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex gap-2 overflow-x-auto">
        {(["all", "on_tap", "off_tap"] as const).map(f => (
          <button key={f} onClick={() => onFilterChange(f)}
            className={cn("px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-h-[44px] sm:min-h-0", filter === f ? "font-semibold" : "opacity-60 hover:opacity-80")}
            style={filter === f
              ? { background: "var(--accent-gold)", color: "var(--bg)" }
              : { background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
            }>
            {f === "all" ? `All (${totalCount})` : f === "on_tap" ? `On Tap (${onTapCount})` : `Off Tap (${totalCount - onTapCount})`}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onSortAlphabetical}
          className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0 whitespace-nowrap"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          title="Sort A-Z"
        >
          <ArrowDownAZ size={14} /> A-Z
        </button>
        <button
          onClick={onSortByStyle}
          className="flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0 whitespace-nowrap"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }}
          title="Group by style"
        >
          <Layers size={14} /> Style
        </button>
        <button
          onClick={onToggleBatchMode}
          className={cn("flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium transition-all border min-h-[44px] sm:min-h-0 whitespace-nowrap")}
          style={batchMode
            ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", borderColor: "var(--accent-gold)", color: "var(--accent-gold)" }
            : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }
          }
        >
          <CheckSquare size={14} /> Select
        </button>
      </div>
    </div>
  );
}
