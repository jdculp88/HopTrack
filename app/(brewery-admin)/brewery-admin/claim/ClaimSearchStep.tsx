"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Building2, ChevronRight, Sparkles, PlusCircle, Beer, BarChart3, Heart, QrCode, Tv } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export interface OpenBrewery {
  id: string;
  name: string;
  brewery_type: string;
  city: string;
  state_province: string;
  country: string;
  address_1: string | null;
  website_url: string | null;
  phone: string | null;
  latitude: string | null;
  longitude: string | null;
}

export const TRIAL_FEATURES = [
  { icon: Beer, label: "Tap List Management", desc: "Add, edit, and 86 beers in real time" },
  { icon: BarChart3, label: "Analytics Dashboard", desc: "Session data, top beers, peak times" },
  { icon: Heart, label: "Loyalty Programs", desc: "Digital stamp cards and rewards" },
  { icon: QrCode, label: "QR Table Tents", desc: "Branded QR codes that link to your page" },
  { icon: Tv, label: "The Board TV Display", desc: "Beautiful tap menu on any screen" },
];

function formatBreweryType(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ClaimSearchStepProps {
  query: string;
  results: OpenBrewery[];
  searching: boolean;
  error: string | null;
  showNotFoundForm: boolean;
  nfName: string;
  nfCity: string;
  nfState: string;
  nfSubmitting: boolean;
  nfSubmitted: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect: (brewery: OpenBrewery) => void;
  onShowNotFoundForm: (show: boolean) => void;
  onNfNameChange: (value: string) => void;
  onNfCityChange: (value: string) => void;
  onNfStateChange: (value: string) => void;
  onNotFoundSubmit: (e: React.FormEvent) => void;
}

export function ClaimSearchStep({
  query,
  results,
  searching,
  error,
  showNotFoundForm,
  nfName,
  nfCity,
  nfState,
  nfSubmitting,
  nfSubmitted,
  onQueryChange,
  onSearch,
  onKeyDown,
  onSelect,
  onShowNotFoundForm,
  onNfNameChange,
  onNfCityChange,
  onNfStateChange,
  onNotFoundSubmit,
}: ClaimSearchStepProps) {
  return (
    <motion.div
      key="search"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div
        className="rounded-2xl border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex gap-2 mb-6">
          <div className="flex-1">
            <Input
              placeholder="e.g. Sierra Nevada, Dogfish Head..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={onKeyDown}
              icon={<Search size={16} />}
              autoFocus
            />
          </div>
          <Button
            variant="primary"
            onClick={onSearch}
            loading={searching}
            disabled={!query.trim()}
          >
            Search
          </Button>
        </div>

        {/* Skeleton loading */}
        {searching && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        )}

        {/* No results */}
        {!searching && results.length === 0 && query && !error && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <Building2
                size={36}
                className="mx-auto mb-3"
                style={{ color: "var(--text-muted)" }}
              />
              <p className="font-display text-base" style={{ color: "var(--text-primary)" }}>
                No breweries found
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                Try a shorter name or check the spelling.
              </p>
            </div>

            {/* Not-found fallback card */}
            <div
              className="rounded-xl border p-5"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 3%, var(--surface))",
                borderColor: "color-mix(in srgb, var(--accent-gold) 20%, transparent)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <PlusCircle size={15} style={{ color: "var(--accent-gold)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Can't find your brewery?
                </p>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                Not every brewery is in our database yet. Submit yours and we'll add it within 24 hours.
              </p>

              <AnimatePresence mode="wait">
                {nfSubmitted ? (
                  <motion.p
                    key="thanks"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    Submitted! We'll review and add your brewery within 24 hours. You'll receive an email when your listing is ready to claim.
                  </motion.p>
                ) : !showNotFoundForm ? (
                  <motion.div key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button
                      onClick={() => onShowNotFoundForm(true)}
                      className="text-xs font-semibold underline underline-offset-2"
                      style={{ color: "var(--accent-gold)" }}
                    >
                      Submit your brewery →
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    onSubmit={onNotFoundSubmit}
                    className="space-y-3"
                  >
                    <Input
                      label="Brewery Name"
                      required
                      value={nfName}
                      onChange={(e) => onNfNameChange(e.target.value)}
                      placeholder="e.g. Hoppy Trails Brewing"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="City"
                        required
                        value={nfCity}
                        onChange={(e) => onNfCityChange(e.target.value)}
                        placeholder="Asheville"
                      />
                      <Input
                        label="State"
                        required
                        value={nfState}
                        onChange={(e) => onNfStateChange(e.target.value)}
                        placeholder="NC"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onShowNotFoundForm(false)}
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Cancel
                      </button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={nfSubmitting}
                        disabled={!nfName.trim() || !nfCity.trim() || !nfState.trim()}
                      >
                        Submit
                      </Button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <p
            className="text-sm text-center py-4"
            style={{ color: "var(--danger)" }}
          >
            {error}
          </p>
        )}

        {/* Results list */}
        {!searching && results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((brewery, i) => (
              <motion.div
                key={brewery.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 30 }}
              >
                <button
                  onClick={() => onSelect(brewery)}
                  className="w-full text-left rounded-xl border p-4 transition-all duration-150 group"
                  style={{
                    background: "var(--bg)",
                    borderColor: "var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-gold)";
                    (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg)";
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-display font-semibold text-base truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {brewery.name}
                      </p>
                      <div
                        className="flex items-center gap-1.5 mt-1 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <MapPin size={11} />
                        <span>
                          {[brewery.city, brewery.state_province]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                        {brewery.brewery_type && (
                          <>
                            <span style={{ color: "var(--text-muted)" }}>·</span>
                            <span
                              className="capitalize px-1.5 py-0.5 rounded-md text-[10px] font-mono"
                              style={{
                                background: "var(--surface)",
                                color: "var(--accent-gold)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              {formatBreweryType(brewery.brewery_type)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="flex-shrink-0 mt-1 opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{ color: "var(--accent-gold)" }}
                    />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty prompt */}
        {!searching && results.length === 0 && !query && (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Start typing your brewery name above to search.
            </p>
          </div>
        )}
      </div>

      {/* Trial teaser below search */}
      <div
        className="mt-4 rounded-2xl border p-5"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 3%, var(--surface))",
          borderColor: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} style={{ color: "var(--accent-gold)" }} />
          <p className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: "var(--accent-gold)" }}>
            14-day free trial — no credit card
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {TRIAL_FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
              >
                <Icon size={13} style={{ color: "var(--accent-gold)" }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-[10px] leading-tight mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
