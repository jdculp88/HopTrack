/*
 * ─── HOPTRACK COMING SOON LANDING — Sprint 174 ────────────────────────────
 *
 * Public face of hoptrack.beer until launch. Two audience sections (drinkers
 * + breweries) and a waitlist signup form that doubles as demand-mapping
 * intel for Taylor and Drew.
 *
 * Conventions (mirrors LandingContent.tsx):
 *   - Marketing colors via `C` from lib/landing-colors.ts (NOT CSS vars)
 *   - Local EASE/stagger/reveal/ScrollReveal/PourConnector — no shared imports
 *   - Raw <input>/<select>/<button> elements (NOT themed Button/Input)
 *   - <button> wrapping <motion.span> — NEVER motion.button
 *   - Inline form state (NOT useToast — no ToastProvider on root layout)
 * ──────────────────────────────────────────────────────────────────────────
 */

"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Beer,
  Check,
  MapPin,
  Sparkles,
  Star,
  Trophy,
  Users,
  ClipboardList,
  Heart,
  BarChart3,
  Megaphone,
  Loader2,
} from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";
import { US_STATES } from "@/lib/brewery-utils";
import { C } from "@/lib/landing-colors";
import { useState, type FormEvent, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PourConnector() {
  return (
    <div className="flex justify-center py-4">
      <motion.div
        className="w-px h-16"
        style={{
          background: `linear-gradient(180deg, transparent, ${C.gold}50, transparent)`,
        }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </div>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: "rgba(251,247,240,0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <HopMark variant="horizontal" theme="cream" height={28} />
        </div>
        <a
          href="#waitlist"
          className="text-sm font-semibold px-5 py-2.5 rounded-full transition-opacity hover:opacity-90 font-sans"
          style={{ background: C.dark, color: C.creamText }}
        >
          Join the waitlist
        </a>
      </div>
    </motion.nav>
  );
}

// ─── Feature card primitives (cream + dark variants) ──────────────────────
function FeatureCardCream({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Beer;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-6 lg:p-7 rounded-2xl"
      style={{
        background: "#F3EDE3",
        border: `1px solid ${C.border}`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: "rgba(212,168,67,0.1)",
          border: "1px solid rgba(212,168,67,0.18)",
        }}
      >
        <Icon size={20} style={{ color: C.gold }} />
      </div>
      <h3
        className="font-display text-lg font-bold mb-2"
        style={{ color: C.text }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed font-sans"
        style={{ color: C.textMuted }}
      >
        {desc}
      </p>
    </div>
  );
}

function FeatureCardDark({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Beer;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="p-6 lg:p-7 rounded-2xl"
      style={{
        background: C.darkSurface,
        border: `1px solid ${C.darkBorder}`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: "rgba(212,168,67,0.1)",
          border: "1px solid rgba(212,168,67,0.22)",
        }}
      >
        <Icon size={20} style={{ color: C.gold }} />
      </div>
      <h3
        className="font-display text-lg font-bold mb-2"
        style={{ color: C.creamText }}
      >
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed font-sans"
        style={{ color: C.creamMuted }}
      >
        {desc}
      </p>
    </div>
  );
}

// ─── Waitlist Form ────────────────────────────────────────────────────────
type FormState = {
  name: string;
  email: string;
  city: string;
  state: string;
  audience_type: "user" | "brewery";
  brewery_name: string;
  website: string; // honeypot
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  city: "",
  state: "",
  audience_type: "user",
  brewery_name: "",
  website: "",
};

function WaitlistForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrors({});
    setErrorMessage(null);

    try {
      const res = await fetch("/api/waitlist/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          city: form.city,
          state: form.state,
          audience_type: form.audience_type,
          brewery_name:
            form.audience_type === "brewery" ? form.brewery_name : null,
          website: form.website,
        }),
      });
      const json = await res.json();

      if (res.ok) {
        setStatus("success");
        return;
      }

      const err = json?.error;
      if (err?.field) {
        setErrors({ [err.field]: err.message });
      } else {
        setErrorMessage(err?.message ?? "Something went wrong. Please try again.");
      }
      setStatus("error");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  // ── Success panel ──
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="text-center py-8"
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{
            background: "rgba(212,168,67,0.12)",
            border: `1px solid rgba(212,168,67,0.3)`,
          }}
        >
          <Check size={28} style={{ color: C.gold }} strokeWidth={2.5} />
        </div>
        <h3
          className="font-display text-2xl font-bold mb-2"
          style={{ color: C.text }}
        >
          You're on the list.
        </h3>
        <p
          className="text-sm leading-relaxed font-sans max-w-sm mx-auto"
          style={{ color: C.textMuted }}
        >
          We'll email you the moment HopTrack launches in your city. No spam, no
          newsletter — just one email when we're ready to pour.
        </p>
      </motion.div>
    );
  }

  // ── Form ──
  const inputStyle = {
    background: "#FBF7F0",
    border: `1px solid ${C.border}`,
    color: C.text,
  } as const;

  const labelStyle = {
    color: C.textMuted,
  } as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot — visually hidden, accessible name omitted from labels */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label>
          Don&apos;t fill this in
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </label>
      </div>

      {/* Audience toggle */}
      <div>
        <p
          className="text-[11px] font-mono uppercase tracking-[0.16em] mb-2"
          style={labelStyle}
        >
          I am a
        </p>
        <div
          className="flex p-1 rounded-full"
          style={{ background: "#F3EDE3", border: `1px solid ${C.border}` }}
        >
          {(
            [
              { value: "user", label: "Beer drinker" },
              { value: "brewery", label: "Brewery" },
            ] as const
          ).map((opt) => {
            const active = form.audience_type === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => update("audience_type", opt.value)}
                className="flex-1 text-sm font-sans font-semibold py-2.5 rounded-full transition-all"
                style={{
                  background: active ? C.dark : "transparent",
                  color: active ? C.creamText : C.textMuted,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Name */}
      <div>
        <label
          htmlFor="wl-name"
          className="text-[11px] font-mono uppercase tracking-[0.16em] block mb-1.5"
          style={labelStyle}
        >
          Name
        </label>
        <input
          id="wl-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          maxLength={100}
          className="w-full px-4 py-3 rounded-xl text-sm font-sans outline-none transition-all"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
          onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
        />
        {errors.name && (
          <p className="text-xs mt-1.5 font-sans" style={{ color: "#B5341B" }}>
            {errors.name}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="wl-email"
          className="text-[11px] font-mono uppercase tracking-[0.16em] block mb-1.5"
          style={labelStyle}
        >
          Email
        </label>
        <input
          id="wl-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          maxLength={254}
          className="w-full px-4 py-3 rounded-xl text-sm font-sans outline-none transition-all"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
          onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
        />
        {errors.email && (
          <p className="text-xs mt-1.5 font-sans" style={{ color: "#B5341B" }}>
            {errors.email}
          </p>
        )}
      </div>

      {/* City + State */}
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <div>
          <label
            htmlFor="wl-city"
            className="text-[11px] font-mono uppercase tracking-[0.16em] block mb-1.5"
            style={labelStyle}
          >
            City
          </label>
          <input
            id="wl-city"
            type="text"
            required
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl text-sm font-sans outline-none transition-all"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          />
          {errors.city && (
            <p className="text-xs mt-1.5 font-sans" style={{ color: "#B5341B" }}>
              {errors.city}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="wl-state"
            className="text-[11px] font-mono uppercase tracking-[0.16em] block mb-1.5"
            style={labelStyle}
          >
            State
          </label>
          <select
            id="wl-state"
            required
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm font-sans outline-none transition-all appearance-none cursor-pointer"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
            onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
          >
            <option value="" disabled>
              —
            </option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.value}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-xs mt-1.5 font-sans" style={{ color: "#B5341B" }}>
              {errors.state}
            </p>
          )}
        </div>
      </div>

      {/* Brewery Name (conditional) */}
      <AnimatePresence initial={false}>
        {form.audience_type === "brewery" && (
          <motion.div
            key="brewery-name"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <label
              htmlFor="wl-brewery"
              className="text-[11px] font-mono uppercase tracking-[0.16em] block mb-1.5"
              style={labelStyle}
            >
              Brewery name
            </label>
            <input
              id="wl-brewery"
              type="text"
              value={form.brewery_name}
              onChange={(e) => update("brewery_name", e.target.value)}
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl text-sm font-sans outline-none transition-all"
              style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = C.gold)}
              onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
            />
            {errors.brewery_name && (
              <p
                className="text-xs mt-1.5 font-sans"
                style={{ color: "#B5341B" }}
              >
                {errors.brewery_name}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top-level error */}
      {errorMessage && (
        <div
          className="text-sm font-sans px-4 py-3 rounded-xl"
          style={{
            background: "rgba(181,52,27,0.06)",
            border: "1px solid rgba(181,52,27,0.2)",
            color: "#B5341B",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full font-semibold rounded-full transition-opacity disabled:opacity-60 font-sans"
        style={{ background: C.dark, color: C.creamText, padding: 0 }}
      >
        <motion.span
          whileHover={status === "loading" ? undefined : { scale: 1.02 }}
          whileTap={status === "loading" ? undefined : { scale: 0.98 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex items-center justify-center gap-2 py-4 text-sm"
        >
          {status === "loading" ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Joining…
            </>
          ) : (
            <>
              Join the waitlist
              <ArrowRight size={15} />
            </>
          )}
        </motion.span>
      </button>

      <p
        className="text-[11px] text-center font-sans"
        style={{ color: C.textSubtle }}
      >
        No spam. We'll email once at launch.
      </p>
    </form>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ComingSoonContent() {
  const drinkerFeatures = [
    {
      icon: Beer,
      title: "Check in every pour",
      desc: "Track what you drink, where, and when. Build a real history of your craft beer journey.",
    },
    {
      icon: Star,
      title: "Earn XP, unlock achievements",
      desc: "From Hop Curious to Grand Cicerone — 35+ achievements across 6 categories.",
    },
    {
      icon: Users,
      title: "Find your beer crew",
      desc: "Follow friends, join sessions, share recommendations. Make beer social again.",
    },
    {
      icon: Trophy,
      title: "Weekly leaderboards",
      desc: "Compete on check-ins, unique beers, and styles. Resets every week to keep it fresh.",
    },
  ];

  const breweryFeatures = [
    {
      icon: ClipboardList,
      title: "Live tap list management",
      desc: "Update what's pouring in seconds. Push to your storefront, the consumer feed, and the bar TV.",
    },
    {
      icon: Heart,
      title: "Loyalty that actually works",
      desc: "Stamp cards, mug clubs, brand-wide passports — all digital, all yours. No paper, no lost cards.",
    },
    {
      icon: BarChart3,
      title: "Customer intelligence",
      desc: "Know who's drinking what, who's at risk of churning, and who to win back. Real data, no guesswork.",
    },
    {
      icon: Megaphone,
      title: "Built-in marketing",
      desc: "Promotions, challenges, and a weekly digest your regulars will actually open.",
    },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: C.cream, color: C.text }}
    >
      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-10 pt-28 sm:pt-32 pb-16 w-full text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            <motion.div variants={reveal}>
              <span
                className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em]"
                style={{ color: C.gold }}
              >
                <Sparkles size={11} />
                Track Every Pour · Coming soon
              </span>
            </motion.div>
            <motion.div variants={reveal} className="space-y-0">
              <h1
                className="font-display font-bold leading-[0.9] tracking-tight"
                style={{
                  fontSize: "clamp(48px, 10vw, 120px)",
                  color: C.text,
                }}
              >
                HopTrack is
              </h1>
              <h1
                className="font-display font-bold leading-[0.9] tracking-tight italic"
                style={{
                  fontSize: "clamp(48px, 10vw, 120px)",
                  color: C.gold,
                }}
              >
                pouring soon.
              </h1>
            </motion.div>
            <motion.p
              variants={reveal}
              className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-sans"
              style={{ color: C.textMuted }}
            >
              The social brewery and beer tracking app. For drinkers who want to
              remember every pour. For breweries who want to know every regular.
              Launching soon.
            </motion.p>
            <motion.div
              variants={reveal}
              className="flex items-center justify-center"
            >
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2.5 font-semibold text-sm px-8 py-4 rounded-full transition-opacity hover:opacity-90 font-sans"
                style={{ background: C.dark, color: C.creamText }}
              >
                Join the waitlist <ArrowRight size={15} />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <PourConnector />

      {/* ── For Drinkers — cream canvas ──────────────────────────────────── */}
      <section className="py-16 px-6 lg:px-10">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="mb-12 text-center">
            <span
              className="text-[11px] font-mono uppercase tracking-[0.22em]"
              style={{ color: C.gold }}
            >
              For craft beer drinkers
            </span>
            <h2
              className="font-display font-bold leading-[0.95] tracking-tight mt-3"
              style={{ fontSize: "clamp(32px, 4.5vw, 52px)", color: C.text }}
            >
              Your beer journey,
              <br />
              <span className="italic" style={{ color: C.textMuted }}>
                finally remembered.
              </span>
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-5 lg:gap-6">
            {drinkerFeatures.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 0.08}>
                <FeatureCardCream {...f} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <PourConnector />

      {/* ── For Breweries — DARK floating section ────────────────────────── */}
      <section className="px-6 lg:px-10 py-10">
        <ScrollReveal>
          <div
            className="max-w-7xl mx-auto relative overflow-hidden"
            style={{
              background: C.dark,
              borderRadius: "2rem",
              border: `1px solid ${C.darkBorder}`,
            }}
          >
            <div
              className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none z-0"
              style={{
                background: `radial-gradient(circle at 80% 10%, rgba(212,168,67,0.07) 0%, transparent 55%)`,
              }}
            />
            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <div className="text-center mb-12 max-w-3xl mx-auto">
                <span
                  className="text-[11px] font-mono uppercase tracking-[0.22em]"
                  style={{ color: C.gold }}
                >
                  For brewery owners
                </span>
                <h2
                  className="font-display font-bold leading-[0.95] tracking-tight mt-3"
                  style={{
                    fontSize: "clamp(32px, 4.5vw, 52px)",
                    color: C.creamText,
                  }}
                >
                  Your tap list. Your loyalty.
                  <br />
                  <span className="italic" style={{ color: C.gold }}>
                    One platform.
                  </span>
                </h2>
                <p
                  className="text-base sm:text-lg leading-relaxed font-sans mt-5 max-w-xl mx-auto"
                  style={{ color: C.creamMuted }}
                >
                  Replace paper punch cards and spreadsheets with something your
                  regulars will actually use — and that gives you data you've
                  never had before.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5 lg:gap-6">
                {breweryFeatures.map((f, i) => (
                  <ScrollReveal key={f.title} delay={i * 0.08}>
                    <FeatureCardDark {...f} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <PourConnector />

      {/* ── Waitlist form ────────────────────────────────────────────────── */}
      <section
        id="waitlist"
        className="py-20 px-6 lg:px-10 relative overflow-hidden scroll-mt-20"
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 60%)`,
          }}
        />
        <div className="relative z-10 max-w-md mx-auto">
          <ScrollReveal>
            <div className="text-center mb-8">
              <span
                className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em]"
                style={{ color: C.gold }}
              >
                <MapPin size={11} />
                Tell us where you are
              </span>
              <h2
                className="font-display font-bold leading-tight tracking-tight mt-3"
                style={{ fontSize: "clamp(28px, 3.5vw, 40px)", color: C.text }}
              >
                Join the waitlist.
              </h2>
              <p
                className="text-sm leading-relaxed font-sans mt-4 italic"
                style={{ color: C.textMuted }}
              >
                We're prioritizing the cities with the most demand. The more
                people sign up from your area, the sooner HopTrack pours there.
              </p>
            </div>
            <div
              className="p-7 sm:p-8 rounded-3xl shadow-2xl shadow-black/5"
              style={{
                background: C.cream,
                border: `1px solid ${C.border}`,
              }}
            >
              <WaitlistForm />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="py-14 px-6 lg:px-10 mt-10"
        style={{ background: C.dark, borderRadius: "2rem 2rem 0 0" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <HopMark variant="horizontal" theme="white" height={22} />
            <span className="text-sm select-none" style={{ color: C.darkBorder }}>
              ·
            </span>
            <span className="text-xs font-mono" style={{ color: C.creamSubtle }}>
              Track Every Pour
            </span>
          </div>
          <div
            className="flex gap-7 text-sm font-sans"
            style={{ color: C.creamSubtle }}
          >
            <a
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a href="/terms" className="hover:text-white transition-colors">
              Terms
            </a>
          </div>
          <p className="text-xs font-mono" style={{ color: C.creamSubtle }}>
            © 2026 HopTrack
          </p>
        </div>
      </footer>
    </div>
  );
}
