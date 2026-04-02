"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UtensilsCrossed, Clock, Wine, Martini, GlassWater,
  Sparkles, Baby, Coffee, ChevronUp, ChevronDown,
  Eye, EyeOff, Trash2, Pencil, X, Check, Loader2,
} from "lucide-react";
import { MultiImageUpload } from "@/components/ui/MultiImageUpload";
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

const ALL_CATEGORIES: MenuCategory[] = [
  "food", "happy_hour", "wine", "cocktail",
  "non_alcoholic", "seasonal", "kids", "brunch",
];

interface Props {
  breweryId: string;
  initialMenus: BreweryMenu[];
}

export function MenusClient({ breweryId, initialMenus }: Props) {
  const [menus, setMenus] = useState<BreweryMenu[]>(initialMenus);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editTitle, setEditTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function getMenuForCategory(cat: MenuCategory): BreweryMenu | undefined {
    return menus.find((m) => m.category === cat);
  }

  function startEdit(cat: MenuCategory) {
    const existing = getMenuForCategory(cat);
    setEditingCategory(cat);
    setEditImages(existing?.image_urls ?? []);
    setEditTitle(existing?.title ?? "");
  }

  function cancelEdit() {
    setEditingCategory(null);
    setEditImages([]);
    setEditTitle("");
  }

  async function saveMenu() {
    if (!editingCategory || editImages.length === 0) return;
    setSaving(true);

    const res = await fetch(`/api/brewery/${breweryId}/menus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: editingCategory,
        title: editTitle || null,
        image_urls: editImages,
        is_active: true,
      }),
    });

    if (res.ok) {
      const { data } = await res.json();
      setMenus((prev) => {
        const without = prev.filter((m) => m.category !== editingCategory);
        return [...without, data].sort((a, b) => a.display_order - b.display_order);
      });
      cancelEdit();
      showToast(`${MENU_CATEGORY_LABELS[editingCategory]} saved`);
    }
    setSaving(false);
  }

  async function toggleActive(menu: BreweryMenu) {
    const res = await fetch(`/api/brewery/${breweryId}/menus/${menu.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !menu.is_active }),
    });

    if (res.ok) {
      const { data } = await res.json();
      setMenus((prev) => prev.map((m) => (m.id === menu.id ? data : m)));
      showToast(`${MENU_CATEGORY_LABELS[menu.category]} ${data.is_active ? "visible" : "hidden"}`);
    }
  }

  async function deleteMenu(menu: BreweryMenu) {
    setDeleting(menu.id);
    const res = await fetch(`/api/brewery/${breweryId}/menus/${menu.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setMenus((prev) => prev.filter((m) => m.id !== menu.id));
      showToast(`${MENU_CATEGORY_LABELS[menu.category]} removed`);
    }
    setDeleting(null);
  }

  async function moveMenu(menu: BreweryMenu, direction: "up" | "down") {
    const sorted = [...menus].sort((a, b) => a.display_order - b.display_order);
    const idx = sorted.findIndex((m) => m.id === menu.id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const updated = [...sorted];
    const tempOrder = updated[idx].display_order;
    updated[idx] = { ...updated[idx], display_order: updated[swapIdx].display_order };
    updated[swapIdx] = { ...updated[swapIdx], display_order: tempOrder };

    setMenus(updated);

    await fetch(`/api/brewery/${breweryId}/menus/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order: updated.map((m) => ({ id: m.id, display_order: m.display_order })),
      }),
    });
  }

  const activeMenus = menus.filter((m) => m.image_urls.length > 0).sort((a, b) => a.display_order - b.display_order);
  const unusedCategories = ALL_CATEGORIES.filter((c) => !menus.some((m) => m.category === c));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Menus
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Upload menu images for your brewery. Up to 3 images per category.
        </p>
      </div>

      {/* Active Menus */}
      {activeMenus.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Your Menus
          </h2>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {activeMenus.map((menu, idx) => {
                const Icon = CATEGORY_ICONS[menu.category];
                const isEditing = editingCategory === menu.category;
                return (
                  <motion.div
                    key={menu.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="border rounded-2xl overflow-hidden"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
                      >
                        <Icon size={18} style={{ color: "var(--accent-gold)" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {menu.title || MENU_CATEGORY_LABELS[menu.category]}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {menu.image_urls.length} image{menu.image_urls.length !== 1 ? "s" : ""}
                          {!menu.is_active && " · Hidden"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveMenu(menu, "up")}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveMenu(menu, "down")}
                          disabled={idx === activeMenus.length - 1}
                          className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          onClick={() => toggleActive(menu)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: menu.is_active ? "var(--accent-gold)" : "var(--text-muted)" }}
                          title={menu.is_active ? "Hide from customers" : "Show to customers"}
                        >
                          {menu.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          onClick={() => isEditing ? cancelEdit() : startEdit(menu.category)}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {isEditing ? <X size={14} /> : <Pencil size={14} />}
                        </button>
                        <button
                          onClick={() => deleteMenu(menu)}
                          disabled={deleting === menu.id}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "var(--danger)" }}
                        >
                          {deleting === menu.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Inline image preview */}
                    {!isEditing && (
                      <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
                        {menu.image_urls.map((url, i) => (
                          <img
                            key={url}
                            src={url}
                            alt={`${MENU_CATEGORY_LABELS[menu.category]} ${i + 1}`}
                            className="h-20 w-20 rounded-xl object-cover flex-shrink-0 border"
                            style={{ borderColor: "var(--border)" }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Edit panel */}
                    <AnimatePresence>
                      {isEditing && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder={MENU_CATEGORY_LABELS[editingCategory!]}
                              className="w-full px-3 py-2 rounded-xl text-sm border"
                              style={{
                                background: "var(--surface-2)",
                                borderColor: "var(--border)",
                                color: "var(--text-primary)",
                              }}
                            />
                            <MultiImageUpload
                              bucket="brewery-covers"
                              folder={`${breweryId}/menus/${editingCategory}`}
                              currentUrls={editImages}
                              onUpdate={setEditImages}
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEdit}
                                className="px-3 py-1.5 text-xs font-medium rounded-xl border"
                                style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveMenu}
                                disabled={saving || editImages.length === 0}
                                className="px-3 py-1.5 text-xs font-bold rounded-xl transition-opacity disabled:opacity-50"
                                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                              >
                                {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Add New Category */}
      {unusedCategories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Add a Menu
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {unusedCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const isEditing = editingCategory === cat;
              return (
                <div key={cat}>
                  <button
                    onClick={() => isEditing ? cancelEdit() : startEdit(cat)}
                    className="w-full border-2 border-dashed rounded-2xl p-4 flex flex-col items-center gap-2 transition-all hover:border-[var(--accent-gold)]"
                    style={{
                      borderColor: isEditing ? "var(--accent-gold)" : "var(--border)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <Icon size={24} />
                    <span className="text-xs font-medium">{MENU_CATEGORY_LABELS[cat]}</span>
                  </button>

                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-2 p-3 border rounded-2xl space-y-3"
                          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                        >
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder={`Custom title (optional)`}
                            className="w-full px-3 py-2 rounded-xl text-sm border"
                            style={{
                              background: "var(--surface-2)",
                              borderColor: "var(--border)",
                              color: "var(--text-primary)",
                            }}
                          />
                          <MultiImageUpload
                            bucket="brewery-covers"
                            folder={`${breweryId}/menus/${cat}`}
                            currentUrls={editImages}
                            onUpdate={setEditImages}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={cancelEdit}
                              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-xl border"
                              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveMenu}
                              disabled={saving || editImages.length === 0}
                              className="flex-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-opacity disabled:opacity-50"
                              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                            >
                              {saving ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {activeMenus.length === 0 && editingCategory === null && (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <UtensilsCrossed size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <h3 className="font-display text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            No menus yet
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Upload images of your food, drinks, and specialty menus to show customers what you offer.
          </p>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <Check size={14} className="inline mr-1.5" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
