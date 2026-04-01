"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Clock, Users, Zap, Navigation, ChevronRight, Loader2, Beer } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

// ─── Nominatim autocomplete types ────────────────────────────────────────────
interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

function formatLocationLabel(r: NominatimResult): string {
  const addr = r.address;
  if (!addr) return r.display_name.split(",").slice(0, 2).join(",").trim();
  const city = addr.city || addr.town || addr.village || "";
  const state = addr.state || "";
  const country = addr.country || "";
  const parts = [city, state].filter(Boolean);
  if (country && country !== "United States") parts.push(country);
  return parts.join(", ") || r.display_name.split(",").slice(0, 2).join(",").trim();
}

type GroupSize = "solo" | "couple" | "small" | "large";
type Transport = "walking" | "rideshare" | "driving";

const VIBE_OPTIONS = ["chill", "outdoor", "food", "dog-friendly", "lively", "rooftop", "live music", "sports"];
const GROUP_OPTIONS: { value: GroupSize; label: string; emoji: string }[] = [
  { value: "solo", label: "Solo", emoji: "🍺" },
  { value: "couple", label: "Couple", emoji: "🥂" },
  { value: "small", label: "Small (3–5)", emoji: "👥" },
  { value: "large", label: "Large (6+)", emoji: "🎉" },
];
const TRANSPORT_OPTIONS: { value: Transport; label: string; emoji: string }[] = [
  { value: "walking", label: "Walking", emoji: "🚶" },
  { value: "rideshare", label: "Rideshare", emoji: "🚗" },
  { value: "driving", label: "Driving", emoji: "🛻" },
];
const LOADING_MESSAGES = [
  "Asking the locals...",
  "Checking the tap lists...",
  "Optimizing your route...",
  "Consulting the beer oracle...",
  "Mapping the perfect crawl...",
];

interface TasteDnaEntry { style: string; avg_rating: number }

interface HopRouteNewClientProps {
  tasteDna: TasteDnaEntry[];
}

