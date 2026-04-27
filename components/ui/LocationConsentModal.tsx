"use client";

import { MapPin, Shield } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LegalLink } from "@/components/ui/LegalLink";

interface LocationConsentModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export function LocationConsentModal({ isOpen, onAllow, onDismiss }: LocationConsentModalProps) {
  async function handleAllow() {
    try {
      await fetch("/api/users/location-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Best-effort server-side record — consent still works client-side
    }
    localStorage.setItem("ht-location-consent", "true");
    onAllow();
  }

  return (
    <Modal open={isOpen} onClose={onDismiss} title="Enable Location" size="sm">
      <div className="px-6 py-5 space-y-5">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
          >
            <MapPin size={28} style={{ color: "var(--accent-gold)" }} />
          </div>
        </div>

        {/* Explanation */}
        <div className="text-center space-y-2">
          <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Find breweries near you
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            We use your location to show nearby breweries, friends at venues, and personalized
            recommendations. Your location is never shared publicly.
          </p>
        </div>

        {/* Privacy note */}
        <div
          className="flex items-start gap-2 rounded-xl p-3"
          style={{ background: "var(--surface-2)" }}
        >
          <Shield size={14} className="flex-shrink-0 mt-0.5" style={{ color: "var(--text-muted)" }} />
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Your precise location stays on your device. We only use approximate location for
            features. See our{" "}
            <LegalLink
              href="/privacy"
              className="underline transition-opacity hover:opacity-70"
              style={{ color: "var(--accent-gold)" }}
            >
              Privacy Policy
            </LegalLink>{" "}
            for details.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAllow}
            className="w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            Allow Location
          </button>
          <button
            onClick={onDismiss}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            Not Now
          </button>
        </div>
      </div>
    </Modal>
  );
}
