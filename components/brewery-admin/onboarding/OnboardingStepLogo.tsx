"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Upload } from "lucide-react";

interface OnboardingStepLogoProps {
  breweryId: string;
  onComplete: () => void;
}

export function OnboardingStepLogo({ breweryId, onComplete }: OnboardingStepLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const { success } = useToast();

  async function handleUpload(url: string) {
    setLogoUrl(url);

    // Save to brewery record
    const supabase = createClient();
    const { error } = await supabase
      .from("breweries")
      .update({ logo_url: url } as any)
      .eq("id", breweryId);

    if (!error) {
      onComplete();
      success("Logo uploaded!");
    }
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
          style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
        >
          <Upload size={20} style={{ color: "var(--accent-gold)" }} />
        </div>
        <h3 className="font-display text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Upload your logo
        </h3>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          This appears on your Board, brewery page, and customer notifications.
          JPEG, PNG, or WebP — square works best.
        </p>
      </div>

      <div className="flex justify-center">
        <ImageUpload
          bucket="brewery-covers"
          folder={breweryId}
          currentUrl={logoUrl}
          onUpload={handleUpload}
          onRemove={() => setLogoUrl(null)}
          aspect="square"
          maxSizeMb={5}
          label="Upload logo"
        />
      </div>

      {logoUrl && (
        <p className="text-center text-xs font-mono" style={{ color: "var(--accent-gold)" }}>
          Looking good! 🍺
        </p>
      )}
    </div>
  );
}
