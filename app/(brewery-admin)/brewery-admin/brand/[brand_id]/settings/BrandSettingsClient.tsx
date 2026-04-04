"use client";

import { useState } from "react";
import { Save, Loader2, Building2, MapPin, Trash2, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useToast } from "@/components/ui/Toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { AddLocationModal } from "@/components/brewery-admin/brand/AddLocationModal";
import { BrandTeamManager } from "@/components/brewery-admin/brand/BrandTeamManager";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormField } from "@/components/ui/FormField";
import { INPUT_STYLE, TEXTAREA_STYLE } from "@/lib/constants/ui";

interface BrandSettingsClientProps {
  brand: any;
  locations: any[];
  userRole: string;
  userId: string;
}

export function BrandSettingsClient({ brand, locations: initialLocations, userRole, userId }: BrandSettingsClientProps) {
  const [form, setForm] = useState({
    name: brand.name ?? "",
    slug: brand.slug ?? "",
    description: brand.description ?? "",
    website_url: brand.website_url ?? "",
    logo_url: brand.logo_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState(initialLocations);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [dissolving, setDissolving] = useState(false);
  const [confirmDissolve, setConfirmDissolve] = useState(false);
  const { success, error: toastError } = useToast();

  const isOwner = userRole === "owner";

  const inputStyle = INPUT_STYLE;

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/brand/${brand.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      toastError(data.error?.message ?? "Failed to save changes");
    } else {
      success("Brand profile updated!");
    }
  }

  async function handleRemoveLocation(breweryId: string) {
    setRemovingId(breweryId);
    const res = await fetch(`/api/brand/${brand.id}/locations`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brewery_id: breweryId }),
    });
    setRemovingId(null);
    setConfirmRemoveId(null);
    if (res.ok) {
      setLocations((prev) => prev.filter((l: any) => l.id !== breweryId));
      success("Location removed from brand");
    } else {
      toastError("Failed to remove location");
    }
  }

  async function handleDissolve() {
    setDissolving(true);
    const res = await fetch(`/api/brand/${brand.id}`, { method: "DELETE" });
    setDissolving(false);
    if (res.ok) {
      success("Brand dissolved");
      window.location.href = "/brewery-admin";
    } else {
      toastError("Failed to dissolve brand");
    }
  }

  function handleLocationAdded(location: any) {
    setLocations((prev) => [...prev, location]);
    setShowAddLocation(false);
    success("Location added to brand!");
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pt-16 lg:pt-8">
      <PageHeader
        title="Brand Settings"
        subtitle={`Manage ${brand.name} — ${locations.length} location${locations.length !== 1 ? "s" : ""}`}
      />

      {/* ─── Brand Profile ─── */}
      <section className="rounded-2xl border p-6 mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-display font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>Brand Profile</h2>
        <div className="space-y-4">
          <FormField label="Brand Name">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
          </FormField>
          <div>
            <FormField label="URL Slug">
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} style={inputStyle} />
            </FormField>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>hoptrack.beer/brand/{form.slug}</p>
          </div>
          <FormField label="Logo">
            <ImageUpload
              bucket="brand-logos"
              folder={userId}
              currentUrl={form.logo_url || null}
              onUpload={(url) => setForm({ ...form, logo_url: url })}
              onRemove={() => setForm({ ...form, logo_url: "" })}
              aspect="square"
              maxSizeMb={5}
              label="Brand logo"
            />
          </FormField>
          <FormField label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={TEXTAREA_STYLE} maxLength={500} />
          </FormField>
          <FormField label="Website">
            <input type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} style={inputStyle} placeholder="https://" />
          </FormField>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold" style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>

      {/* ─── Locations ─── */}
      <section className="rounded-2xl border p-6 mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>Locations</h2>
          {isOwner && (
            <button
              onClick={() => setShowAddLocation(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Plus size={14} />
              Add Location
            </button>
          )}
        </div>

        <div className="space-y-3">
          {locations.map((loc: any) => (
            <div key={loc.id} className="rounded-xl border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between">
                <Link href={`/brewery-admin/${loc.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  {loc.cover_image_url ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image src={loc.cover_image_url} alt={loc.name} fill className="object-cover" sizes="40px" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
                      <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{loc.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{loc.city}, {loc.state}</p>
                  </div>
                </Link>

                {isOwner && locations.length > 1 && (
                  <div className="flex-shrink-0 ml-2">
                    {confirmRemoveId === loc.id ? (
                      <AnimatePresence>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-2"
                        >
                          <button
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRemoveLocation(loc.id)}
                            disabled={removingId === loc.id}
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{ color: "var(--danger)" }}
                          >
                            {removingId === loc.id ? "Removing..." : "Confirm"}
                          </button>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <button
                        onClick={() => setConfirmRemoveId(loc.id)}
                        className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                        style={{ color: "var(--text-muted)" }}
                        aria-label={`Remove ${loc.name} from brand`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Brand Team ─── */}
      <section className="rounded-2xl border p-6 mb-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <BrandTeamManager brandId={brand.id} isOwner={isOwner} />
      </section>

      {/* ─── Danger Zone ─── */}
      {isOwner && (
        <section className="rounded-2xl border p-6" style={{ borderColor: "var(--danger)", background: "rgba(196,75,58,0.05)" }}>
          <h2 className="font-display font-bold mb-1" style={{ color: "var(--danger)" }}>Danger Zone</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Dissolving the brand removes all locations from the brand and deletes the brand page. Locations themselves are not deleted.
          </p>
          {confirmDissolve ? (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={() => setConfirmDissolve(false)}
                  className="text-sm px-4 py-2 rounded-xl"
                  style={{ color: "var(--text-muted)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDissolve}
                  disabled={dissolving}
                  className="text-sm px-4 py-2 rounded-xl border font-medium"
                  style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                >
                  {dissolving ? "Dissolving..." : "Yes, Dissolve Brand"}
                </button>
              </motion.div>
            </AnimatePresence>
          ) : (
            <button
              onClick={() => setConfirmDissolve(true)}
              className="text-sm px-4 py-2 rounded-xl border transition-colors"
              style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }}
            >
              Dissolve Brand
            </button>
          )}
        </section>
      )}

      {/* Add Location Modal */}
      <AnimatePresence>
        {showAddLocation && (
          <AddLocationModal
            brandId={brand.id}
            onAdd={handleLocationAdded}
            onClose={() => setShowAddLocation(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
