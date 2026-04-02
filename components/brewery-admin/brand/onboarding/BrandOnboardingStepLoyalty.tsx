"use client";

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface BrandOnboardingStepLoyaltyProps {
  brandId: string;
  onComplete: () => void;
}

const REWARD_PRESETS = [
  { stamps: 5, reward: "Free half-pour at any location" },
  { stamps: 8, reward: "Free pint at any location" },
  { stamps: 10, reward: "Free pint + branded glass" },
  { stamps: 12, reward: "Free growler fill at any location" },
];

export function BrandOnboardingStepLoyalty({ brandId, onComplete }: BrandOnboardingStepLoyaltyProps) {
  const [enabled, setEnabled] = useState(true);
  const [stampsRequired, setStampsRequired] = useState(10);
  const [rewardDescription, setRewardDescription] = useState("Free pint at any location");
  const [programName, setProgramName] = useState("Brand Loyalty");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { success, error: showError } = useToast();

  async function handleSave() {
    if (!enabled) {
      onComplete();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/brand/${brandId}/loyalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: programName.trim() || "Brand Loyalty",
          stamps_required: stampsRequired,
          reward_description: rewardDescription.trim() || "Free pint at any location",
        }),
      });

      if (res.ok) {
        onComplete();
        setSaved(true);
        success("Brand loyalty program created!");
      } else {
        const data = await res.json();
        if (res.status === 409 || data.error?.includes("exists")) {
          // Already has a program — mark complete
          onComplete();
          setSaved(true);
          success("Brand loyalty program already exists!");
        } else {
          showError(data.error || "Failed to create program");
        }
      }
    } catch {
      showError("Failed to create program");
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <Gift size={20} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Set up brand loyalty
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Customers earn stamps at ANY of your locations and redeem at any.
        </p>
      </div>

      {/* Enable toggle */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl border"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          Enable brand loyalty
        </span>
        <button
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled(!enabled)}
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ background: enabled ? "var(--accent-gold)" : "var(--border)" }}
        >
          <span
            className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
            style={{
              background: "var(--bg)",
              left: enabled ? "calc(100% - 1.375rem)" : "0.125rem",
            }}
          />
        </button>
      </div>

      {enabled && !saved && (
        <>
          {/* Program name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Program name
            </label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Brand Loyalty"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Stamps required */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Visits to earn reward
            </label>
            <div className="flex gap-2">
              {[5, 8, 10, 12, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setStampsRequired(n)}
                  className="flex-1 py-2 rounded-xl text-sm font-mono font-bold border transition-all"
                  style={{
                    borderColor: stampsRequired === n ? "var(--accent-gold)" : "var(--border)",
                    color: stampsRequired === n ? "var(--accent-gold)" : "var(--text-secondary)",
                    background: stampsRequired === n ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "transparent",
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Reward presets */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Reward
            </label>
            <div className="space-y-1.5">
              {REWARD_PRESETS.map((preset) => (
                <button
                  key={preset.reward}
                  onClick={() => { setStampsRequired(preset.stamps); setRewardDescription(preset.reward); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm border transition-all"
                  style={{
                    borderColor: rewardDescription === preset.reward ? "var(--accent-gold)" : "var(--border)",
                    color: rewardDescription === preset.reward ? "var(--accent-gold)" : "var(--text-secondary)",
                    background: rewardDescription === preset.reward ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "var(--surface-2)",
                  }}
                >
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {preset.stamps} visits →
                  </span>{" "}
                  {preset.reward}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reward input */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Or write your own reward
            </label>
            <input
              type="text"
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              placeholder="Free pint at any location"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Creating...</>
            ) : (
              "Create Brand Loyalty Program"
            )}
          </button>
        </>
      )}

      {saved && (
        <div className="text-center py-4">
          <p className="text-2xl mb-2">🎉</p>
          <p className="font-display font-bold" style={{ color: "var(--accent-gold)" }}>
            Brand loyalty active!
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {stampsRequired} visits → {rewardDescription}
          </p>
        </div>
      )}

      {!enabled && (
        <p className="text-center text-sm py-4" style={{ color: "var(--text-muted)" }}>
          No problem — you can set this up anytime from the Brand Loyalty page.
        </p>
      )}
    </div>
  );
}
