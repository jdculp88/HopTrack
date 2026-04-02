"use client";

import { Building2, MapPin, Globe, FileText } from "lucide-react";
import Image from "next/image";

interface BrandConfirmStepProps {
  brandName: string;
  slug: string;
  logoUrl: string | null;
  description: string;
  websiteUrl: string;
  breweryName: string;
  creating: boolean;
}

export function BrandConfirmStep({
  brandName, slug, logoUrl, description, websiteUrl, breweryName, creating,
}: BrandConfirmStepProps) {
  return (
    <div className="space-y-5">
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Review your brand details before creating.
      </p>

      {/* Summary card */}
      <div className="rounded-2xl border p-4 space-y-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
              <Image src={logoUrl} alt={brandName} fill className="object-cover" sizes="48px" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
              <Building2 size={20} style={{ color: "var(--accent-gold)" }} />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-display font-bold text-lg truncate" style={{ color: "var(--text-primary)" }}>
              {brandName}
            </p>
            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              /brand/{slug}
            </p>
          </div>
        </div>

        {description && (
          <div className="flex items-start gap-2">
            <FileText size={14} className="mt-0.5 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{description}</p>
          </div>
        )}

        {websiteUrl && (
          <div className="flex items-center gap-2">
            <Globe size={14} className="flex-shrink-0" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>{websiteUrl}</p>
          </div>
        )}
      </div>

      {/* First location callout */}
      <div className="rounded-xl border p-3 flex items-center gap-3"
        style={{ background: "color-mix(in srgb, var(--accent-gold) 8%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 25%, transparent)" }}>
        <MapPin size={16} style={{ color: "var(--accent-gold)" }} />
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
          <strong>{breweryName}</strong> will become the first location of this brand.
        </p>
      </div>

      {creating && (
        <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
          Creating your brand...
        </p>
      )}
    </div>
  );
}
