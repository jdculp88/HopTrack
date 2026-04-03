"use client";

import { useState, useCallback, useRef } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { INPUT_STYLE } from "@/lib/constants/ui";

interface BrandNameStepProps {
  brandName: string;
  setBrandName: (v: string) => void;
  slug: string;
  setSlug: (v: string) => void;
  slugAvailable: boolean;
  setSlugAvailable: (v: boolean) => void;
}

type SlugStatus = "idle" | "debouncing" | "checking" | "available" | "taken";

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function BrandNameStep({
  brandName, setBrandName, slug, setSlug, slugAvailable, setSlugAvailable,
}: BrandNameStepProps) {
  const [slugStatus, setSlugStatus] = useState<SlugStatus>(slugAvailable ? "available" : "idle");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkSlug = useCallback(async (value: string) => {
    if (value.length < 2) { setSlugStatus("idle"); setSlugAvailable(false); return; }
    setSlugStatus("checking");
    try {
      const res = await fetch(`/api/brand/slug-check?slug=${encodeURIComponent(value)}`);
      const data = await res.json();
      const available = data.data?.available ?? false;
      setSlugStatus(available ? "available" : "taken");
      setSlugAvailable(available);
    } catch {
      setSlugStatus("idle");
      setSlugAvailable(false);
    }
  }, [setSlugAvailable]);

  function handleNameChange(value: string) {
    setBrandName(value);
    if (!slugManuallyEdited) {
      const newSlug = nameToSlug(value);
      setSlug(newSlug);
      triggerSlugCheck(newSlug);
    }
  }

  function handleSlugChange(value: string) {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 64);
    setSlug(cleaned);
    setSlugManuallyEdited(true);
    triggerSlugCheck(cleaned);
  }

  function triggerSlugCheck(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSlugStatus("idle"); setSlugAvailable(false); return; }
    setSlugStatus("debouncing");
    debounceRef.current = setTimeout(() => checkSlug(value), 500);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Give your brand a name. This groups multiple brewery locations under one identity.
      </p>

      {/* Brand Name */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
          Brand Name
        </label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Wicked Weed Brewing"
          style={INPUT_STYLE}
          maxLength={100}
          autoFocus
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
          Brand URL Slug
        </label>
        <div className="relative">
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="wicked-weed-brewing"
            style={INPUT_STYLE}
            maxLength={64}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {slugStatus === "checking" && <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />}
            {slugStatus === "debouncing" && <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />}
            {slugStatus === "available" && <Check size={16} style={{ color: "#22c55e" }} />}
            {slugStatus === "taken" && <X size={16} style={{ color: "var(--danger)" }} />}
          </div>
        </div>
        <p className="text-xs mt-1" style={{ color: slugStatus === "taken" ? "var(--danger)" : "var(--text-muted)" }}>
          {slugStatus === "taken" ? "This slug is already taken" : `hoptrack.beer/brand/${slug || "your-slug"}`}
        </p>
      </div>
    </div>
  );
}
