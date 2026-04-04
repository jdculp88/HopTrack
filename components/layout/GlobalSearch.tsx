"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SearchTypeahead } from "@/components/ui/SearchTypeahead";
import { spring } from "@/lib/animation";

/**
 * Global search overlay — Sprint 138 (The Bartender)
 * Renders a search icon that opens a full-screen SearchTypeahead overlay.
 * Beer selection → /beer/[id], Brewery selection → /brewery/[id]
 */
export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelectBeer = useCallback((beer: { id: string }) => {
    setIsOpen(false);
    router.push(`/beer/${beer.id}`);
  }, [router]);

  const handleSelectBrewery = useCallback((brewery: { id: string }) => {
    setIsOpen(false);
    router.push(`/brewery/${brewery.id}`);
  }, [router]);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Search beers & breweries"
        className="p-2 rounded-xl transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--accent-gold)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
      >
        <Search size={18} />
      </button>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[70]"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsOpen(false)}
            />

            {/* Search panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={spring.default}
              className="fixed top-0 left-0 right-0 z-[71] px-4 pt-4 pb-2 lg:max-w-xl lg:mx-auto lg:pt-24"
            >
              <div className="relative">
                <SearchTypeahead
                  placeholder="Search beers & breweries..."
                  onSelectBeer={handleSelectBeer}
                  onSelectBrewery={handleSelectBrewery}
                  autoFocus
                  className="w-full"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-2.5 p-1 rounded-lg transition-opacity hover:opacity-70 z-10"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-center text-[10px] mt-2 hidden lg:block" style={{ color: "var(--text-muted)" }}>
                <kbd className="px-1 py-0.5 rounded font-mono text-[9px] border" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>⌘K</kbd> to toggle search
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
