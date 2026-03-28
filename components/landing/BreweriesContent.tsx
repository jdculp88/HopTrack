/*
 * ─── FOR BREWERIES PAGE — "Gold on Cream" v2 ────────────────────────────────
 * Cream canvas, dark floating sections, tap handle pricing.
 * B2B conversion focus: credibility, clarity, no-BS pricing.
 *
 * v2 FIXES:
 *   - Pricing in dark floating section (no invisible white-on-cream cards)
 *   - Tap handle SVG icons on pricing tiers
 *   - Features have breathing room with dividers
 *   - Pour connectors between sections
 *   - Button padding increased
 *   - Footer breathes properly
 * ──────────────────────────────────────────────────────────────────────────
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Check, BarChart2, Gift, List,
  Smartphone, Zap, HeartHandshake, ArrowUpRight,
} from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";
import { useEffect, useState } from "react";

const C = {
  cream: "#FBF7F0",
  dark: "#0F0E0C",
  darkSurface: "#1C1A16",
  darkBorder: "#3A3628",
  gold: "#D4A843",
  goldDark: "#C49A35",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  border: "#E5DDD0",
  creamText: "#F5F0E8",
  creamMuted: "#A89F8C",
  creamSubtle: "#8B7E6A",
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
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
        style={{ background: `linear-gradient(180deg, transparent, ${C.gold}50, transparent)` }}
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </div>
  );
}

// ─── Tap Handle SVG ────────────────────────────────────────────────────────
function TapHandle({ size = "md", filled = false }: { size?: "sm" | "md" | "lg"; filled?: boolean }) {
  const heights = { sm: 40, md: 48, lg: 56 };
  const h = heights[size];
  const color = filled ? C.gold : C.creamSubtle;

  return (
    <svg width={20} height={h} viewBox={`0 0 20 ${h}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-3">
      {/* Knob */}
      <rect x="4" y="0" width="12" height="8" rx="4" fill={filled ? color : "none"} stroke={color} strokeWidth="1.5" />
      {/* Shaft */}
      <rect x="7" y="8" width="6" height={h - 16} rx="1" fill={filled ? color : "none"} stroke={color} strokeWidth="1.5" />
      {/* Base */}
      <rect x="3" y={h - 8} width="14" height="6" rx="2" fill={filled ? color : "none"} stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ─── Nav ───────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-xl border-b" : ""}`}
      style={{ backgroundColor: scrolled ? "rgba(251,247,240,0.92)" : "transparent", borderColor: scrolled ? C.border : "transparent" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <HopMark variant="horizontal" theme="cream" height={28} />
        </Link>
        <div className="flex items-center gap-7">
          <Link href="/" className="text-sm hover:opacity-70 transition-opacity hidden sm:block font-sans" style={{ color: C.textMuted }}>Consumer app</Link>
          <Link href="/login" className="text-sm hover:opacity-70 transition-opacity hidden sm:block font-sans" style={{ color: C.textMuted }}>Sign in</Link>
          <Link href="/brewery-admin/claim" className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors font-sans" style={{ background: C.dark, color: C.creamText }}>Claim your brewery</Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Analytics Mockup ─────────────────────────────────────────────────────
function AnalyticsMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.9, ease: EASE }}
      className="relative select-none pointer-events-none w-80 shadow-2xl shadow-black/30"
      style={{ background: C.darkSurface, border: `1px solid ${C.darkBorder}`, borderRadius: "1.5rem", overflow: "hidden", rotate: "-1deg" }}
    >
      <div className="px-5 pt-5 pb-4">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1" style={{ color: C.gold }}>Pint & Pixel · This Month</p>
        <p className="font-display text-lg font-bold leading-tight" style={{ color: C.creamText }}>Analytics Overview</p>
      </div>
      <div className="h-px" style={{ background: C.darkBorder }} />
      <div className="px-5 py-4 grid grid-cols-2 gap-4">
        {[
          { label: "Check-ins", value: "347", delta: "+18%" },
          { label: "Loyal regulars", value: "89", delta: "+6" },
          { label: "Avg. rating", value: "4.3★", delta: "↑0.2" },
          { label: "Top beer", value: "Debug IPA", delta: "68 logs" },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: C.creamSubtle }}>{s.label}</p>
            <p className="text-base font-display font-bold leading-tight" style={{ color: C.creamText }}>{s.value}</p>
            <p className="text-[10px] font-mono mt-0.5 text-green-500">{s.delta}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5">
        <div className="h-px mb-3" style={{ background: C.darkBorder }} />
        <p className="text-[10px] font-mono uppercase tracking-wider mb-3" style={{ color: C.creamSubtle }}>Busiest nights</p>
        <div className="flex items-end gap-1.5 h-12">
          {[30, 55, 45, 80, 95, 70, 40].map((h, i) => (
            <motion.div key={i} className="flex-1 rounded-sm" style={{ background: h > 70 ? "rgba(212,168,67,0.6)" : "rgba(212,168,67,0.2)" }} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.8 + i * 0.05, duration: 0.6, ease: EASE }} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <span key={i} className="text-[9px] font-mono flex-1 text-center" style={{ color: C.creamSubtle }}>{d}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const TIERS = [
  {
    name: "Tap",
    price: "$49",
    period: "/mo",
    tagline: "Everything you need to get started.",
    cta: "Start free trial",
    ctaHref: "/brewery-admin/claim",
    highlight: false,
    handle: "sm" as const,
    features: ["Live tap list management", "Loyalty stamp card program", "Check-in analytics (30 days)", "Brewery profile on HopTrack", "Up to 2 staff accounts", "Email support"],
  },
  {
    name: "Cask",
    price: "$149",
    period: "/mo",
    tagline: "For growing breweries that want the full picture.",
    cta: "Start free trial",
    ctaHref: "/brewery-admin/claim",
    highlight: true,
    handle: "md" as const,
    features: ["Everything in Tap", "Unlimited staff accounts", "90-day analytics + Pint Rewind", "Promotions & slow-seller alerts", "QR code loyalty redemption", "Priority support", "Brewery API access"],
  },
  {
    name: "Barrel",
    price: "Custom",
    period: "",
    tagline: "Multi-location groups and enterprise accounts.",
    cta: "Talk to us",
    ctaHref: "mailto:sales@hoptrack.beer?subject=Barrel%20Tier%20Inquiry",
    highlight: false,
    handle: "lg" as const,
    features: ["Everything in Cask", "Multi-location dashboard", "Dedicated account manager", "Custom analytics & reporting", "White-label options", "SLA + uptime guarantee"],
  },
];

const FEATURES = [
  { icon: List, title: "Live Tap List", body: "Update from any device. Changes appear instantly on your brewery's HopTrack profile — no more outdated menus or printed sheets." },
  { icon: Gift, title: "Loyalty Without the Paper", body: "Digital stamp cards your customers actually use. Set the reward, define the stamps, and edit any time — no reprinting." },
  { icon: BarChart2, title: "Analytics That Tell a Story", body: "Your busiest nights, top beers, and most loyal regulars. Pint Rewind shows you your month at a glance." },
  { icon: Smartphone, title: "Works on Any Device", body: "Dashboard on desktop, tap list on a tablet behind the bar, check-ins on the customer's phone. Fully synced." },
  { icon: Zap, title: "Set Up in 20 Minutes", body: "Claim your brewery, add your beers, go live. No hardware, no installation, no IT person required." },
  { icon: HeartHandshake, title: "Built With Operators", body: "Designed alongside real brewery owners. If it doesn't work on a busy Friday night, we fix it." },
];

export default function BreweriesContent() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: C.cream, color: C.text }}>
      <Nav />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 60%)` }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-20 w-full">
          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-16 lg:gap-20 items-center">
            <motion.div
              initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
              className="space-y-8 lg:space-y-10"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }}>
                <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: C.gold }}>For Brewery Owners</span>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }}>
                <h1 className="font-display font-bold leading-[0.9] tracking-tight" style={{ fontSize: "clamp(36px, 8vw, 96px)", color: C.text }}>
                  Your regulars<br /><span className="italic" style={{ color: C.gold }}>deserve better</span><br />than a punch card.
                </h1>
              </motion.div>
              <motion.p variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }} className="text-lg leading-relaxed max-w-[400px] font-sans" style={{ color: C.textMuted }}>
                HopTrack replaces paper loyalty cards with a digital program your customers actually use — plus live tap list management and analytics that tell you something real.
              </motion.p>
              <motion.div variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } } }} className="space-y-4">
                <Link href="/brewery-admin/claim" className="inline-flex items-center gap-2.5 font-semibold text-sm px-8 py-4 rounded-full transition-colors font-sans" style={{ background: C.dark, color: C.creamText }}>
                  Claim your brewery free <ArrowRight size={15} />
                </Link>
                <p className="text-xs font-mono" style={{ color: C.textSubtle }}>No credit card required · 14-day free trial</p>
              </motion.div>
            </motion.div>
            <div className="hidden lg:flex lg:items-center lg:justify-center pr-0">
              <AnalyticsMockup />
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />
      <PourConnector />

      {/* ── Proof strip ────────────────────────────────────────────────────── */}
      <ScrollReveal>
        <section className="py-12 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto flex flex-wrap items-baseline gap-x-6 sm:gap-x-10 gap-y-4 sm:gap-y-5">
            {[
              { value: "20 min", label: "average setup time" },
              { value: "$49", label: "starting per month" },
              { value: "Day 1", label: "live analytics" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-baseline gap-3">
                <span className="font-display font-bold leading-none" style={{ fontSize: "clamp(32px, 4vw, 52px)", color: C.text }}>{s.value}</span>
                <span className="text-sm font-sans" style={{ color: C.textSubtle }}>{s.label}</span>
                {i < 2 && <span className="text-xl hidden md:block select-none" style={{ color: C.border }}>/</span>}
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <PourConnector />

      {/* ── Features — DARK floating section (with breathing room) ──────── */}
      <section className="px-6 lg:px-10 py-10">
        <div className="max-w-7xl mx-auto dark-section" style={{ background: C.dark }}>
          <div className="relative z-10 p-6 sm:p-10 lg:p-16 xl:p-20">
            <ScrollReveal className="mb-14">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: C.gold }}>What&apos;s included</span>
              <h2 className="font-display font-bold leading-[0.95] tracking-tight mt-3" style={{ fontSize: "clamp(36px, 4.5vw, 56px)", color: C.creamText }}>
                Everything in one place.<br /><span className="italic" style={{ color: C.creamMuted }}>Nothing you don&apos;t need.</span>
              </h2>
            </ScrollReveal>

            <div className="space-y-6">
              <ScrollReveal>
                <div className="grid lg:grid-cols-2 gap-6">
                  {FEATURES.slice(0, 2).map(({ icon: Icon, title, body }) => (
                    <div key={title} className="rounded-2xl p-8 space-y-4" style={{ background: C.darkSurface, border: `1px solid ${C.darkBorder}` }}>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}>
                        <Icon size={18} style={{ color: C.gold }} />
                      </div>
                      <h3 className="font-display text-xl font-bold" style={{ color: C.creamText }}>{title}</h3>
                      <p className="text-sm leading-relaxed font-sans" style={{ color: C.creamSubtle }}>{body}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {/* Divider */}
              <div className="h-px" style={{ background: C.darkBorder, opacity: 0.5 }} />

              <ScrollReveal>
                <div className="rounded-2xl p-5 sm:p-8 lg:p-12" style={{ background: C.darkSurface, border: `1px solid ${C.darkBorder}` }}>
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div>
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}>
                        <BarChart2 size={18} style={{ color: C.gold }} />
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-3" style={{ color: C.creamText }}>Analytics that tell a story.</h3>
                      <p className="text-sm leading-relaxed font-sans" style={{ color: C.creamSubtle }}>
                        See your busiest nights, top beers, and most loyal regulars. Pint Rewind shows you your month — what moved, who came back, what to brew next.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {["Busiest nights", "Top beers by logs", "Customer retention", "Style trends", "Loyalty redemptions", "30-day + Pint Rewind"].map((f) => (
                        <span key={f} className="text-xs font-sans px-3 py-1.5 rounded-full" style={{ color: C.creamSubtle, border: `1px solid ${C.darkBorder}` }}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Divider */}
              <div className="h-px" style={{ background: C.darkBorder, opacity: 0.5 }} />

              <ScrollReveal>
                <div className="grid sm:grid-cols-3 gap-6">
                  {FEATURES.slice(3).map(({ icon: Icon, title, body }) => (
                    <div key={title} className="rounded-2xl p-8 space-y-3" style={{ background: "rgba(28,26,22,0.6)", border: `1px solid ${C.darkBorder}` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}>
                        <Icon size={16} style={{ color: C.gold }} />
                      </div>
                      <h3 className="font-display text-lg font-bold" style={{ color: C.creamText }}>{title}</h3>
                      <p className="text-sm leading-relaxed font-sans" style={{ color: C.creamSubtle }}>{body}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <PourConnector />

      {/* ── Pricing — DARK floating section with tap handles ─────────────── */}
      <section className="px-6 lg:px-10 py-10" id="pricing">
        <div className="max-w-7xl mx-auto dark-section" style={{ background: C.dark }}>
          <div className="relative z-10 p-6 sm:p-10 lg:p-16 xl:p-20">
            <ScrollReveal className="mb-14">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: C.gold }}>Pricing</span>
              <h2 className="font-display font-bold leading-[0.95] tracking-tight mt-3" style={{ fontSize: "clamp(36px, 4.5vw, 56px)", color: C.creamText }}>
                Simple, honest pricing.<br /><span className="italic" style={{ color: C.creamMuted }}>No hidden fees.</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                {TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className="rounded-3xl p-7 flex flex-col relative overflow-hidden"
                    style={{
                      background: tier.highlight ? `rgba(212,168,67,0.06)` : C.darkSurface,
                      border: `1px solid ${tier.highlight ? "rgba(212,168,67,0.4)" : C.darkBorder}`,
                    }}
                  >
                    {tier.highlight && (
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
                    )}

                    {/* Tap Handle */}
                    <div className="pt-2 pb-1">
                      <TapHandle size={tier.handle} filled={tier.highlight} />
                    </div>

                    {tier.highlight && (
                      <span className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2 text-center" style={{ color: C.gold }}>Most popular</span>
                    )}
                    <h3 className="font-display text-2xl font-bold mb-1 text-center" style={{ color: C.creamText }}>{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2 justify-center">
                      <span className="font-display text-4xl font-bold" style={{ color: tier.highlight ? C.gold : C.creamText }}>{tier.price}</span>
                      {tier.period && <span className="text-sm font-sans" style={{ color: C.creamSubtle }}>{tier.period}</span>}
                    </div>
                    <p className="text-sm mb-7 font-sans leading-relaxed text-center" style={{ color: C.creamSubtle }}>{tier.tagline}</p>
                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm font-sans" style={{ color: C.creamMuted }}>
                          <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: C.gold }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={tier.ctaHref}
                      className="w-full text-center py-3.5 rounded-full font-semibold text-sm transition-all font-sans block"
                      style={tier.highlight ? { background: C.gold, color: C.dark } : { border: `1px solid ${C.darkBorder}`, color: C.creamText }}
                    >
                      {tier.cta}
                    </Link>
                  </div>
                ))}
              </div>
              <p className="text-xs font-mono mt-5 text-center" style={{ color: C.creamSubtle }}>No long-term contracts · Cancel any time</p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <PourConnector />

      {/* ── Final CTA — centered ───────────────────────────────────────────── */}
      <section className="py-28 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none" style={{ background: `radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 60%)` }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <h2 className="font-display font-bold leading-[0.9] tracking-tight" style={{ fontSize: "clamp(40px, 5vw, 64px)", color: C.text }}>
                Ready to pour<br /><span className="italic" style={{ color: C.gold }}>smarter?</span>
              </h2>
              <p className="text-lg leading-relaxed font-sans" style={{ color: C.textMuted }}>
                Join the breweries replacing punch cards and guesswork with HopTrack. First 14 days free.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-center">
                <Link href="/brewery-admin/claim" className="inline-flex items-center gap-2.5 font-semibold px-8 py-4 rounded-full transition-colors text-sm font-sans w-fit mx-auto sm:mx-0" style={{ background: C.dark, color: C.creamText }}>
                  Claim your brewery free <ArrowRight size={15} />
                </Link>
                <a href="mailto:sales@hoptrack.beer" className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70 group font-sans justify-center" style={{ color: C.textMuted }}>
                  Talk to sales <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-16 px-6 lg:px-10" style={{ background: C.dark, borderRadius: "2rem 2rem 0 0" }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <HopMark variant="horizontal" theme="white" height={22} />
            <span className="text-sm select-none" style={{ color: C.darkBorder }}>·</span>
            <span className="text-xs font-mono" style={{ color: C.creamSubtle }}>Track Every Pour</span>
          </div>
          <div className="flex gap-7 text-sm font-sans" style={{ color: C.creamSubtle }}>
            <Link href="/" className="hover:text-white transition-colors">Consumer app</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <a href="mailto:sales@hoptrack.beer" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs font-mono" style={{ color: C.creamSubtle }}>© 2026 HopTrack</p>
        </div>
      </footer>
    </div>
  );
}
