"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Search, MapPin, Loader2, Camera, Users } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { FullScreenDrawer } from "@/components/ui/Modal";
import { StarRating } from "@/components/ui/StarRating";
import { FlavorTagPicker } from "@/components/checkin/FlavorTagPicker";
import { ServingStylePicker } from "@/components/checkin/ServingStylePicker";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { AchievementUnlock } from "@/components/achievements/AchievementBadge";
import { searchBreweries, getBreweriesByLocation, mapOpenBreweryToDb } from "@/lib/openbrewerydb";
import { generateGradientFromString, formatABV } from "@/lib/utils";
import { useCheckin } from "@/hooks/useCheckin";
import type { AchievementDef } from "@/lib/achievements/definitions";
import type { Brewery, Beer, FlavorTag, ServingStyle } from "@/types/database";

type Step = 1 | 2 | 3 | 4 | 5;

interface CheckinState {
  brewery: Brewery | null;
  beers: Beer[];
  rating: number;
  comment: string;
  flavorTags: FlavorTag[];
  servingStyle: ServingStyle | null;
  photoUrl: string | null;
  taggedFriends: string[];
  shareToFeed: boolean;
}

interface CheckinModalProps {
  open: boolean;
  onClose: () => void;
}

export function CheckinModal({ open, onClose }: CheckinModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<CheckinState>({
    brewery: null,
    beers: [],
    rating: 0,
    comment: "",
    flavorTags: [],
    servingStyle: "draft",
    photoUrl: null,
    taggedFriends: [],
    shareToFeed: true,
  });
  const { submitCheckin, loading } = useCheckin();
  const [success, setSuccess] = useState(false);
  const [newAchievements, setNewAchievements] = useState<AchievementDef[]>([]);
  const [autoDetected, setAutoDetected] = useState<Brewery | null>(null);
  const [nearbyBreweries, setNearbyBreweries] = useState<Brewery[]>([]);
  const [locationError, setLocationError] = useState(false);;

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setState({
        brewery: null, beers: [], rating: 0, comment: "",
        flavorTags: [], servingStyle: "draft", photoUrl: null,
        taggedFriends: [], shareToFeed: true,
      });
      setSuccess(false);
      setNewAchievements([]);
      detectNearbyBreweries();
    }
  }, [open]);

  async function detectNearbyBreweries() {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const results = await getBreweriesByLocation(latitude, longitude, 5);
        const mapped = results.map((r) => ({ ...mapOpenBreweryToDb(r), id: r.id, created_at: new Date().toISOString() } as Brewery));
        setNearbyBreweries(mapped);
        if (mapped.length === 1) {
          setAutoDetected(mapped[0]);
        }
      },
      () => {
        setLocationError(true);
      }
    );
  }

  function goBack() {
    if (step > 1) setStep((s) => (s - 1) as Step);
  }

  function selectBrewery(brewery: Brewery) {
    setState((s) => ({ ...s, brewery }));
    setStep(2);
  }

  function toggleBeer(beer: Beer) {
    setState((s) => {
      const exists = s.beers.some((b) => b.id === beer.id);
      return {
        ...s,
        beers: exists ? s.beers.filter((b) => b.id !== beer.id) : [...s.beers, beer],
      };
    });
  }

  async function submit() {
    if (!state.brewery) return;
    const result = await submitCheckin({
      brewery_id: state.brewery.id,
      beer_id: state.beers[0]?.id,
      rating: state.rating || undefined,
      comment: state.comment.trim() || undefined,
      flavor_tags: state.flavorTags.length ? state.flavorTags : undefined,
      serving_style: state.servingStyle ?? undefined,
      photo_url: state.photoUrl ?? undefined,
      checked_in_with: state.taggedFriends.length ? state.taggedFriends : undefined,
      share_to_feed: state.shareToFeed,
    });
    if (result) {
      setSuccess(true);
      setNewAchievements(result.newAchievements ?? []);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#D4A843", "#E8841A", "var(--text-primary)"] });
      setStep(5);
    }
  }

  const totalSteps = 5;

  return (
    <FullScreenDrawer open={open} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
        <button
          onClick={step === 1 ? onClose : goBack}
          className="p-2 -ml-2 rounded-xl hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {step === 1 ? <X size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSteps - 1 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i < step - 1 ? "w-6 bg-[#D4A843]" : i === step - 1 ? "w-6 bg-[#D4A843]/60" : "w-3 bg-[#3A3628]"
              )}
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepBrewery
              key="step1"
              nearby={nearbyBreweries}
              autoDetected={autoDetected}
              locationError={locationError}
              onSelect={selectBrewery}
              onDismissAuto={() => setAutoDetected(null)}
            />
          )}
          {step === 2 && state.brewery && (
            <StepBeer
              key="step2"
              brewery={state.brewery}
              selectedBeers={state.beers}
              onToggle={toggleBeer}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepReview
              key="step3"
              state={state}
              onChange={(updates) => setState((s) => ({ ...s, ...updates }))}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <StepShare
              key="step4"
              state={state}
              onChange={(updates) => setState((s) => ({ ...s, ...updates }))}
              onSubmit={submit}
              loading={loading}
            />
          )}
          {step === 5 && (
            <StepCelebrate
              key="step5"
              state={state}
              achievements={newAchievements}
              onClose={() => {
                onClose();
                if (state.beers[0]?.id) {
                  router.push(`/beer/${state.beers[0].id}`);
                } else if (state.brewery?.id) {
                  router.push(`/brewery/${state.brewery.id}`);
                } else {
                  router.push("/home");
                }
              }}
              onLogAnother={() => {
                setState({ brewery: null, beers: [], rating: 0, comment: "", flavorTags: [], servingStyle: "draft", photoUrl: null, taggedFriends: [], shareToFeed: true });
                setStep(1);
                setSuccess(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </FullScreenDrawer>
  );
}

// ─── Step 1: Select Brewery ───────────────────────────────────────────────────
function StepBrewery({
  nearby,
  autoDetected,
  locationError,
  onSelect,
  onDismissAuto,
}: {
  nearby: Brewery[];
  autoDetected: Brewery | null;
  locationError: boolean;
  onSelect: (b: Brewery) => void;
  onDismissAuto: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Brewery[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const raw = await searchBreweries(query);
      setResults(raw.map((r) => ({ ...mapOpenBreweryToDb(r), id: r.id, created_at: new Date().toISOString() } as Brewery)));
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const displayList = query.trim() ? results : nearby;

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-5 space-y-5"
    >
      <div>
        <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">Where are you?</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Find or search for a brewery.</p>
      </div>

      {/* Location error banner */}
      {locationError && (
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-3 flex items-center gap-2.5">
          <MapPin size={14} className="text-[var(--text-muted)] flex-shrink-0" />
          <p className="text-sm text-[var(--text-secondary)]">
            Location unavailable — search for your brewery above.
          </p>
        </div>
      )}

      {/* Auto-detected banner */}
      <AnimatePresence>
        {autoDetected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#3D7A52]/10 border border-[#3D7A52]/30 rounded-2xl p-4 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#3D7A52]" />
              <div>
                <p className="text-xs text-[#3D7A52] font-mono uppercase tracking-wide">Auto-detected</p>
                <p className="font-display font-semibold text-[var(--text-primary)]">{autoDetected.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onSelect(autoDetected)} className="bg-[#3D7A52] text-white text-sm px-3 py-1.5 rounded-xl font-medium">
                Yes!
              </button>
              <button onClick={onDismissAuto} className="text-[var(--text-muted)] text-sm px-2 py-1.5 rounded-xl hover:text-[var(--text-primary)]">
                No
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search breweries..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#D4A843] transition-colors"
        />
      </div>

      {/* Results */}
      <div className="space-y-2">
        {!query.trim() && nearby.length > 0 && (
          <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">Nearby</p>
        )}
        {displayList.map((brewery) => (
          <motion.button
            key={brewery.id}
            type="button"
            onClick={() => onSelect(brewery)}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-4 p-4 bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[#D4A843]/30 rounded-2xl transition-all text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex-shrink-0"
              style={{ background: generateGradientFromString(brewery.name) }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-[var(--text-primary)] truncate">{brewery.name}</p>
              <p className="text-sm text-[var(--text-muted)] truncate">
                {brewery.city}{brewery.state ? `, ${brewery.state}` : ""}
                {brewery.brewery_type && ` · ${brewery.brewery_type}`}
              </p>
            </div>
            <ChevronLeft size={16} className="text-[#3A3628] rotate-180 flex-shrink-0" />
          </motion.button>
        ))}
        {query.trim() && results.length === 0 && !searching && (
          <p className="text-center text-[var(--text-muted)] py-8 text-sm">
            No breweries found. <br/>
            <button className="text-[#D4A843] mt-1 hover:underline">Add a new brewery →</button>
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Step 2: Select Beer ──────────────────────────────────────────────────────
function StepBeer({
  brewery,
  selectedBeers,
  onToggle,
  onNext,
}: {
  brewery: Brewery;
  selectedBeers: Beer[];
  onToggle: (b: Beer) => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  const [beers, setBeers] = useState<Beer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/beers?brewery_id=${brewery.id}`)
      .then((r) => r.json())
      .then((d) => setBeers((d.beers as Beer[]) ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brewery.id]);

  const filtered = query
    ? beers.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : beers;

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-5 space-y-5"
    >
      <div>
        <p className="text-[#D4A843] text-sm font-mono uppercase tracking-wide">{brewery.name}</p>
        <h2 className="font-display text-3xl font-bold text-[var(--text-primary)] mt-1">What did you have?</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Select one or more beers.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search beers..."
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl pl-11 pr-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#D4A843] transition-colors text-sm"
        />
      </div>

      {beers.length === 0 && !loading ? (
        <div className="text-center py-12 space-y-3">
          <p className="text-5xl">🍺</p>
          <p className="font-display text-xl text-[var(--text-primary)]">No beers listed yet</p>
          <p className="text-sm text-[var(--text-secondary)]">Be the first to add a beer here!</p>
          <button className="mt-2 text-[#D4A843] text-sm hover:underline">+ Add a beer</button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((beer) => {
            const isSelected = selectedBeers.some((b) => b.id === beer.id);
            return (
              <motion.button
                key={beer.id}
                type="button"
                onClick={() => onToggle(beer)}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                  isSelected
                    ? "bg-[#D4A843]/10 border-[#D4A843]/40"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[#6B6456]"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center",
                    isSelected ? "bg-[#D4A843]" : "bg-[var(--surface-2)]"
                  )}
                >
                  {isSelected ? <span className="text-[#0F0E0C] font-bold text-sm">✓</span> : <span className="text-lg">🍺</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-display font-medium truncate", isSelected ? "text-[#D4A843]" : "text-[var(--text-primary)]")}>
                    {beer.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <BeerStyleBadge style={beer.style} size="xs" />
                    <span className="text-xs font-mono text-[var(--text-muted)]">{formatABV(beer.abv)}</span>
                  </div>
                </div>
                {beer.avg_rating && (
                  <span className="text-sm font-mono text-[#D4A843] flex-shrink-0">★ {beer.avg_rating.toFixed(1)}</span>
                )}
              </motion.button>
            );
          })}
          <button className="w-full py-3 text-[#D4A843] text-sm hover:underline">+ I had something not listed</button>
        </div>
      )}

      {/* Continue */}
      {(selectedBeers.length > 0 || beers.length === 0) && (
        <div className="sticky bottom-0 bg-[var(--bg)]/90 backdrop-blur-sm pt-3 pb-2">
          <button
            onClick={onNext}
            className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-semibold py-4 rounded-2xl transition-all active:scale-98"
          >
            {selectedBeers.length > 0 ? `Continue with ${selectedBeers.length} beer${selectedBeers.length > 1 ? "s" : ""}` : "Skip (log brewery visit only)"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── Step 3: Rate & Review ────────────────────────────────────────────────────
function StepReview({
  state,
  onChange,
  onNext,
}: {
  state: CheckinState;
  onChange: (updates: Partial<CheckinState>) => void;
  onNext: () => void;
}) {
  const beerName = state.beers[0]?.name ?? "your drink";

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-5 space-y-6"
    >
      <div>
        <p className="text-[#D4A843] text-sm font-mono uppercase tracking-wide">{state.brewery?.name}</p>
        <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] mt-1">
          How was <span className="italic">{beerName}</span>?
        </h2>
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)] font-sans">Your rating</p>
        <StarRating value={state.rating} onChange={(r) => onChange({ rating: r })} size="xl" />
        {state.rating > 0 && (
          <p className="text-sm text-[var(--text-secondary)]">
            {["", "Disappointing 😕", "Not great 🤔", "Pretty good 😊", "Really good! 😄", "Outstanding! 🤩"][Math.round(state.rating)]}
          </p>
        )}
      </div>

      {/* Flavor Tags */}
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)] font-sans">Flavor notes <span className="text-[var(--text-muted)]">(optional)</span></p>
        <FlavorTagPicker selected={state.flavorTags} onChange={(tags) => onChange({ flavorTags: tags })} />
      </div>

      {/* Serving Style */}
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)] font-sans">How was it served?</p>
        <ServingStylePicker value={state.servingStyle} onChange={(s) => onChange({ servingStyle: s })} />
      </div>

      {/* Comment */}
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)] font-sans">Leave a note <span className="text-[var(--text-muted)]">(optional)</span></p>
        <textarea
          value={state.comment}
          onChange={(e) => onChange({ comment: e.target.value })}
          placeholder="Great with the nachos, perfect for a summer afternoon..."
          rows={3}
          className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm resize-none focus:outline-none focus:border-[#D4A843] transition-colors"
        />
      </div>

      {/* Photo — coming soon */}
      <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
        <Camera size={16} />
        <span>Add a photo</span>
        <span
          className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wide"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}
        >
          Coming soon
        </span>
      </div>

      <div className="sticky bottom-0 bg-[var(--bg)]/90 backdrop-blur-sm pt-3 pb-2">
        <button
          onClick={onNext}
          className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-semibold py-4 rounded-2xl transition-all active:scale-98"
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Tag Friends & Share ──────────────────────────────────────────────
function StepShare({
  state,
  onChange,
  onSubmit,
  loading,
}: {
  state: CheckinState;
  onChange: (updates: Partial<CheckinState>) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-5 space-y-6"
    >
      <div>
        <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">Almost there!</h2>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Tag friends and confirm your check-in.</p>
      </div>

      {/* Summary Card */}
      <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <div>
            <p className="font-display font-semibold text-[var(--text-primary)]">{state.brewery?.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{state.brewery?.city}, {state.brewery?.state}</p>
          </div>
        </div>
        {state.beers.length > 0 && (
          <div className="flex items-center gap-2 pl-9">
            <span className="text-lg">🍺</span>
            <p className="text-sm text-[var(--text-secondary)]">{state.beers.map(b => b.name).join(", ")}</p>
          </div>
        )}
        {state.rating > 0 && (
          <div className="pl-9">
            <StarRating value={state.rating} readonly size="sm" />
          </div>
        )}
        {state.comment && (
          <p className="text-sm text-[var(--text-secondary)] italic pl-9 line-clamp-2">"{state.comment}"</p>
        )}
      </div>

      {/* Who were you with — coming soon */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)] font-sans">Who were you with?</p>
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wide"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            Coming soon
          </span>
        </div>
        <p className="text-xs pl-5" style={{ color: "var(--text-muted)" }}>
          Tag friends you were drinking with — on the way in a future update.
        </p>
      </div>

      {/* Share toggle */}
      <div className="flex items-center justify-between py-2">
        <div>
          <p className="text-sm font-sans font-medium text-[var(--text-primary)]">Share to feed</p>
          <p className="text-xs text-[var(--text-muted)]">Let friends see your check-in</p>
        </div>
        <button
          onClick={() => onChange({ shareToFeed: !state.shareToFeed })}
          className={cn(
            "w-12 h-6 rounded-full transition-all duration-200 relative",
            state.shareToFeed ? "bg-[#D4A843]" : "bg-[#3A3628]"
          )}
        >
          <div
            className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200",
              state.shareToFeed ? "left-6" : "left-0.5"
            )}
          />
        </button>
      </div>

      <div className="sticky bottom-0 bg-[var(--bg)]/90 backdrop-blur-sm pt-3 pb-2">
        <button
          onClick={onSubmit}
          disabled={loading}
          className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-semibold py-4 rounded-2xl transition-all active:scale-98 disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" /> Logging...</> : "🍺 Log Check-In"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Step 5: Celebrate ────────────────────────────────────────────────────────
function StepCelebrate({
  state,
  achievements,
  onClose,
  onLogAnother,
}: {
  state: CheckinState;
  achievements: AchievementDef[];
  onClose: () => void;
  onLogAnother: () => void;
}) {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="p-5 flex flex-col items-center text-center space-y-6 min-h-full justify-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
        className="w-24 h-24 rounded-full bg-[#D4A843]/20 border-2 border-[#D4A843] flex items-center justify-center"
      >
        <span className="text-5xl">🍺</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="text-[#D4A843] font-mono uppercase tracking-wider text-sm mb-2">Check-in logged!</p>
        <h2 className="font-display text-3xl font-bold text-[var(--text-primary)]">Cheers! 🥂</h2>
        <p className="text-[var(--text-secondary)] mt-2">
          {state.brewery?.name && `At ${state.brewery.name}`}
          {state.beers[0] && ` — ${state.beers[0].name}`}
        </p>
      </motion.div>

      {/* New achievements */}
      {achievements.length > 0 && (
        <div className="w-full space-y-3">
          {achievements.map((a, i) => (
            <AchievementUnlock key={a.key} achievement={a as any} xpGained={a.xp_reward} />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 w-full pt-4">
        <button
          onClick={onClose}
          className="w-full bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-semibold py-4 rounded-2xl transition-all"
        >
          Back to Feed
        </button>
        <button
          onClick={onLogAnother}
          className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] py-3.5 rounded-2xl transition-all hover:bg-[var(--surface-2)] text-sm font-medium"
        >
          Log Another Beer
        </button>
      </div>
    </motion.div>
  );
}
