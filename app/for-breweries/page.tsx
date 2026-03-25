import Link from "next/link";
import { Hop, Check, ArrowRight, BarChart2, Gift, List, Smartphone, Zap, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "HopTrack for Breweries — Replace the Spreadsheet",
  description: "Give your brewery a loyalty program, tap list management, and real analytics. Starting at $49/month.",
};

const TIERS = [
  {
    name: "Tap",
    price: "$49",
    period: "/mo",
    tagline: "Everything you need to get started.",
    cta: "Start free trial",
    ctaHref: "/brewery-admin/claim",
    highlight: false,
    features: [
      "Live tap list management",
      "Loyalty stamp card program",
      "Check-in analytics (30 days)",
      "Brewery profile on HopTrack",
      "Up to 2 staff accounts",
      "Email support",
    ],
  },
  {
    name: "Cask",
    price: "$149",
    period: "/mo",
    tagline: "For growing breweries that want the full picture.",
    cta: "Start free trial",
    ctaHref: "/brewery-admin/claim",
    highlight: true,
    features: [
      "Everything in Tap",
      "Unlimited staff accounts",
      "90-day analytics + Pint Rewind",
      "Promotions & slow-seller alerts",
      "QR code loyalty redemption",
      "Priority support",
      "Brewery API access",
    ],
  },
  {
    name: "Barrel",
    price: "Custom",
    period: "",
    tagline: "Multi-location groups and enterprise accounts.",
    cta: "Talk to us",
    ctaHref: "mailto:sales@hoptrack.beer?subject=Barrel%20Tier%20Inquiry",
    highlight: false,
    features: [
      "Everything in Cask",
      "Multi-location dashboard",
      "Dedicated account manager",
      "Custom analytics & reporting",
      "White-label options",
      "SLA + uptime guarantee",
    ],
  },
];

const FEATURES = [
  {
    icon: List,
    title: "Live Tap List",
    body: "Update your tap list from any device. Changes appear instantly on your brewery's HopTrack profile — no more outdated menus.",
  },
  {
    icon: Gift,
    title: "Loyalty Without the Paper",
    body: "Digital stamp cards your customers actually use. Set stamps required, define the reward, and edit any time.",
  },
  {
    icon: BarChart2,
    title: "Analytics That Tell a Story",
    body: "See your busiest nights, top beers, and most loyal regulars. Pint Rewind shows you your month at a glance.",
  },
  {
    icon: Smartphone,
    title: "Works on Any Device",
    body: "Your dashboard on desktop, your tap list on a tablet behind the bar, check-ins on the customer's phone. It all syncs.",
  },
  {
    icon: Zap,
    title: "Set Up in 20 Minutes",
    body: "Claim your brewery, add your beers, go live. No hardware, no installation, no IT person required.",
  },
  {
    icon: HeartHandshake,
    title: "Built With Operators",
    body: "Designed alongside real brewery owners. If something doesn't work on a busy Friday night, we fix it.",
  },
];

export default function ForBreweriesPage() {
  return (
    <div className="min-h-screen bg-[#0F0E0C] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-[#0F0E0C]/80 backdrop-blur-md border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#D4A843] flex items-center justify-center">
            <Hop size={18} className="text-[#0F0E0C]" />
          </div>
          <span className="font-display text-xl font-bold">HopTrack</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-white/60 hover:text-white text-sm transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link
            href="/brewery-admin/claim"
            className="bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-semibold text-sm px-4 py-2 rounded-xl transition-all"
          >
            Claim your brewery
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4A843]/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#D4A843]/10 border border-[#D4A843]/20 text-[#D4A843] text-xs font-mono uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4A843] animate-pulse" />
            For Brewery Owners
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-none tracking-tight mb-6">
            Replace the<br />
            <span className="italic text-[#D4A843]">spreadsheet.</span>
          </h1>
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            HopTrack gives your brewery a live tap list, a loyalty program your customers love,
            and analytics that actually tell you something. Starting at $49/month.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/brewery-admin/claim"
              className="inline-flex items-center gap-2 bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold px-8 py-4 rounded-xl text-lg transition-all"
            >
              Claim your brewery free <ArrowRight size={20} />
            </Link>
            <p className="text-white/40 text-sm">No credit card required · 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold mb-3">Everything in one place</h2>
          <p className="text-white/50 text-lg">Built for the realities of running a craft brewery.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl p-6 border border-white/8 bg-white/3">
              <div className="w-10 h-10 rounded-xl bg-[#D4A843]/15 flex items-center justify-center mb-4">
                <Icon size={20} className="text-[#D4A843]" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 max-w-6xl mx-auto" id="pricing">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-bold mb-3">Simple, honest pricing</h2>
          <p className="text-white/50 text-lg">No hidden fees. No long-term contracts. Cancel any time.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl p-7 border flex flex-col"
              style={{
                background: tier.highlight ? "rgba(212,168,67,0.08)" : "rgba(255,255,255,0.02)",
                borderColor: tier.highlight ? "#D4A843" : "rgba(255,255,255,0.08)",
              }}
            >
              {tier.highlight && (
                <div className="text-xs font-mono uppercase tracking-widest text-[#D4A843] mb-3">Most popular</div>
              )}
              <h3 className="font-display text-2xl font-bold mb-1">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="font-display text-4xl font-bold text-[#D4A843]">{tier.price}</span>
                {tier.period && <span className="text-white/40 text-sm">{tier.period}</span>}
              </div>
              <p className="text-white/50 text-sm mb-6">{tier.tagline}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <Check size={15} className="text-[#D4A843] mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaHref}
                className="w-full text-center py-3 rounded-xl font-semibold text-sm transition-all"
                style={tier.highlight
                  ? { background: "#D4A843", color: "#0F0E0C" }
                  : { border: "1px solid rgba(255,255,255,0.15)", color: "white" }
                }
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA footer */}
      <section className="py-20 px-6 text-center border-t border-white/8">
        <h2 className="font-display text-4xl font-bold mb-4">Ready to pour smarter?</h2>
        <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
          Join the breweries replacing punch cards and guesswork with HopTrack.
        </p>
        <Link
          href="/brewery-admin/claim"
          className="inline-flex items-center gap-2 bg-[#D4A843] hover:bg-[#E8841A] text-[#0F0E0C] font-bold px-8 py-4 rounded-xl text-lg transition-all"
        >
          Claim your brewery free <ArrowRight size={20} />
        </Link>
        <p className="text-white/30 text-sm mt-4">
          Questions? <a href="mailto:sales@hoptrack.beer" className="underline hover:text-white/60 transition-colors">sales@hoptrack.beer</a>
        </p>
      </section>

      {/* Minimal footer */}
      <footer className="py-8 px-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs">
        <div className="flex items-center gap-2">
          <Hop size={14} className="text-[#D4A843]" />
          <span>HopTrack · Track Every Pour</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-white/60 transition-colors">Consumer app</Link>
          <Link href="/login" className="hover:text-white/60 transition-colors">Sign in</Link>
          <a href="mailto:sales@hoptrack.beer" className="hover:text-white/60 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
