import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Hop, ArrowRight, MapPin, Trophy, Users, Star } from "lucide-react";
import { StatBlock } from "@/components/ui/StatBlock";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/home");
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      {/* ── Navigation ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D4A843] flex items-center justify-center">
            <Hop size={18} className="text-[#0F0E0C]" />
          </div>
          <span className="font-display text-xl font-bold">HopTrack</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-semibold text-sm px-4 py-2 rounded-xl transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 overflow-hidden grain-overlay">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-radial-gradient from-[#1C1A16] via-[#0F0E0C] to-[#0F0E0C]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4A843]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4A843]/30 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/20 text-[#D4A843] text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] animate-pulse" />
            Social Beer Tracking
          </div>

          {/* Headline */}
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-bold leading-none tracking-tight mb-6">
            Every beer
            <br />
            <span className="italic text-[#D4A843]">tells a story.</span>
          </h1>

          <p className="text-[var(--text-secondary)] text-lg sm:text-xl max-w-xl mx-auto leading-relaxed mb-10">
            Track your craft beer journey. Discover breweries, rate every pour,
            compete with friends, and earn your way to Grand Cicerone.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold px-8 py-4 rounded-2xl transition-all text-base shadow-lg shadow-[#D4A843]/20 hover:shadow-[#D4A843]/30 active:scale-95"
            >
              Start Tracking
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm transition-colors">
              See how it works
              <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
          <div className="w-5 h-8 border border-[var(--border)] rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-[#6B6456] rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <StatBlock value={12000} label="Beers Logged" suffix="+" size="md" />
          <StatBlock value={2800} label="Breweries" suffix="+" size="md" />
          <StatBlock value={5400} label="Check-ins This Week" size="md" />
          <StatBlock value={847} label="Active Members" size="md" />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-32">

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-[#D4A843] text-sm font-mono uppercase tracking-wider">
                <MapPin size={14} />
                Smart Check-ins
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
                Check in anywhere.
                <br />
                <span className="text-[var(--text-secondary)] italic">In seconds.</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                HopTrack detects nearby breweries automatically.
                Select a beer, leave a rating, add flavor notes — the
                whole flow takes under 30 seconds.
              </p>
              <div className="flex flex-wrap gap-3">
                {["GPS detection", "Flavor tags", "Photo upload", "Friend tagging"].map((f) => (
                  <span key={f} className="text-sm text-[var(--text-secondary)] bg-[var(--surface)] border border-[var(--border)] px-3 py-1.5 rounded-full">
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#D4A843]/20 flex items-center justify-center">
                    <MapPin size={18} className="text-[#D4A843]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#3D7A52] font-mono">Auto-detected</p>
                    <p className="font-display font-semibold text-[var(--text-primary)]">Founders Brewing Co.</p>
                  </div>
                </div>
                <div className="bg-[var(--surface-2)] rounded-2xl p-4 space-y-2">
                  <p className="font-display font-semibold text-[var(--text-primary)]">KBS (Kentucky Breakfast Stout)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">Imperial Stout</span>
                    <span className="text-xs font-mono text-[var(--text-muted)]">11.8% ABV</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} className={s <= 5 ? "text-[#D4A843] text-xl" : "text-[#3A3628] text-xl"}>★</span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["Coffee", "Chocolate", "Smooth", "Roasty"].map((t) => (
                    <span key={t} className="text-xs bg-[#D4A843]/10 border border-[#D4A843]/30 text-[#D4A843] px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 space-y-3">
                <p className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">This Week's Leaders</p>
                {[
                  { name: "Alex K.", count: 18, rank: 1 },
                  { name: "Jordan M.", count: 15, rank: 2 },
                  { name: "Sam R.", count: 12, rank: 3 },
                  { name: "You", count: 9, rank: 4, isYou: true },
                ].map((user) => (
                  <div
                    key={user.name}
                    className={`flex items-center gap-3 p-3 rounded-xl ${user.isYou ? "bg-[#D4A843]/10 border border-[#D4A843]/20" : "bg-[var(--surface-2)]"}`}
                  >
                    <span className="font-mono text-sm text-[var(--text-muted)] w-5">{user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`}</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ background: user.isYou ? "rgba(212,168,67,0.2)" : "rgba(37,34,25,1)" }}
                    >
                      {user.name[0]}
                    </div>
                    <span className={`flex-1 text-sm font-sans ${user.isYou ? "text-[#D4A843] font-semibold" : "text-[var(--text-primary)]"}`}>{user.name}</span>
                    <span className="font-mono text-sm text-[#D4A843] font-bold">{user.count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 text-[#D4A843] text-sm font-mono uppercase tracking-wider">
                <Trophy size={14} />
                Leaderboards
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
                Compete with
                <br />
                <span className="text-[var(--text-secondary)] italic">your crew.</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                7 leaderboard categories: most check-ins, unique beers,
                unique breweries, highest average rating, and more.
                Weekly resets keep it fresh.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-[#D4A843] text-sm font-mono uppercase tracking-wider">
                <Star size={14} />
                Achievements
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold leading-tight">
                Earn your way to
                <br />
                <span className="text-[var(--text-secondary)] italic">Grand Cicerone.</span>
              </h2>
              <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                35+ achievements across 6 categories. Level up from
                Hop Curious to Grand Cicerone. Every check-in, rating,
                and photo earns XP.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🥇", name: "First Step", tier: "Bronze", color: "#CD7F32" },
                { icon: "🌿", name: "Hop Head", tier: "Silver", color: "#C0C0C0" },
                { icon: "🏆", name: "Style Master", tier: "Gold", color: "#FFD700" },
                { icon: "👑", name: "Legend", tier: "Platinum", color: "#E5E4E2" },
                { icon: "🔥", name: "Streak Master", tier: "Gold", color: "#FFD700" },
                { icon: "🚗", name: "Road Warrior", tier: "Silver", color: "#C0C0C0" },
              ].map((badge) => (
                <div
                  key={badge.name}
                  className="flex flex-col items-center gap-2 p-4 bg-[var(--surface)] rounded-2xl border border-[var(--border)]"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center ring-2"
                    style={{ background: `${badge.color}20`, outline: `2px solid ${badge.color}40` }}
                  >
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <span className="text-xs text-[var(--text-primary)] font-sans font-medium text-center leading-tight">{badge.name}</span>
                  <span className="text-[10px] font-mono" style={{ color: badge.color }}>{badge.tier}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-[var(--text-primary)]">
              Simple as<span className="italic text-[#D4A843]"> one, two, three.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Check in",
                desc: "Walk into a brewery. Open HopTrack. Select what you're having.",
                icon: "📍",
              },
              {
                step: "02",
                title: "Rate & review",
                desc: "Star rating, flavor tags, a quick note. Takes 20 seconds.",
                icon: "⭐",
              },
              {
                step: "03",
                title: "Level up",
                desc: "Earn XP, unlock achievements, climb the leaderboards.",
                icon: "🏆",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-[#D4A843]/20 font-display text-8xl font-bold absolute -top-4 -left-2 leading-none select-none">
                  {item.step}
                </div>
                <div className="relative pt-8 space-y-4">
                  <span className="text-4xl">{item.icon}</span>
                  <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 text-center relative overflow-hidden grain-overlay">
        <div className="absolute inset-0 bg-radial-gradient from-[#1C1A16] to-[#0F0E0C]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#D4A843]/5 blur-3xl pointer-events-none rounded-full" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="font-display text-5xl lg:text-6xl font-bold leading-tight">
            Your next great
            <br />
            <span className="italic text-[#D4A843]">beer awaits.</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            Join thousands of craft beer lovers tracking their journey.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold px-10 py-4 rounded-2xl transition-all text-lg shadow-xl shadow-[#D4A843]/20"
          >
            Start for free
            <ArrowRight size={20} />
          </Link>
          <p className="text-xs text-[var(--text-muted)]">No credit card required. Always free.</p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#D4A843] flex items-center justify-center">
              <Hop size={14} className="text-[#0F0E0C]" />
            </div>
            <span className="font-display font-bold text-[var(--text-primary)]">HopTrack</span>
          </div>
          <div className="flex gap-6 text-sm text-[var(--text-muted)]">
            <Link href="/login" className="hover:text-[var(--text-secondary)] transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-[var(--text-secondary)] transition-colors">Sign Up</Link>
          </div>
          <p className="text-xs text-[var(--text-muted)]">© 2025 HopTrack. Drink responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
