"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, Clock, Wine, Martini, GlassWater,
  Sparkles, Baby, Coffee, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { BreweryMenu, MenuCategory } from "@/types/database";
import { MENU_CATEGORY_LABELS } from "@/types/database";

const CATEGORY_ICONS: Record<MenuCategory, typeof UtensilsCrossed> = {
  food: UtensilsCrossed,
  happy_hour: Clock,
  wine: Wine,
  cocktail: Martini,
  non_alcoholic: GlassWater,
  seasonal: Sparkles,
  kids: Baby,
  brunch: Coffee,
};

interface Props {
  menus: BreweryMenu[];
}

export function BreweryMenusSection({ menus }: Props) {
  const activeMenus = menus
    .filter((m) => m.is_active && m.image_urls.length > 0)
    .sort((a, b) => a.display_order - b.display_order);

  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(
    activeMenus[0]?.category ?? null
  );
  const [galleryImage, setGalleryImage] = useState<{ url: string; index: number; total: number } | null>(null);

  if (activeMenus.length === 0) return null;

  const selectedMenu = activeMenus.find((m) => m.category === selectedCategory);

  function openGallery(url: string, index: number, total: number) {
    setGalleryImage({ url, index, total });
  }

  function navigateGallery(direction: "prev" | "next") {
    if (!galleryImage || !selectedMenu) return;
    const newIndex = direction === "prev"
      ? (galleryImage.index - 1 + galleryImage.total) % galleryImage.total
      : (galleryImage.index + 1) % galleryImage.total;
    setGalleryImage({
      url: selectedMenu.image_urls[newIndex],
      index: newIndex,
      total: galleryImage.total,
    });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Menus
      </h2>

      <div className="card-bg-featured border rounded-2xl overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {/* Category pills */}
        <div className="flex overflow-x-auto scrollbar-hide gap-2 px-4 pt-4 pb-2 snap-x">
          {activeMenus.map((menu) => {
            const Icon = CATEGORY_ICONS[menu.category];
            const isActive = selectedCategory === menu.category;
            return (
              <button
                key={menu.category}
                onClick={() => setSelectedCategory(menu.category)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                style={isActive
                  ? { background: "var(--accent-gold)", color: "var(--bg)" }
                  : { background: "var(--surface-2)", color: "var(--text-secondary)" }
                }
              >
                <Icon size={13} />
                {menu.title || MENU_CATEGORY_LABELS[menu.category]}
              </button>
            );
          })}
        </div>

        {/* Images */}
        <AnimatePresence mode="wait">
          {selectedMenu && (
            <motion.div
              key={selectedMenu.category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4"
            >
              <div className={`grid gap-2 ${
                selectedMenu.image_urls.length === 1
                  ? "grid-cols-1"
                  : selectedMenu.image_urls.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-3"
              }`}>
                {selectedMenu.image_urls.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => openGallery(url, i, selectedMenu.image_urls.length)}
                    className="rounded-xl overflow-hidden border transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <img
                      src={url}
                      alt={`${MENU_CATEGORY_LABELS[selectedMenu.category]} ${i + 1}`}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-screen gallery overlay */}
      <AnimatePresence>
        {galleryImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.9)" }}
            onClick={() => setGalleryImage(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setGalleryImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full z-10"
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
            >
              <X size={20} />
            </button>

            {/* Navigation arrows */}
            {galleryImage.total > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateGallery("prev"); }}
                  className="absolute left-4 p-2 rounded-full z-10"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateGallery("next"); }}
                  className="absolute right-4 p-2 rounded-full z-10"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image */}
            <motion.img
              key={galleryImage.url}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={galleryImage.url}
              alt="Menu"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            {galleryImage.total > 1 && (
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-mono"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
              >
                {galleryImage.index + 1} / {galleryImage.total}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