export function HopRouteNewClient({ tasteDna }: HopRouteNewClientProps) {
  const router = useRouter();
  const { error: showError } = useToast();

  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  // Step 1 — Location + Time
  const [city, setCity] = useState("");
  const [locationMode, setLocationMode] = useState<"gps" | "city">("city");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [timeStart, setTimeStart] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [timeEnd, setTimeEnd] = useState(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 4);
    return d.toISOString().slice(0, 16);
  });

  // Autocomplete
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) { setSuggestions([]); return; }
    setSuggestionsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us`,
        { headers: { "User-Agent": "HopTrack/1.0" } }
      );
      const data: NominatimResult[] = await res.json();
      // Filter to places with a city/town/village
      const filtered = data.filter(r => r.address?.city || r.address?.town || r.address?.village);
      setSuggestions(filtered.length > 0 ? filtered : data.slice(0, 5));
      setShowSuggestions(true);
      setHighlightIdx(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  function handleCityChange(value: string) {
    setCity(value);
    setCoords(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  }

  function selectSuggestion(r: NominatimResult) {
    const label = formatLocationLabel(r);
    setCity(label);
    setCoords({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setShowSuggestions(false);
    setSuggestions([]);
  }

  function handleCityKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  // Close suggestions on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Step 2 — Preferences
  const [stopCount, setStopCount] = useState(3);
  const [groupSize, setGroupSize] = useState<GroupSize>("solo");
  const [vibes, setVibes] = useState<string[]>([]);
  const [transport, setTransport] = useState<Transport>("walking");

  // Step 3 — Taste DNA (editable)
  const [dna, setDna] = useState<TasteDnaEntry[]>(tasteDna);

  function toggleVibe(v: string) {
    setVibes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }

  async function handleGps() {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationMode("gps");
        setCity("Current location");
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        setLocationMode("city");
      }
    );
  }

  async function handleGenerate() {
    const cityName = city.trim();
    if (!cityName) { showError("Enter a city or use GPS"); return; }

    setGenerating(true);
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIdx]);
    }, 2200);

    try {
      // Geocode the city if user typed a name instead of using GPS
      let lat = coords?.lat;
      let lng = coords?.lng;
      if (!lat || !lng) {
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&countrycodes=us`,
            { headers: { "User-Agent": "HopTrack/1.0" } }
          );
          const geoData = await geoRes.json();
          if (geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
          } else {
            showError(`Couldn't find "${cityName}". Try a different city or use GPS.`);
            return;
          }
        } catch {
          showError("Couldn't look up that city. Try using GPS instead.");
          return;
        }
      }

      const res = await fetch("/api/hop-route/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: {
            lat,
            lng,
            city: cityName,
          },
          time_window: {
            start: new Date(timeStart).toISOString(),
            end: new Date(timeEnd).toISOString(),
          },
          stop_count: stopCount,
          group_size: groupSize,
          vibe: vibes,
          transport,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        showError(data.error ?? "Failed to generate route");
        return;
      }

      const { route_id } = await res.json();
      router.push(`/hop-route/${route_id}`);
    } catch {
      showError("Something went wrong. Please try again.");
    } finally {
      clearInterval(msgInterval);
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--accent-amber) 15%, transparent)", color: "var(--accent-amber)" }}>
            <Navigation size={20} />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">HopRoute</h1>
        </div>
        <p className="text-[var(--text-secondary)] text-sm ml-12">Your AI-powered brewery crawl planner</p>
      </div>

      {/* Step progress */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: s <= step ? "var(--accent-amber)" : "var(--border)" }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 — Location + Time */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="card-bg-hoproute rounded-2xl p-5 space-y-5"
            style={{ border: "1px solid color-mix(in srgb, var(--accent-amber) 25%, var(--border))" }}
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <MapPin size={18} className="text-[var(--accent-gold)]" /> Where & When
            </h2>

            {/* Location */}
            <div className="space-y-2">
              <button
                onClick={handleGps}
                disabled={gpsLoading}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm border transition-colors"
                style={{ background: locationMode === "gps" ? "color-mix(in srgb, var(--accent-gold) 10%, transparent)" : "var(--surface)", borderColor: locationMode === "gps" ? "color-mix(in srgb, var(--accent-gold) 30%, transparent)" : "var(--border)", color: locationMode === "gps" ? "var(--accent-gold)" : "var(--text-muted)" }}
              >
                {gpsLoading ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                {locationMode === "gps" ? "Using your location" : "Use my location"}
              </button>

              <div className="relative" ref={suggestionsRef}>
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">or</span>
                <input
                  type="text"
                  placeholder="Enter city (e.g. Asheville, NC)"
                  value={locationMode === "city" ? city : ""}
                  onFocus={() => { setLocationMode("city"); if (suggestions.length > 0) setShowSuggestions(true); }}
                  onChange={(e) => { setLocationMode("city"); handleCityChange(e.target.value); }}
                  onKeyDown={handleCityKeyDown}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--accent-gold)] outline-none"
                  autoComplete="off"
                />
                {/* Autocomplete dropdown */}
                <AnimatePresence>
                  {showSuggestions && locationMode === "city" && (suggestions.length > 0 || suggestionsLoading) && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-50 left-0 right-0 mt-1 rounded-xl border overflow-hidden shadow-lg"
                      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                    >
                      {suggestionsLoading && suggestions.length === 0 ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                          <Loader2 size={14} className="animate-spin" /> Searching...
                        </div>
                      ) : (
                        suggestions.map((r, i) => {
                          const label = formatLocationLabel(r);
                          return (
                            <button
                              key={`${r.lat}-${r.lon}`}
                              type="button"
                              onClick={() => selectSuggestion(r)}
                              className="w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2 min-h-[44px]"
                              style={{
                                background: i === highlightIdx ? "rgba(212,168,67,0.1)" : "transparent",
                                color: "var(--text-primary)",
                                borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                              }}
                              onMouseEnter={() => setHighlightIdx(i)}
                            >
                              <MapPin size={13} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
                              <span className="truncate">{label}</span>
                            </button>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Time window */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <Clock size={13} /> Time window
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">Start</p>
                  <input
                    type="datetime-local"
                    value={timeStart}
                    onChange={(e) => setTimeStart(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-gold)] outline-none"
                  />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">End</p>
                  <input
                    type="datetime-local"
                    value={timeEnd}
                    onChange={(e) => setTimeEnd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-gold)] outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!city.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-40"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              Next <ChevronRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Step 2 — Preferences */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="card-bg-hoproute rounded-2xl p-5 space-y-5"
            style={{ border: "1px solid color-mix(in srgb, var(--accent-amber) 25%, var(--border))" }}
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Zap size={18} className="text-[var(--accent-gold)]" /> Your Preferences
            </h2>

            {/* Stop count */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-[var(--text-muted)]">
                Stops: <span className="text-[var(--accent-gold)] font-bold">{stopCount}</span>
              </label>
              <input
                type="range"
                min={2} max={5} value={stopCount}
                onChange={(e) => setStopCount(+e.target.value)}
                className="w-full accent-[var(--accent-gold)]"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] font-mono">
                <span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </div>

            {/* Group size */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                <Users size={13} /> Group size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GROUP_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setGroupSize(opt.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border transition-all"
                    style={
                      groupSize === opt.value
                        ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)", color: "var(--accent-gold)" }
                        : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                    }
                  >
                    <span>{opt.emoji}</span> {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transport */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-[var(--text-muted)]">Getting around</label>
              <div className="flex gap-2">
                {TRANSPORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTransport(opt.value)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm border transition-all"
                    style={
                      transport === opt.value
                        ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)", color: "var(--accent-gold)" }
                        : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-secondary)" }
                    }
                  >
                    <span>{opt.emoji}</span>
                    <span className="hidden sm:inline">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vibe chips */}
            <div className="space-y-2">
              <label className="text-sm font-mono text-[var(--text-muted)]">Vibe (optional)</label>
              <div className="flex flex-wrap gap-2">
                {VIBE_OPTIONS.map((v) => (
                  <button
                    key={v}
                    onClick={() => toggleVibe(v)}
                    className="px-3 py-1.5 rounded-full text-xs font-mono border transition-all"
                    style={
                      vibes.includes(v)
                        ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)", color: "var(--accent-gold)" }
                        : { background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-3 rounded-xl text-sm border transition-colors"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3 — Taste DNA + Generate */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="card-bg-hoproute rounded-2xl p-5 space-y-5"
            style={{ border: "1px solid color-mix(in srgb, var(--accent-amber) 25%, var(--border))" }}
          >
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Beer size={18} className="text-[var(--accent-gold)]" /> Your Taste DNA
            </h2>

            {dna.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-muted)]">Based on your session history. The AI uses this to pick the right beers for each stop.</p>
                {dna.map((entry) => (
                  <div key={entry.style} className="flex items-center gap-3">
                    <span className="text-sm text-[var(--text-secondary)] w-32 truncate">{entry.style}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(entry.avg_rating / 5) * 100}%`, background: "var(--accent-gold)" }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[var(--text-muted)] w-8 text-right">{entry.avg_rating.toFixed(1)}★</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-bg-hoproute p-4 rounded-2xl border text-center" style={{ borderColor: "var(--border)" }}>
                <p className="text-sm text-[var(--text-secondary)]">No taste history yet.</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">We&apos;ll suggest crowd-pleasers for your first HopRoute.</p>
              </div>
            )}

            {/* Summary */}
            <div className="card-bg-hoproute p-4 rounded-2xl border space-y-1.5" style={{ borderColor: "color-mix(in srgb, var(--accent-amber) 25%, var(--border))" }}>
              <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wide">Your Route</p>
              <p className="text-sm text-[var(--text-primary)]">📍 {city}</p>
              <p className="text-sm text-[var(--text-primary)]">🍺 {stopCount} stops · {GROUP_OPTIONS.find(g => g.value === groupSize)?.label}</p>
              <p className="text-sm text-[var(--text-primary)]">{TRANSPORT_OPTIONS.find(t => t.value === transport)?.emoji} {TRANSPORT_OPTIONS.find(t => t.value === transport)?.label}</p>
              {vibes.length > 0 && <p className="text-sm text-[var(--text-primary)]">✨ {vibes.join(", ")}</p>}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                disabled={generating}
                className="px-4 py-3 rounded-xl text-sm border transition-colors disabled:opacity-40"
                style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
              >
                Back
              </button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-70"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{loadingMsg}</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Generate Route
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
