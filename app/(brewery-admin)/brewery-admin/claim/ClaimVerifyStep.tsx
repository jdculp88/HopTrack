"use client";

import { Building2, CheckCircle } from "lucide-react";
import { OpenBrewery } from "./ClaimSearchStep";

function formatBreweryType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ClaimVerifyStepProps {
  brewery: OpenBrewery;
}

export function ClaimVerifyStep({ brewery }: ClaimVerifyStepProps) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: "var(--surface)",
        borderColor: "var(--accent-gold)",
        boxShadow: "0 0 0 1px var(--accent-gold)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
        >
          <Building2 size={18} style={{ color: "var(--accent-gold)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-display font-bold text-lg truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {brewery.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {[brewery.city, brewery.state_province].filter(Boolean).join(", ")}
            {brewery.brewery_type && (
              <> · {formatBreweryType(brewery.brewery_type)}</>
            )}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono flex-shrink-0"
          style={{
            background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
            color: "var(--accent-gold)",
          }}
        >
          <CheckCircle size={10} />
          Selected
        </div>
      </div>
    </div>
  );
}
