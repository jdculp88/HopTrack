"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

interface BrewerySettingsClientProps {
  brewery: any;
  role: string;
}

export function BrewerySettingsClient({ brewery, role }: BrewerySettingsClientProps) {
  const [form, setForm] = useState({
    name: brewery?.name ?? "",
    street: brewery?.street ?? "",
    city: brewery?.city ?? "",
    state: brewery?.state ?? "",
    website_url: brewery?.website_url ?? "",
    phone: brewery?.phone ?? "",
    description: brewery?.description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const { success, error: toastError } = useToast();

  async function handleSave() {
    setSaving(true);
    const { error } = await (supabase as any).from("breweries").update({
      name: form.name,
      street: form.street || null,
      city: form.city,
      state: form.state,
      website_url: form.website_url || null,
      phone: form.phone || null,
      description: form.description || null,
    }).eq("id", brewery.id);
    setSaving(false);
    if (error) {
      toastError("Failed to save changes. Please try again.");
    } else {
      success("Brewery profile updated!");
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--border)",
    background: "var(--surface-2)", color: "var(--text-primary)", fontSize: 14, outline: "none",
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto pt-16 lg:pt-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Brewery Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Update your brewery's public profile information.
        </p>
      </div>

      <div className="rounded-2xl border p-6 space-y-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Account Role</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Your permission level for this brewery</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full capitalize"
            style={{ background: "rgba(212,168,67,0.15)", color: "var(--accent-gold)" }}>
            {role}
          </span>
        </div>

        {[
          { key: "name", label: "Brewery Name", required: true, placeholder: "e.g. Trillium Brewing" },
          { key: "street", label: "Street Address", placeholder: "42 Hop Street" },
          { key: "city", label: "City", required: true, placeholder: "Austin" },
          { key: "state", label: "State / Province", required: true, placeholder: "Texas" },
          { key: "website_url", label: "Website", placeholder: "https://yourbrewery.com" },
          { key: "phone", label: "Phone", placeholder: "(512) 555-0142" },
        ].map(({ key, label, required, placeholder }) => (
          <div key={key}>
            <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
              {label}{required && " *"}
            </label>
            <input
              value={(form as any)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              style={inputStyle}
            />
          </div>
        ))}

        {/* Description */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Tell visitors about your brewery — your story, vibe, what makes you unique..."
            rows={4}
            style={{ ...inputStyle, resize: "vertical" as const }}
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Shown on your public brewery page.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !form.city.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      {role === "owner" && (
        <div className="mt-6 rounded-2xl border p-6" style={{ borderColor: "var(--danger)", background: "rgba(196,75,58,0.05)" }}>
          <h3 className="font-display font-bold mb-1" style={{ color: "var(--danger)" }}>Danger Zone</h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            These actions are irreversible. Please be certain.
          </p>
          <button
            className="text-sm px-4 py-2 rounded-xl border transition-colors"
            style={{ borderColor: "var(--danger)", color: "var(--danger)", background: "transparent" }}
            onClick={() => window.location.href = "mailto:support@hoptrack.beer?subject=Remove%20Brewery%20Account&body=Please%20remove%20my%20brewery%20account."}
          >
            Remove brewery account
          </button>
        </div>
      )}
    </div>
  );
}
