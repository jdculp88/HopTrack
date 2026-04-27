"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/dates";
import { ClaimProgressBar, type Step } from "./ClaimProgressBar";
import { ClaimSearchStep, type OpenBrewery, TRIAL_FEATURES } from "./ClaimSearchStep";
import { ClaimVerifyStep } from "./ClaimVerifyStep";
import { ClaimConfirmStep } from "./ClaimConfirmStep";

interface PendingClaim {
  id: string;
  status: string;
  created_at: string;
  brewery: { name: string; city: string; state: string } | null;
}

interface ClaimBreweryClientProps {
  userEmail: string;
  pendingClaim?: PendingClaim | null;
  prefillBreweryName?: string | null;
}

export function ClaimBreweryClient({ userEmail, pendingClaim, prefillBreweryName }: ClaimBreweryClientProps) {
  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState(prefillBreweryName ?? "");
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

  // Not-found fallback form state
  const [showNotFoundForm, setShowNotFoundForm] = useState(false);
  const [nfName, setNfName] = useState("");
  const [nfCity, setNfCity] = useState("");
  const [nfState, setNfState] = useState("");
  const [nfSubmitting, setNfSubmitting] = useState(false);
  const [nfSubmitted, setNfSubmitted] = useState(false);

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

  // Auto-search when pre-filled from StorefrontGate CTA
  const hasAutoSearched = useRef(false);
  useEffect(() => {
    if (prefillBreweryName && !hasAutoSearched.current) {
      hasAutoSearched.current = true;
      handleSearch();
    }
  }, [prefillBreweryName, handleSearch]);

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

  const handleNotFoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNfSubmitting(true);
    try {
      const res = await fetch("/api/brewery-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nfName, city: nfCity, state: nfState }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message ?? "Submission failed");
      }
    } catch (err: any) {
      console.error("[claim] Brewery submission failed:", err.message);
      // Still show success — we don't want to block the user
    }
    setNfSubmitting(false);
    setNfSubmitted(true);
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
              Your claim is under review. We'll confirm you're the owner shortly.
            </p>
          </div>

          <div
            className="rounded-2xl border p-8 text-center space-y-6"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {/* Animated pending indicator */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", border: "2px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)" }}
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
              className="rounded-xl p-4 text-left space-y-3"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 5%, var(--surface))",
                border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <p className="text-sm font-semibold" style={{ color: "var(--accent-gold)" }}>14-day free trial included</p>
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Once approved, you'll get full access to the Tap tier — no payment required for 14 days.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {TRIAL_FEATURES.slice(0, 4).map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <Icon size={12} style={{ color: "var(--accent-gold)" }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Questions? Reach out to{" "}
              <a href="mailto:josh@hoptrack.beer" className="underline" style={{ color: "var(--accent-gold)" }}>
                josh@hoptrack.beer
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
        <div className="text-center mb-6">
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
              "Just a few details to confirm you're the owner."}
            {step === "success" &&
              "Your dashboard is ready. Set up your tap list and start tracking."}
          </p>
        </div>

        {/* Progress indicator */}
        <ClaimProgressBar currentStep={step} />

        <AnimatePresence mode="wait">
          {/* ── Step 1: Search ─────────────────────────────────────────────── */}
          {step === "search" && (
            <ClaimSearchStep
              query={query}
              results={results}
              searching={searching}
              error={error}
              showNotFoundForm={showNotFoundForm}
              nfName={nfName}
              nfCity={nfCity}
              nfState={nfState}
              nfSubmitting={nfSubmitting}
              nfSubmitted={nfSubmitted}
              onQueryChange={setQuery}
              onSearch={handleSearch}
              onKeyDown={handleKeyDown}
              onSelect={handleSelect}
              onShowNotFoundForm={setShowNotFoundForm}
              onNfNameChange={setNfName}
              onNfCityChange={setNfCity}
              onNfStateChange={setNfState}
              onNotFoundSubmit={handleNotFoundSubmit}
            />
          )}

          {/* ── Step 2: Verify + Confirm ────────────────────────────────────── */}
          {step === "claim" && selectedBrewery && (
            <motion.div
              key="claim"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="space-y-4"
            >
              <ClaimVerifyStep brewery={selectedBrewery} />
              <ClaimConfirmStep
                businessEmail={businessEmail}
                role={role}
                notes={notes}
                submitting={submitting}
                error={error}
                onBusinessEmailChange={setBusinessEmail}
                onRoleChange={setRole}
                onNotesChange={setNotes}
                onSubmit={handleSubmit}
                onBack={handleBack}
              />
            </motion.div>
          )}

          {/* ── Step 3: Success ─────────────────────────────────────────────── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <SuccessStep
                claimedBreweryId={claimedBreweryId}
                selectedBrewery={selectedBrewery}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SuccessStep({
  claimedBreweryId,
  selectedBrewery,
}: {
  claimedBreweryId: string | null;
  selectedBrewery: OpenBrewery | null;
}) {
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
    <div
      className="rounded-2xl border p-8 text-center space-y-6"
      style={{ background: "var(--surface)", borderColor: "var(--accent-gold)", boxShadow: "0 0 40px color-mix(in srgb, var(--accent-gold) 10%, transparent)" }}
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

      {/* What's included in your trial */}
      <div
        className="rounded-xl p-5 text-left space-y-4"
        style={{
          background: "color-mix(in srgb, var(--accent-gold) 5%, var(--surface))",
          border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
        }}
      >
        <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--accent-gold)" }}>
          What's included in your 14-day trial
        </p>
        <div className="space-y-3">
          {TRIAL_FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 400, damping: 30 }}
              className="flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
              >
                <Icon size={14} style={{ color: "var(--accent-gold)" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-xs pt-1" style={{ color: "var(--text-muted)" }}>
          No credit card required. Upgrade or cancel anytime.
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
        ].map((label, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-3 py-1.5"
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }}
            >
              {i + 1}
            </span>
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>{label}</span>
          </motion.div>
        ))}
      </div>

      {claimedBreweryId && (
        <Link href={`/brewery-admin/${claimedBreweryId}`}>
          <Button variant="primary" size="lg" fullWidth>
            Explore Your Dashboard
          </Button>
        </Link>
      )}
    </div>
  );
}
