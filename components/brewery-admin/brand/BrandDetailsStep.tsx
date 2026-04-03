"use client";

import { ImageUpload } from "@/components/ui/ImageUpload";
import { INPUT_STYLE, TEXTAREA_STYLE } from "@/lib/constants/ui";

interface BrandDetailsStepProps {
  userId: string;
  logoUrl: string | null;
  setLogoUrl: (v: string | null) => void;
  description: string;
  setDescription: (v: string) => void;
  websiteUrl: string;
  setWebsiteUrl: (v: string) => void;
}

export function BrandDetailsStep({
  userId, logoUrl, setLogoUrl, description, setDescription, websiteUrl, setWebsiteUrl,
}: BrandDetailsStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Add a logo and details for your brand. You can update these anytime.
      </p>

      {/* Logo */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
          Brand Logo
        </label>
        <ImageUpload
          bucket="brand-logos"
          folder={userId}
          currentUrl={logoUrl}
          onUpload={(url) => setLogoUrl(url)}
          onRemove={() => setLogoUrl(null)}
          aspect="square"
          maxSizeMb={5}
          label="Upload brand logo"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell people about your brand..."
          rows={3}
          style={TEXTAREA_STYLE}
          maxLength={500}
        />
      </div>

      {/* Website */}
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>
          Website URL
        </label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://wickedweedbrewing.com"
          style={INPUT_STYLE}
        />
      </div>
    </div>
  );
}
