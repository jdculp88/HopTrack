"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Loader2, UtensilsCrossed, Key, Plug, Unplug, RefreshCw, ArrowUpRight, Lock, ChevronDown, ChevronUp, X, Sparkles, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/components/ui/Toast";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { MenuUpload } from "@/components/ui/MenuUpload";
import { ApiKeyManager } from "@/components/brewery-admin/ApiKeyManager";

interface BrewerySettingsClientProps {
  brewery: any;
  role: string;
  subscriptionTier?: string;
}

export function BrewerySettingsClient({ brewery, role, subscriptionTier = "free" }: BrewerySettingsClientProps) {
  const [form, setForm] = useState({
    name: brewery?.name ?? "",
    street: brewery?.street ?? "",
    city: brewery?.city ?? "",
    state: brewery?.state ?? "",
    website_url: brewery?.website_url ?? "",
    phone: brewery?.phone ?? "",
    description: brewery?.description ?? "",
    cover_image_url: brewery?.cover_image_url ?? "",
    menu_image_url: brewery?.menu_image_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const { success, error: toastError } = useToast();

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/brewery/${brewery.id}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
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
          Update your brewery&apos;s public profile information.
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

        {/* Cover Photo */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
            Cover Photo
          </label>
          <ImageUpload
            bucket="brewery-covers"
            folder={brewery.id}
            currentUrl={form.cover_image_url || null}
            onUpload={(url) => setForm(f => ({ ...f, cover_image_url: url }))}
            onRemove={() => setForm(f => ({ ...f, cover_image_url: "" }))}
            aspect="cover"
            maxSizeMb={10}
            label="Upload cover photo"
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Shown as the banner on your public brewery page. Recommended: 1200×400px.
          </p>
        </div>

        {/* Food Menu Upload */}
        <div>
          <label className="text-xs font-mono uppercase tracking-wider block mb-1.5" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <UtensilsCrossed size={12} /> Food Menu
            </span>
          </label>
          <MenuUpload
            bucket="brewery-covers"
            folder={`${brewery.id}/menu`}
            currentUrl={form.menu_image_url || null}
            onUpload={(url) => setForm(f => ({ ...f, menu_image_url: url }))}
            onRemove={() => setForm(f => ({ ...f, menu_image_url: "" }))}
            maxSizeMb={10}
            label="Upload food menu"
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Upload a photo, scan, or PDF of your food menu. Shown on your public brewery page.
          </p>
        </div>

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
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* API Keys */}
      {(role === "owner" || role === "manager") && (
        <div className="mt-6 rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-1">
            <Key size={18} style={{ color: "var(--accent-gold)" }} />
            <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>API Keys</h3>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Generate API keys to access the HopTrack Public API. Use keys to build integrations, display your tap list on your website, or connect to POS systems.
          </p>
          <ApiKeyManager breweryId={brewery.id} />
        </div>
      )}

      {/* HopRoute & Discovery */}
      {(role === "owner" || role === "manager") && (
        <HopRouteSettingsSection brewery={brewery} />
      )}

      {/* POS Integration */}
      {(role === "owner" || role === "manager") && (
        <PosSettingsSection breweryId={brewery.id} subscriptionTier={subscriptionTier} />
      )}

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

// ─── HopRoute & Discovery Section ────────────────────────────────────────────

const VIBE_PRESETS = ["rooftop", "dog-friendly", "live music", "outdoor", "lively", "chill", "food", "waterfront", "barrel-aged", "sports bar", "family-friendly", "late night"];

function HopRouteSettingsSection({ brewery }: { brewery: any }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [eligible, setEligible] = useState(brewery?.hop_route_eligible ?? false);
  const [offer, setOffer] = useState(brewery?.hop_route_offer ?? "");
  const [vibeTags, setVibeTags] = useState<string[]>(brewery?.vibe_tags ?? []);
  const [saving, setSaving] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (window.location.hash === "#hoproute" && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  function toggleVibe(tag: string) {
    setVibeTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/brewery/${brewery.id}/promotions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hop_route_eligible: eligible, hop_route_offer: offer, vibe_tags: vibeTags }),
      });
      if (!res.ok) {
        const data = await res.json();
        showError(data.error ?? "Failed to save");
        return;
      }
      success("HopRoute settings saved!");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={sectionRef} id="hoproute" className="mt-6 rounded-2xl border p-6 space-y-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={18} style={{ color: "var(--accent-gold)" }} />
        <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>HopRoute & Discovery</h3>
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Control how your brewery appears in AI-generated HopRoute crawl plans.
      </p>

      {/* Eligibility Toggle */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Eligible for HopRoute Placement</h4>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            When enabled, your brewery will be weighted slightly higher in AI-generated routes for users near you.
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

      {/* Offer Text */}
      <div className="space-y-1.5">
        <label className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Active offer for HopRoute visitors (optional)
        </label>
        <input
          type="text"
          placeholder="e.g. First pint free for HopRoute visitors!"
          maxLength={120}
          value={offer}
          onChange={(e) => setOffer(e.target.value)}
          disabled={!eligible}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-colors disabled:opacity-40"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
        />
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{offer.length}/120</p>
      </div>

      {/* Vibe Tags */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Tag size={12} style={{ color: "var(--accent-gold)" }} />
          <label className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Vibe Tags
          </label>
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Help the AI match you to the right routes.
        </p>
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
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Selected: {vibeTags.join(", ")}</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
        style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
      >
        {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save HopRoute Settings</>}
      </button>
    </div>
  );
}

// ─── POS Settings Section ────────────────────────────────────────────────────

interface PosConnection {
  id: string;
  provider: string;
  status: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_item_count: number;
  connected_at: string;
  health: "green" | "yellow" | "red";
}

const PROVIDERS = [
  { id: "toast" as const, name: "Toast", description: "Sync your tap list automatically from Toast POS", logo: "🍞" },
  { id: "square" as const, name: "Square", description: "Sync your tap list automatically from Square POS", logo: "⬛" },
];

interface PosMapping {
  id: string;
  pos_item_id: string;
  pos_item_name: string;
  beer_id: string | null;
  mapping_type: "auto" | "manual" | "unmapped";
  beer?: { id: string; name: string; style: string | null; abv: number | null };
}

function PosSettingsSection({ breweryId, subscriptionTier }: { breweryId: string; subscriptionTier: string }) {
  const [connections, setConnections] = useState<PosConnection[]>([]);
  const [recentSyncs, setRecentSyncs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [showSyncHistory, setShowSyncHistory] = useState(false);
  const [showMappings, setShowMappings] = useState(false);
  const [mappings, setMappings] = useState<PosMapping[]>([]);
  const [availableBeers, setAvailableBeers] = useState<{ id: string; name: string; style: string | null }[]>([]);
  const [mappingsLoading, setMappingsLoading] = useState(false);
  const [mappingFilter, setMappingFilter] = useState<"all" | "unmapped" | "auto" | "manual">("all");
  const { success, error: toastError } = useToast();

  const isTierEligible = ["cask", "barrel"].includes(subscriptionTier);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/pos/status?brewery_id=${breweryId}`);
      if (res.ok) {
        const json = await res.json();
        setConnections(json.data.connections || []);
        setRecentSyncs(json.data.recent_syncs || []);
      }
    } catch {
      // Silently fail — status is non-critical
    } finally {
      setLoading(false);
    }
  }, [breweryId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function handleConnect(provider: string) {
    window.location.href = `/api/pos/connect/${provider}?brewery_id=${breweryId}`;
  }

  async function handleDisconnect(provider: string) {
    setDisconnecting(provider);
    try {
      const res = await fetch(`/api/pos/disconnect/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: breweryId }),
      });
      if (res.ok) {
        success(`Disconnected from ${provider}`);
        fetchStatus();
      } else {
        const json = await res.json();
        toastError(json.error?.message || "Failed to disconnect");
      }
    } catch {
      toastError("Failed to disconnect");
    } finally {
      setDisconnecting(null);
    }
  }

  async function handleSync(provider: string) {
    setSyncing(provider);
    try {
      const res = await fetch(`/api/pos/sync/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: breweryId }),
      });
      const json = await res.json();
      if (res.ok) {
        const d = json.data;
        success(`Sync complete! +${d.items_added} added, ${d.items_updated} updated, ${d.items_removed} removed`);
        fetchStatus();
        if (showMappings) fetchMappings();
      } else {
        toastError(json.error?.message || "Sync failed");
      }
    } catch {
      toastError("Sync failed");
    } finally {
      setSyncing(null);
    }
  }

  async function fetchMappings() {
    setMappingsLoading(true);
    try {
      const res = await fetch(`/api/pos/mapping?brewery_id=${breweryId}`);
      if (res.ok) {
        const json = await res.json();
        setMappings(json.data?.mappings || []);
        setAvailableBeers(json.data?.available_beers || []);
      }
    } catch {
      // Non-critical
    } finally {
      setMappingsLoading(false);
    }
  }

  async function updateMapping(mappingId: string, beerId: string | null) {
    try {
      const res = await fetch(`/api/pos/mapping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brewery_id: breweryId, mapping_id: mappingId, beer_id: beerId }),
      });
      if (res.ok) {
        success(beerId ? "Mapping updated" : "Mapping cleared");
        fetchMappings();
      } else {
        toastError("Failed to update mapping");
      }
    } catch {
      toastError("Failed to update mapping");
    }
  }

  function getConnectionForProvider(provider: string): PosConnection | undefined {
    return connections.find(c => c.provider === provider && c.status !== "disconnected");
  }

  const healthColor = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" };

  return (
    <div className="mt-6 rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)", position: "relative", overflow: "hidden" }}>
      <div className="flex items-center gap-2 mb-1">
        <Plug size={18} style={{ color: "var(--accent-gold)" }} />
        <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>POS Integration</h3>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
        Connect your point-of-sale system to keep your HopTrack tap list in sync automatically. No more double entry.
      </p>

      {/* Tier gating overlay */}
      {!isTierEligible && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl" style={{ background: "rgba(15,14,12,0.85)", backdropFilter: "blur(4px)" }}>
          <Lock size={32} style={{ color: "var(--accent-gold)", marginBottom: 12 }} />
          <p className="font-display font-bold text-lg text-center px-6" style={{ color: "var(--text-primary)" }}>
            Connect your POS and never double-enter a tap list again
          </p>
          <p className="text-sm mt-2 text-center px-6" style={{ color: "var(--text-muted)" }}>
            POS integration is available on Cask ($149/mo) and Barrel tiers.
          </p>
          <button
            className="mt-4 px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            onClick={() => window.location.href = `/brewery-admin/${breweryId}/billing`}
          >
            Upgrade to Cask <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* Connection cards */}
      <div className="space-y-3">
        {PROVIDERS.map(prov => {
          const conn = getConnectionForProvider(prov.id);
          const isConnected = !!conn && conn.status === "active";
          const isDisconnecting = disconnecting === prov.id;
          const isSyncing = syncing === prov.id;

          return (
            <div key={prov.id} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{prov.logo}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{prov.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{prov.description}</p>
                  </div>
                </div>
                {!isConnected ? (
                  <button
                    onClick={() => handleConnect(prov.id)}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
                  >
                    Connect
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: healthColor[conn.health] }} />
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {conn.health === "green" ? "Synced" : conn.health === "yellow" ? "Stale" : "Error"}
                    </span>
                  </div>
                )}
              </div>

              {/* Connected state details */}
              <AnimatePresence>
                {isConnected && conn && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                        <div className="space-y-1">
                          <p>Connected {formatTimeAgo(conn.connected_at)}</p>
                          <p>Last sync: {formatTimeAgo(conn.last_sync_at)} · {conn.last_sync_item_count} items</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSync(prov.id)}
                            disabled={isSyncing}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                            style={{ border: "1px solid var(--border)", color: "var(--text-primary)" }}
                          >
                            {isSyncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                            Sync Now
                          </button>
                          <button
                            onClick={() => handleDisconnect(prov.id)}
                            disabled={isDisconnecting}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                            style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}
                          >
                            {isDisconnecting ? <Loader2 size={12} className="animate-spin" /> : <Unplug size={12} />}
                            Disconnect
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Sync History */}
      {recentSyncs.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowSyncHistory(!showSyncHistory)}
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {showSyncHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Sync History ({recentSyncs.length})
          </button>
          <AnimatePresence>
            {showSyncHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5">
                  {recentSyncs.map((sync: any) => (
                    <div key={sync.id} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg" style={{ background: "var(--surface-2)" }}>
                      <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: sync.status === "success" ? "#22c55e" : sync.status === "partial" ? "#eab308" : "#ef4444" }} />
                        <span className="capitalize">{sync.provider}</span>
                        <span>·</span>
                        <span className="capitalize">{sync.sync_type}</span>
                      </div>
                      <div className="flex items-center gap-3" style={{ color: "var(--text-muted)" }}>
                        <span>+{sync.items_added} ~{sync.items_updated} -{sync.items_removed}</span>
                        <span>{formatTimeAgo(sync.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Item Mappings — Sprint 87 */}
      {connections.some(c => c.status === "active") && (
        <div className="mt-4">
          <button
            onClick={() => { setShowMappings(!showMappings); if (!showMappings && mappings.length === 0) fetchMappings(); }}
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            {showMappings ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Item Mappings {mappings.length > 0 && `(${mappings.filter(m => m.mapping_type === "unmapped").length} unmapped)`}
          </button>
          <AnimatePresence>
            {showMappings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2">
                  {/* Filter pills */}
                  <div className="flex gap-1.5 mb-3">
                    {(["all", "unmapped", "auto", "manual"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setMappingFilter(f)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize"
                        style={{
                          background: mappingFilter === f ? "var(--accent-gold)" : "var(--surface-2)",
                          color: mappingFilter === f ? "var(--bg)" : "var(--text-muted)",
                        }}
                      >
                        {f} {f === "unmapped" && mappings.filter(m => m.mapping_type === "unmapped").length > 0 &&
                          `(${mappings.filter(m => m.mapping_type === "unmapped").length})`}
                      </button>
                    ))}
                  </div>

                  {mappingsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-muted)" }} />
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-80 overflow-y-auto">
                      {mappings
                        .filter(m => mappingFilter === "all" || m.mapping_type === mappingFilter)
                        .map(mapping => (
                          <div key={mapping.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--surface-2)" }}>
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: mapping.mapping_type === "auto" ? "#22c55e" : mapping.mapping_type === "manual" ? "#3b82f6" : "#eab308" }}
                              />
                              <span className="truncate" style={{ color: "var(--text-primary)" }}>{mapping.pos_item_name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {mapping.mapping_type === "unmapped" ? (
                                <select
                                  className="text-xs rounded-lg px-2 py-1 max-w-[160px]"
                                  style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
                                  value=""
                                  onChange={e => { if (e.target.value) updateMapping(mapping.id, e.target.value); }}
                                >
                                  <option value="">Map to beer...</option>
                                  {availableBeers.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className="truncate max-w-[160px]" style={{ color: "var(--text-muted)" }}>
                                  {mapping.beer?.name || "—"}
                                </span>
                              )}
                              {mapping.mapping_type !== "unmapped" && (
                                <button
                                  onClick={() => updateMapping(mapping.id, null)}
                                  className="p-0.5 rounded hover:opacity-70"
                                  title="Unmap"
                                >
                                  <X size={10} style={{ color: "var(--text-muted)" }} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      {mappings.filter(m => mappingFilter === "all" || m.mapping_type === mappingFilter).length === 0 && (
                        <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>
                          {mappingFilter === "unmapped" ? "All items are mapped!" : "No mappings yet. Run a sync to discover POS items."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  function formatTimeAgo(dateStr: string | null): string {
    if (!dateStr) return "Never";
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60_000) return "Just now";
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return `${Math.floor(diff / 86_400_000)}d ago`;
  }
}
