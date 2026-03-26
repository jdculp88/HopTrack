/*
 * ─── HOPTRACK LANDING PAGE — "Gold on Cream" v2 ────────────────────────────
 *
 * Direction: WisprFlow-inspired warm cream canvas with dark floating sections
 * Identity: "Gold on cream, like a perfect pilsner"
 *
 * v2 FIXES:
 *   - Hero fills viewport, larger mockup
 *   - Stats have visible boundary + pour connector
 *   - Dark sections have proper spacing
 *   - Achievement badges visible on cream
 *   - How It Works centered with large step numbers
 *   - Bottom CTA centered for visual variety
 *   - Pour connectors between sections
 *   - Button padding increased for pill shape
 *   - Footer breathes properly
 *   - Consistent CTA label: "Start for free"
 * ──────────────────────────────────────────────────────────────────────────
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Hop, Beer, Star, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

// ─── Colors ────────────────────────────────────────────────────────────────
const C = {
  cream: "#FBF7F0",
  dark: "#0F0E0C",
  darkSurface: "#1C1A16",
  darkBorder: "#3A3628",
  gold: "#D4A843",
  goldDark: "#C49A35",
  green: "#2D5A3D",
  text: "#1A1714",
  textMuted: "#6B5E4E",
  textSubtle: "#9E8E7A",
  border: "#E5DDD0",
  creamText: "#F5F0E8",
  creamMuted: "#A89F8C",
  creamSubtle: "#8B7E6A",
} as const;

const EASE = [0.16, 1, 0.3, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
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

// ─── Pour Connector — gold line between sections ───────────────────────────
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "backdrop-blur-xl border-b" : ""
      }`}
      style={{
        backgroundColor: scrolled ? "rgba(251,247,240,0.92)" : "transparent",
        borderColor: scrolled ? C.border : "transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.gold }}>
            <Hop size={14} style={{ color: C.dark }} />
          </div>
          <span className="font-display text-base font-bold tracking-tight" style={{ color: C.text }}>
            HopTrack
          </span>
        </Link>

        <div className="flex items-center gap-7">
          <Link href="/for-breweries" className="text-sm hover:opacity-70 transition-opacity hidden sm:block font-sans" style={{ color: C.textMuted }}>
            For Breweries
          </Link>
          <Link href="/login" className="text-sm hover:opacity-70 transition-opacity hidden sm:block font-sans" style={{ color: C.textMuted }}>
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold px-5 py-2.5 rounded-full transition-colors font-sans"
            style={{ background: C.dark, color: C.creamText }}
          >
            Get started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Session Mockup ────────────────────────────────────────────────────────
function SessionMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.9, ease: EASE }}
      className="relative w-full max-w-sm shadow-2xl shadow-black/30"
      style={{
        background: C.darkSurface,
        border: `1px solid ${C.darkBorder}`,
        borderRadius: "1.5rem",
        overflow: "hidden",
        rotate: "1deg",
      }}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1" style={{ color: C.gold }}>Session · Live</p>
            <p className="font-display text-lg font-bold leading-tight" style={{ color: C.creamText }}>Pint &amp; Pixel</p>
            <p className="text-[11px] mt-0.5 font-sans" style={{ color: C.creamSubtle }}>1h 23m · 2 beers logged</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-green-500">Active</span>
          </div>
        </div>
      </div>
      <div className="h-px" style={{ background: C.darkBorder }} />
      <div className="px-5 py-4 space-y-3">
        {[
          { name: "Debug IPA", style: "IPA", rating: 5, abv: "6.8%" },
          { name: "Dark Mode Stout", style: "Stout", rating: 4, abv: "7.2%" },
        ].map((beer, i) => (
          <div key={beer.name} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: "#252219", border: `1px solid ${C.darkBorder}` }}>
              {i === 0 ? "🍺" : "🌿"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-sans font-medium leading-tight truncate" style={{ color: C.creamText }}>{beer.name}</p>
              <p className="text-[10px] font-mono" style={{ color: C.creamSubtle }}>{beer.style} · {beer.abv}</p>
            </div>
            <div className="flex gap-px flex-shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-[10px]" style={{ color: s <= beer.rating ? C.gold : C.darkBorder }}>★</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 pt-1">
        <div className="h-px mb-3" style={{ background: C.darkBorder }} />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: C.creamSubtle }}>Hop Head · Lv 8</span>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.4 }} className="text-[10px] font-mono font-semibold" style={{ color: C.gold }}>+240 XP</motion.span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#252219" }}>
          <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${C.gold} 0%, ${C.gold}CC 100%)` }} initial={{ width: "0%" }} animate={{ width: "68%" }} transition={{ delay: 1.1, duration: 1.5, ease: EASE }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tap Wall Mockup ────────────────────────────────────────────────────────
function TapWallMockup() {
  const beers = [
    { name: "Debug IPA", style: "IPA", abv: "6.8%", ibu: 65, logged: true },
    { name: "Dark Mode Stout", style: "Stout", abv: "7.2%", ibu: 45, logged: false },
    { name: "Pixel Perfect Pils", style: "Pilsner", abv: "4.8%", ibu: 28, logged: true },
    { name: "Deploy Friday DIPA", style: "Double IPA", abv: "9.2%", ibu: 88, logged: false },
  ];

  return (
    <div className="relative w-full max-w-md select-none pointer-events-none">
      <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40" style={{ background: "#141210", border: `1px solid ${C.darkBorder}` }}>
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${C.darkBorder}` }}>
          <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: C.creamSubtle }}>Tap Wall</p>
          <p className="font-display text-base font-bold mt-0.5" style={{ color: C.creamText }}>Pint &amp; Pixel — 12 beers on</p>
        </div>
        {beers.map((beer) => (
          <div key={beer.name} className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid rgba(58,54,40,0.6)`, background: beer.logged ? "rgba(212,168,67,0.04)" : "transparent" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-sans font-medium truncate leading-tight" style={{ color: C.creamText }}>{beer.name}</p>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: C.creamSubtle }}>{beer.style} · {beer.abv} ABV · {beer.ibu} IBU</p>
            </div>
            {beer.logged && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: C.gold, border: `1px solid rgba(212,168,67,0.3)` }}>Logged</span>
            )}
          </div>
        ))}
        <div className="px-4 py-3" style={{ borderTop: `1px solid ${C.darkBorder}` }}>
          <p className="text-[10px] font-mono" style={{ color: C.creamSubtle }}>+8 more beers on tap</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function LandingContent() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: C.cream, color: C.text }}>
      <Nav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 60%)` }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20 w-full">
          <div className="grid lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-16 lg:gap-20 items-center">
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8 lg:space-y-10">
              <motion.div variants={reveal}>
                <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: C.gold }}>Track Every Pour</span>
              </motion.div>
              <motion.div variants={reveal} className="space-y-0">
                <h1 className="font-display font-bold leading-[0.88] tracking-tight" style={{ fontSize: "clamp(64px, 9vw, 108px)", color: C.text }}>Check in.</h1>
                <h1 className="font-display font-bold leading-[0.88] tracking-tight italic" style={{ fontSize: "clamp(64px, 9vw, 108px)", color: C.gold }}>Level up.</h1>
              </motion.div>
              <motion.p variants={reveal} className="text-lg leading-relaxed max-w-[380px] font-sans" style={{ color: C.textMuted }}>
                Track your craft beer journey. Discover breweries, log every pour, and earn your way to Grand Cicerone.
              </motion.p>
              <motion.div variants={reveal} className="flex items-center gap-5 flex-wrap">
                <Link href="/signup" className="inline-flex items-center gap-2.5 font-semibold text-sm px-8 py-4 rounded-full transition-colors font-sans" style={{ background: C.dark, color: C.creamText }}>
                  Start for free <ArrowRight size={15} />
                </Link>
                <Link href="/for-breweries" className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70 group font-sans" style={{ color: C.textMuted }}>
                  For Breweries <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </motion.div>
            </motion.div>
            <div className="hidden lg:flex lg:items-center lg:justify-center select-none pointer-events-none">
              <SessionMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider + Pour ───────────────────────────────────────────────── */}
      <div className="section-divider" />
      <PourConnector />

      {/* ── Value props strip (no fake stats) ─────────────────────────── */}
      <ScrollReveal>
        <section className="py-12 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap items-baseline gap-x-10 gap-y-5">
              {[
                { value: "Rate", label: "every pour" },
                { value: "Earn", label: "XP & achievements" },
                { value: "Climb", label: "the leaderboards" },
                { value: "Discover", label: "your next favorite" },
              ].map((stat, i) => (
                <div key={stat.label} className="flex items-baseline gap-3">
                  <span className="font-display font-bold leading-none italic" style={{ fontSize: "clamp(28px, 3.5vw, 44px)", color: C.gold }}>{stat.value}</span>
                  <span className="text-sm font-sans" style={{ color: C.textSubtle }}>{stat.label}</span>
                  {i < 3 && <span className="text-xl hidden md:block select-none" style={{ color: C.border }}>/</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <PourConnector />

      {/* ── Sessions — DARK floating section ──────────────────────────────── */}
      <section className="px-6 lg:px-10 py-10">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto dark-section" style={{ background: C.dark }}>
            <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none z-0" style={{ background: `radial-gradient(circle at 80% 10%, rgba(212,168,67,0.07) 0%, transparent 55%)` }} />
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center p-10 lg:p-16 xl:p-20">
              <div className="space-y-6 lg:pr-8">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: C.gold }}>Sessions</span>
                <h2 className="font-display font-bold leading-[0.95] tracking-tight" style={{ fontSize: "clamp(38px, 4vw, 54px)", color: C.creamText }}>
                  Log beers as<br /><span className="italic" style={{ color: C.creamMuted }}>you drink them.</span>
                </h2>
                <p className="leading-relaxed font-sans text-[15px] max-w-sm" style={{ color: C.creamSubtle }}>
                  Open a session when you arrive. Browse the tap wall, log each pint, leave a rating. End with a full recap — XP earned, beers tried, time spent.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Tap wall", "Quick ratings", "Flavor notes", "XP tracking"].map((f) => (
                    <span key={f} className="text-xs font-sans px-3 py-1.5 rounded-full" style={{ color: C.creamSubtle, border: `1px solid ${C.darkBorder}` }}>{f}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center select-none pointer-events-none">
                <TapWallMockup />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <PourConnector />

      {/* ── Achievements — cream canvas ───────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">
            <ScrollReveal>
              <div className="space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: C.gold }}>Achievements</span>
                <div>
                  <span className="font-display font-bold leading-none block" style={{ fontSize: "clamp(80px, 12vw, 160px)", letterSpacing: "-0.04em", color: C.text }}>35+</span>
                  <div className="w-24 h-0.5 mt-4" style={{ background: C.gold }} />
                </div>
                <p className="font-display font-bold leading-tight" style={{ fontSize: "clamp(22px, 2.5vw, 32px)", color: C.text }}>achievements to unlock.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="space-y-8 pt-2 lg:pt-16">
                <p className="text-lg leading-relaxed font-sans" style={{ color: C.textMuted }}>
                  From Hop Curious to Grand Cicerone. Every check-in, rating, and discovery earns XP. Across 6 categories, 20 levels, and a leaderboard that resets every week.
                </p>
                <div className="space-y-3">
                  {[
                    { icon: "🥇", name: "First Pour", tier: "Bronze", desc: "Log your first beer" },
                    { icon: "🌿", name: "Hop Head", tier: "Silver", desc: "Try 25 unique styles" },
                    { icon: "👑", name: "Grand Cicerone", tier: "Platinum", desc: "Reach level 20" },
                  ].map((badge) => (
                    <div key={badge.name} className="flex items-center gap-4 p-4 rounded-2xl shadow-sm" style={{ background: "#F3EDE3", border: "1px solid #DDD4C4" }}>
                      <div className="text-2xl flex-shrink-0 w-10 text-center">{badge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold font-sans" style={{ color: C.text }}>{badge.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: C.gold }}>{badge.tier}</span>
                        </div>
                        <p className="text-xs font-sans mt-0.5" style={{ color: C.textSubtle }}>{badge.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <PourConnector />

      {/* ── Leaderboards — DARK floating section ──────────────────────────── */}
      <section className="px-6 lg:px-10 py-10">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto dark-section" style={{ background: C.dark }}>
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center p-10 lg:p-16 xl:p-20">
              <div className="rounded-2xl overflow-hidden" style={{ background: C.darkSurface, border: `1px solid ${C.darkBorder}` }}>
                <div className="px-5 py-4" style={{ borderBottom: `1px solid ${C.darkBorder}` }}>
                  <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: C.creamSubtle }}>This Week</p>
                  <p className="font-display font-semibold text-base mt-0.5" style={{ color: C.creamText }}>Most Check-ins</p>
                </div>
                {[
                  { name: "Alex K.", count: 18, rank: 1, you: false },
                  { name: "Jordan M.", count: 15, rank: 2, you: false },
                  { name: "Sam R.", count: 12, rank: 3, you: false },
                  { name: "You", count: 9, rank: 4, you: true },
                ].map((u) => (
                  <div key={u.name} className="flex items-center gap-3.5 px-5 py-3.5" style={{ background: u.you ? "rgba(212,168,67,0.05)" : "transparent", borderBottom: "1px solid rgba(58,54,40,0.5)" }}>
                    <span className="text-sm w-6 flex-shrink-0 font-mono" style={{ color: C.creamSubtle }}>
                      {u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : `#${u.rank}`}
                    </span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: u.you ? "rgba(212,168,67,0.15)" : "#252219", color: u.you ? C.gold : C.creamSubtle }}>{u.name[0]}</div>
                    <span className={`flex-1 text-sm font-sans ${u.you ? "font-semibold" : ""}`} style={{ color: u.you ? C.gold : C.creamText }}>{u.name}</span>
                    <span className="font-mono text-sm font-bold" style={{ color: C.gold }}>{u.count}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <span className="text-[11px] font-mono uppercase tracking-[0.2em]" style={{ color: C.gold }}>Leaderboards</span>
                <h2 className="font-display font-bold leading-[0.95] tracking-tight" style={{ fontSize: "clamp(36px, 4vw, 52px)", color: C.creamText }}>
                  Compete with<br /><span className="italic" style={{ color: C.creamMuted }}>your crew.</span>
                </h2>
                <p className="leading-relaxed font-sans text-[15px]" style={{ color: C.creamSubtle }}>
                  7 leaderboard categories — most check-ins, unique beers, unique breweries, highest average rating, and more. Weekly resets keep it competitive.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <PourConnector />

      {/* ── How it works — CENTERED (breaks the left-aligned pattern) ─────── */}
      <section className="py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="mb-16 text-center">
            <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: C.gold }}>How it works</span>
            <h2 className="font-display font-bold leading-[0.95] tracking-tight mt-3" style={{ fontSize: "clamp(36px, 4.5vw, 56px)", color: C.text }}>
              Three steps to<br /><span className="italic" style={{ color: C.textMuted }}>your next great beer.</span>
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: Beer, step: "01", title: "Check in", desc: "Open a session when you arrive at any brewery. We'll find their tap list." },
              { icon: Star, step: "02", title: "Rate & log", desc: "Log each beer, leave a quick rating, add flavor notes. Build your palate profile." },
              { icon: Trophy, step: "03", title: "Level up", desc: "Earn XP, unlock achievements, climb leaderboards. From Hop Curious to Grand Cicerone." },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 0.1}>
                <div className="text-center space-y-4">
                  <span className="font-display text-4xl font-bold" style={{ color: C.gold }}>{item.step}</span>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.15)" }}>
                    <item.icon size={24} style={{ color: C.gold }} />
                  </div>
                  <h3 className="font-display text-xl font-bold" style={{ color: C.text }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed font-sans max-w-[280px] mx-auto" style={{ color: C.textMuted }}>{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <PourConnector />

      {/* ── For Breweries band — DARK floating section ────────────────────── */}
      <section className="px-6 lg:px-10 py-12">
        <ScrollReveal>
          <Link
            href="/for-breweries"
            className="group block max-w-7xl mx-auto dark-section transition-all duration-300"
            style={{ background: C.dark, border: `1px solid ${C.darkBorder}` }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem]" style={{ background: `radial-gradient(circle at 50% 50%, rgba(212,168,67,0.05) 0%, transparent 60%)` }} />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-10 lg:px-16 py-14 lg:py-16">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] mb-3" style={{ color: C.creamSubtle }}>For Brewery Owners</p>
                <h3 className="font-display font-bold leading-tight" style={{ fontSize: "clamp(32px, 4vw, 48px)", color: C.creamText }}>
                  Your tap list. Your loyalty program.<span className="italic" style={{ color: C.gold }}> One platform.</span>
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 font-sans text-sm font-semibold group-hover:gap-3 transition-all duration-200" style={{ color: C.gold }}>
                Learn more <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        </ScrollReveal>
      </section>

      <PourConnector />

      {/* ── CTA — CENTERED (visual variety) ───────────────────────────────── */}
      <section className="py-28 px-6 lg:px-10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none" style={{ background: `radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 60%)` }} />
        <div className="relative z-10 max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="max-w-2xl mx-auto text-center space-y-8">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em]" style={{ color: C.gold }}>Ready?</span>
              <h2 className="font-display font-bold leading-[0.9] tracking-tight" style={{ fontSize: "clamp(48px, 6vw, 80px)", color: C.text }}>
                Your next great<br /><span className="italic" style={{ color: C.gold }}>beer awaits.</span>
              </h2>
              <p className="text-lg leading-relaxed font-sans" style={{ color: C.textMuted }}>
                Join thousands of craft beer lovers tracking every pour.
              </p>
              <div className="flex items-center gap-5 flex-wrap justify-center">
                <Link href="/signup" className="inline-flex items-center gap-2.5 font-semibold px-8 py-4 rounded-full transition-colors text-base font-sans" style={{ background: C.dark, color: C.creamText }}>
                  Start for free <ArrowRight size={16} />
                </Link>
                <span className="text-xs font-mono" style={{ color: C.textSubtle }}>No credit card required</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-16 px-6 lg:px-10" style={{ background: C.dark, borderRadius: "2rem 2rem 0 0" }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: C.gold }}>
              <Hop size={12} style={{ color: C.dark }} />
            </div>
            <span className="font-display font-bold text-sm" style={{ color: C.creamText }}>HopTrack</span>
            <span className="text-sm select-none" style={{ color: C.darkBorder }}>·</span>
            <span className="text-xs font-mono" style={{ color: C.creamSubtle }}>Track Every Pour</span>
          </div>
          <div className="flex gap-7 text-sm font-sans" style={{ color: C.creamSubtle }}>
            <Link href="/for-breweries" className="hover:text-white transition-colors">For Breweries</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
          <p className="text-xs font-mono" style={{ color: C.creamSubtle }}>© 2026 HopTrack</p>
        </div>
      </footer>
    </div>
  );
}
