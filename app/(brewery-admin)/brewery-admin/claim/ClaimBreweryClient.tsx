"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Building2, CheckCircle, ChevronRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/dates";

interface OpenBrewery {
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

interface PendingClaim {
  id: string;
  status: string;
  created_at: string;
  brewery: { name: string; city: string; state: string } | null;
}

interface ClaimBreweryClientProps {
  userEmail: string;
  pendingClaim?: PendingClaim | null;
}

type Step = "search" | "claim" | "success";

export function ClaimBreweryClient({ userEmail, pendingClaim }: ClaimBreweryClientProps) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OpenBrewery[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedBrewery, setSelectedBrewery] = useState<OpenBrewery | null>(null);
  const [claimedBreweryId, setClaimedBreweryId] = useState<string | null>(null);

  // Claim form state
  const [businessEmail, setBusinessEmail] = useState(userEmail);
  const [role, setRole] = useState<"owner" | "manager">("owner");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://api.openbrewerydb.org/v1/breweries?by_name=${encodeURIComponent(trimmed)}&per_page=10`
      );
      if (!res.ok) throw new Error("Search failed");
      const data: OpenBrewery[] = await res.json();
      setResults(data);
    } catch {
      setError("Search failed. Please check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSelect = (brewery: OpenBrewery) => {
    setSelectedBrewery(brewery);
    setStep("claim");
    setError(null);
  };

  const handleBack = () => {
    setSelectedBrewery(null);
    setStep("search");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrewery) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/brewery-claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brewery: selectedBrewery,
          businessEmail,
          role,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setClaimedBreweryId(data.brewery_id);
      setStep("success");
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatBreweryType = (type: string) =>
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // ── Pending claim status view ──────────────────────────────────────────────
  if (pendingClaim && step === "search") {
    const submittedAt = formatDate(pendingClaim.created_at);
    return (
      <div
        className="min-h-screen flex items-start justify-center px-4 py-12"
        style={{ background: "var(--bg)" }}
      >
        <div className="w-full max-w-xl">
          <div className="text-center mb-10">
            <p className="text-xs font-mono uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-gold)" }}>
              HopTrack · Brewery Portal
            </p>
            <h1 className="font-display text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Claim Pending
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Your claim is under review. We'll verify your ownership shortly.
            </p>
          </div>

          <div
            className="rounded-2xl border p-8 text-center space-y-6"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Animated pending indicator */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "rgba(212,168,67,0.1)", border: "2px solid rgba(212,168,67,0.3)" }}
            >
              <span
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ background: "var(--accent-gold)" }}
              />
            </div>

            {/* Brewery name */}
            {pendingClaim.brewery && (
              <div>
                <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                  Claim submitted for
                </p>
                <p className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {pendingClaim.brewery.name}
                </p>
                {(pendingClaim.brewery.city || pendingClaim.brewery.state) && (
                  <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {[pendingClaim.brewery.city, pendingClaim.brewery.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            )}

            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium"
              style={{
                background: "var(--surface-2)",
                color: "var(--accent-gold)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-gold)" }} />
              Pending Verification
            </div>

            <div className="text-left rounded-xl p-4 space-y-2" style={{ background: "var(--surface-2)" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Submitted</span>
                <span style={{ color: "var(--text-secondary)" }}>{submittedAt}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Review time</span>
                <span style={{ color: "var(--text-secondary)" }}>Within 24 hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Notification</span>
                <span style={{ color: "var(--text-secondary)" }}>Via email</span>
              </div>
            </div>

            {/* 14-day free trial badge */}
            <div
              className="flex items-center gap-2 rounded-xl p-3"
              style={{ background: "rgba(61,122,82,0.1)", border: "1px solid rgba(61,122,82,0.2)" }}
            >
              <span className="text-lg">🎉</span>
              <div>
                <p className="text-sm font-medium" style={{ color: "#3D7A52" }}>14-day free trial included</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Once approved, you&rsquo;ll get full access to the Tap tier — no payment required for 14 days.
                </p>
              </div>
            </div>

            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Questions? Reach out to{" "}
              <a href="mailto:support@hoptrack.beer" className="underline" style={{ color: "var(--accent-gold)" }}>
                support@hoptrack.beer
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-start justify-center px-4 py-12"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-xl">

        {/* Logo / brand header */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-mono uppercase tracking-[0.2em] mb-3"
            style={{ color: "var(--accent-gold)" }}
          >
            HopTrack · Brewery Portal
          </p>
          <h1
            className="font-display text-4xl font-bold mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            {step === "search" && "Is This Your Brewery?"}
            {step === "claim" && "Claim Your Brewery"}
            {step === "success" && "You're Live on HopTrack!"}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {step === "search" &&
              "Search for your brewery — we'll have you set up in 2 minutes."}
            {step === "claim" &&
              "Quick verification so we know it's really you."}
            {step === "success" &&
              "Your dashboard is ready. Set up your tap list and start tracking."}
          </p>
        </div>

        {/* ── Step 1: Search ───────────────────────────────────────────────── */}
        {step === "search" && (
          <div
            className="rounded-2xl border p-6"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="flex gap-2 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="e.g. Sierra Nevada, Dogfish Head…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  icon={<Search size={16} />}
                  autoFocus
                />
              </div>
              <Button
                variant="primary"
                onClick={handleSearch}
                loading={searching}
                disabled={!query.trim()}
              >
                Search
              </Button>
            </div>

            {/* Results */}
            {searching && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            )}

            {!searching && results.length === 0 && query && !error && (
              <div className="text-center py-10">
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
            )}

            {error && (
              <p
                className="text-sm text-center py-4"
                style={{ color: "var(--danger)" }}
              >
                {error}
              </p>
            )}

            {!searching && results.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((brewery) => (
                  <button
                    key={brewery.id}
                    onClick={() => handleSelect(brewery)}
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
                ))}
              </div>
            )}

            {!searching && results.length === 0 && !query && (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Start typing your brewery name above to search.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Claim form ───────────────────────────────────────────── */}
        {step === "claim" && selectedBrewery && (
          <div className="space-y-4">
            {/* Selected brewery card */}
            <div
              className="rounded-2xl border p-5"
              style={{ background: "var(--surface)", borderColor: "var(--accent-gold)", boxShadow: "0 0 0 1px var(--accent-gold)" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--surface-2)" }}
                >
                  <Building2 size={18} style={{ color: "var(--accent-gold)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-display font-bold text-lg truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {selectedBrewery.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {[selectedBrewery.city, selectedBrewery.state_province]
                      .filter(Boolean)
                      .join(", ")}
                    {selectedBrewery.brewery_type && (
                      <> · {formatBreweryType(selectedBrewery.brewery_type)}</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Claim form */}
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border p-6 space-y-5"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div>
                <p
                  className="text-xs font-mono uppercase tracking-wider mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  Verification Details
                </p>
                <div className="space-y-4">
                  <Input
                    label="Business Email"
                    type="email"
                    required
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="you@yourbrewery.com"
                    hint="Use an email address associated with the brewery."
                  />

                  {/* Role selector */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="text-sm font-medium font-sans"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Your Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["owner", "manager"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className="py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-150 capitalize"
                          style={
                            role === r
                              ? {
                                  background: "var(--accent-gold)",
                                  color: "var(--bg)",
                                  borderColor: "var(--accent-gold)",
                                }
                              : {
                                  background: "var(--bg)",
                                  color: "var(--text-secondary)",
                                  borderColor: "var(--border)",
                                }
                          }
                        >
                          {r === "owner" ? "Owner" : "Manager"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    label="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us about your role at the brewery…"
                    rows={3}
                    hint="Any additional context that helps us verify your claim faster."
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm" style={{ color: "var(--danger)" }}>
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  icon={<ArrowLeft size={14} />}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={submitting}
                  fullWidth
                >
                  Submit Claim
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 3: Success ──────────────────────────────────────────────── */}
        {step === "success" && (
          <SuccessStep
            claimedBreweryId={claimedBreweryId}
            selectedBrewery={selectedBrewery}
          />
        )}
      </div>
    </div>
  );
}

function SuccessStep({ claimedBreweryId, selectedBrewery }: { claimedBreweryId: string | null; selectedBrewery: OpenBrewery | null }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#D4A843", "#E8841A", "#b7522f", "#4A7C59"] });
      setTimeout(() => {
        confetti({ particleCount: 60, spread: 100, origin: { y: 0.5 }, colors: ["#D4A843", "#E8841A"] });
      }, 300);
    }).catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="rounded-2xl border p-8 text-center space-y-6"
      style={{ background: "var(--surface)", borderColor: "var(--accent-gold)", boxShadow: "0 0 40px rgba(212,168,67,0.1)" }}
    >
      {/* Celebration icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
        style={{ background: "linear-gradient(135deg, var(--accent-gold), var(--accent-amber))" }}
      >
        <Sparkles size={36} style={{ color: "var(--bg)" }} />
      </motion.div>

      <div>
        <h2 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Welcome to HopTrack!
        </h2>
        {selectedBrewery && (
          <p className="font-display text-lg" style={{ color: "var(--accent-gold)" }}>
            {selectedBrewery.name}
          </p>
        )}
      </div>

      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        Your claim is submitted. We'll verify ownership within{" "}
        <strong style={{ color: "var(--text-primary)" }}>24 hours</strong>.
        In the meantime, your dashboard is ready to explore.
      </p>

      {/* 14-day trial */}
      <div
        className="rounded-xl p-4 text-left space-y-2"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 5%, var(--surface))",
          border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
        }}
      >
        <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          Your 14-day free trial starts now
        </p>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Full access to tap list management, loyalty programs, analytics, and The Board TV display.
          No credit card required.
        </p>
      </div>

      {/* Quick start checklist */}
      <div className="text-left space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Get started in 2 minutes
        </p>
        {[
          "Add your beers to the tap list",
          "Generate QR table tents",
          "Launch The Board on your TV",
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
            >
              {i + 1}
            </span>
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>{step}</span>
          </div>
        ))}
      </div>

      {claimedBreweryId && (
        <Link href={`/brewery-admin/${claimedBreweryId}`}>
          <Button variant="primary" size="lg" fullWidth>
            Explore Your Dashboard →
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
