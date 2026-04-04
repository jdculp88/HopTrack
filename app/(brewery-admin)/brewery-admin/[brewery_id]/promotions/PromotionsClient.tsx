"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Beer, Tag, ToggleLeft, ToggleRight, Save, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useParams } from "next/navigation";

const VIBE_PRESETS = ["rooftop", "dog-friendly", "live music", "outdoor", "lively", "chill", "food", "waterfront", "barrel-aged", "sports bar", "family-friendly", "late night"];

interface PromotionsClientProps {
  brewery: {
    id: string;
    name: string;
    hop_route_eligible: boolean;
    hop_route_offer: string | null;
    vibe_tags: string[] | null;
  };
}

export function PromotionsClient({ brewery }: PromotionsClientProps) {
  const params = useParams();
  const breweryId = params.brewery_id as string;
  const { success, error: showError } = useToast();

  const [eligible, setEligible] = useState(brewery.hop_route_eligible);
  const [offer, setOffer] = useState(brewery.hop_route_offer ?? "");
  const [vibeTags, setVibeTags] = useState<string[]>(brewery.vibe_tags ?? []);
  const [saving, setSaving] = useState(false);

  function toggleVibe(tag: string) {
    setVibeTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/brewery/${breweryId}/promotions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hop_route_eligible: eligible, hop_route_offer: offer, vibe_tags: vibeTags }),
      });
      if (!res.ok) {
        const data = await res.json();
        showError(data.error ?? "Failed to save");
        return;
      }
      success("Promotions settings saved!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pt-16 lg:pt-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}>
          <Beer size={20} />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Promotions</h1>
          <p className="text-sm text-[var(--text-secondary)]">HopRoute placement &amp; offers</p>
        </div>
      </div>

      {/* HopRoute Eligibility */}
      <div className="p-5 rounded-2xl border space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} style={{ color: "var(--accent-gold)" }} />
              <h2 className="font-semibold text-[var(--text-primary)]">Eligible for HopRoute Placement</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              When enabled, {brewery.name} will be weighted slightly higher in AI-generated routes for users near you. Max 1 sponsored stop per route.
            </p>
          </div>
          <button
            onClick={() => setEligible(!eligible)}
            className="flex-shrink-0 transition-colors"
            style={{ color: eligible ? "var(--accent-gold)" : "var(--text-muted)" }}
          >
            {eligible ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
          </button>
        </div>

        {/* Offer text */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-[var(--text-muted)]" htmlFor="offer">
            Active offer for HopRoute visitors (optional)
          </label>
          <input
            id="offer"
            type="text"
            placeholder="e.g. First pint free for HopRoute visitors! 🍺"
            maxLength={120}
            value={offer}
            onChange={(e) => setOffer(e.target.value)}
            disabled={!eligible}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors disabled:opacity-40"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
          />
          <p className="text-xs text-[var(--text-muted)]">{offer.length}/120 — shown on the stop card when a user's route includes you</p>
        </div>

        {eligible && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", color: "var(--accent-gold)" }}>
            <Sparkles size={12} /> Taylor's note: This toggle is the pitch. Breweries can see exactly what their visitors will see.
          </div>
        )}
      </div>

      {/* Vibe Tags */}
      <div className="p-5 rounded-2xl border space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Tag size={16} style={{ color: "var(--accent-gold)" }} />
            <h2 className="font-semibold text-[var(--text-primary)]">Vibe Tags</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Help the AI match you to the right routes. Drew says: &quot;Vibe tags are how you get a rooftop into the right routes.&quot;
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {VIBE_PRESETS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleVibe(tag)}
              className="px-3 py-1.5 rounded-full text-xs font-mono border transition-all"
              style={
                vibeTags.includes(tag)
                  ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)", color: "var(--accent-gold)" }
                  : { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }
              }
            >
              {tag}
            </button>
          ))}
        </div>
        {vibeTags.length > 0 && (
          <p className="text-xs text-[var(--text-muted)]">Selected: {vibeTags.join(", ")}</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
      >
        <motion.span whileTap={{ scale: 0.98 }} className="flex items-center gap-2">
          {saving ? "Saving..." : <><Save size={14} /> Save Promotions Settings</>}
        </motion.span>
      </button>
    </div>
  );
}
