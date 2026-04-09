"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Compass, User, Trophy, Users, Bell, Settings,
  PlusCircle, LogOut, Gift,
} from "lucide-react";
import { motion, useScroll, useMotionValueEvent, useReducedMotion } from "motion/react";
// Sprint 171: ThemeToggle removed from nav — lives in Settings > Appearance only
import { createClient } from "@/lib/supabase/client";
import { useHaptic } from "@/hooks/useHaptic";
import { HopMark } from "@/components/ui/HopMark";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { SearchTypeahead } from "@/components/ui/SearchTypeahead";

const NAV_ITEMS = [
  { href: "/home",         label: "Feed",         icon: Home },
  { href: "/explore",      label: "Explore",      icon: Compass },
  { href: "/friends",      label: "Friends",      icon: Users },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

// Mobile bottom nav — notifications replaces achievements (time-sensitive on mobile)
const MOBILE_NAV_ITEMS = [
  { href: "/home",         label: "Feed",         icon: Home },
  { href: "/explore",      label: "Explore",      icon: Compass },
  { href: "/friends",      label: "Friends",      icon: Users },
  { href: "/notifications", label: "Alerts",      icon: Bell },
];

interface AppNavProps {
  username: string;
  unreadNotifications?: number;
  onCheckin: () => void;
  hasActiveSession?: boolean;
}

// Sprint 161 — Arc-style phase animation check-in FAB
function CheckinFAB({ onCheckin, haptic }: { onCheckin: () => void; haptic: (p: "press" | "success") => void }) {
  const [phase, setPhase] = useState<"idle" | "press" | "expand" | "return">("idle");

  const handleClick = () => {
    haptic("press");
    // Phase morph: press → expand → return → fire
    setPhase("press");
    setTimeout(() => setPhase("expand"), 80);
    setTimeout(() => setPhase("return"), 260);
    setTimeout(() => {
      setPhase("idle");
      onCheckin();
    }, 380);
  };

  // Target scale per phase
  const scaleByPhase = {
    idle: 1,
    press: 0.92,
    expand: 1.12,
    return: 1,
  } as const;

  // Inner icon rotation
  const iconRotate = phase === "expand" || phase === "return" ? 90 : 0;

  return (
    <button
      onClick={handleClick}
      className="flex-shrink-0 mx-2 relative"
      aria-label="Start Session"
      aria-expanded={false}
    >
      {/* Ripple expansion on expand phase */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={false}
        animate={{
          scale: phase === "expand" ? 1.8 : 1,
          opacity: phase === "expand" ? 0 : 0.35,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          background: "radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
        animate={{ scale: scaleByPhase[phase] }}
        transition={{ type: "spring", stiffness: 600, damping: 20 }}
        style={{
          background: "var(--accent-gold)",
          boxShadow:
            phase === "expand"
              ? "0 8px 28px color-mix(in srgb, var(--accent-gold) 60%, transparent), 0 0 0 4px color-mix(in srgb, var(--accent-gold) 25%, transparent)"
              : "0 4px 14px color-mix(in srgb, var(--accent-gold) 35%, transparent)",
        }}
      >
        <motion.div
          animate={{ rotate: iconRotate }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          style={{ color: "var(--bg)" }}
        >
          <PlusCircle size={20} />
        </motion.div>
      </motion.div>
    </button>
  );
}

export function AppNav({ username, unreadNotifications = 0, onCheckin, hasActiveSession = false }: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { haptic } = useHaptic();

  // Sprint 161 — The Vibe: scroll-hide bottom nav on scroll-down
  // Disabled during active session — DetentSheet peek sits above the nav
  const { scrollY } = useScroll();
  const [navHidden, setNavHidden] = useState(false);
  const reducedMotion = useReducedMotion();

  // Force-show nav immediately when a session starts (even if already scroll-hidden)
  useEffect(() => {
    if (hasActiveSession) setNavHidden(false);
  }, [hasActiveSession]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (reducedMotion || hasActiveSession) return;
    const previous = scrollY.getPrevious() ?? 0;
    const delta = latest - previous;
    if (delta > 4 && latest > 120) {
      setNavHidden(true);
    } else if (delta < -4 || latest < 80) {
      setNavHidden(false);
    }
  });

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* ── Mobile top header (branding) — Liquid Glass (Sprint 161) ──────── */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b"
        style={{
          background: "color-mix(in srgb, var(--surface) 72%, transparent)",
          borderColor: "color-mix(in srgb, var(--accent-gold) 15%, var(--border))",
          boxShadow: "inset 0 -1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/home" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <HopMark variant="mark" theme="auto" height={26} />
            <span
              className="font-display text-[15px] font-semibold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              HopTrack
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <GlobalSearch />
            <Link href={`/profile/${username}`} aria-label="Profile">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
                  color: "var(--accent-gold)",
                }}
              >
                <User size={16} />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside
        aria-label="Main navigation"
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0 border-r"
        style={{ background: "var(--bg)", borderColor: "var(--border)" }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/home" className="flex items-center group transition-opacity hover:opacity-80">
            <HopMark variant="horizontal" theme="auto" height={32} />
          </Link>
        </div>

        {/* Start Session CTA */}
        <div className="px-4 py-4">
          <button
            onClick={onCheckin}
            aria-expanded={false}
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-all duration-150 active:scale-95 hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <PlusCircle size={16} />
            Start Session
          </button>
        </div>

        {/* Desktop search */}
        <div className="px-4 pb-2">
          <SearchTypeahead
            placeholder="Search..."
            onSelectBeer={(beer) => router.push(`/beer/${beer.id}`)}
            onSelectBrewery={(brewery) => router.push(`/brewery/${brewery.id}`)}
          />
        </div>

        {/* Nav links — Design System v2.0: active = warm-bg + 3px amber left accent + 600 weight */}
        <nav aria-label="Main navigation" className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link key={href} href={href} aria-current={isActive ? "page" : undefined}>
                <div
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden"
                  style={{
                    background: isActive ? "var(--warm-bg, var(--surface-2))" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--warm-bg, var(--surface-2))";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                    }
                  }}
                >
                  {/* 3px amber left accent bar on active */}
                  {isActive && (
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                      style={{ background: "var(--amber, var(--accent-gold))" }}
                    />
                  )}
                  <Icon size={20} />
                  <span className={`font-sans text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links — Design System v2.0: same active treatment, secondary items quieter */}
        <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: "var(--border)" }}>
          {[
            {
              href: "/notifications",
              label: "Notifications",
              icon: Bell,
              exact: true,
              badge: unreadNotifications > 0 ? (unreadNotifications > 9 ? "9+" : String(unreadNotifications)) : null,
              secondary: false,
            },
            { href: "/rewards",             label: "Rewards",  icon: Gift,     exact: true,  badge: null, secondary: false },
            { href: `/profile/${username}`, label: "Profile",  icon: User,     exact: false, badge: null, secondary: false },
            { href: "/settings",            label: "Settings", icon: Settings, exact: true,  badge: null, secondary: true },
          ].map(({ href, label, icon: Icon, exact, badge, secondary }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            const linkAriaLabel = badge ? `${label}, ${badge} unread` : label;
            return (
              <Link key={href} href={href} aria-label={linkAriaLabel} aria-current={isActive ? "page" : undefined}>
                <div
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 overflow-hidden"
                  style={{
                    background: isActive ? "var(--warm-bg, var(--surface-2))" : "transparent",
                    color: isActive ? "var(--text-primary)" : secondary ? "var(--text-muted)" : "var(--text-secondary)",
                    fontSize: secondary ? "13px" : undefined,
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--warm-bg, var(--surface-2))";
                      (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = secondary ? "var(--text-muted)" : "var(--text-secondary)";
                    }
                  }}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full"
                      style={{ background: "var(--amber, var(--accent-gold))" }}
                    />
                  )}
                  <div className="relative">
                    <Icon size={20} />
                    {badge && (
                      <span
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full text-white text-[9px] font-mono font-bold flex items-center justify-center px-1"
                        style={{ background: "var(--danger)" }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className={`font-sans text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
                </div>
              </Link>
            );
          })}

          {/* Logout — tertiary color, smaller */}
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
            style={{ color: "var(--text-muted)", fontSize: "13px" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "var(--warm-bg, var(--surface-2))";
              (e.currentTarget as HTMLElement).style.color = "var(--danger)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
            }}
          >
            <LogOut size={20} />
            <span className="font-sans text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav (Sprint 161 — Liquid Glass + scroll-hide) ─────── */}
      <motion.div
        role="navigation"
        aria-label="Bottom navigation"
        animate={{ y: navHidden ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t"
        style={{
          background: "color-mix(in srgb, var(--surface) 72%, transparent)",
          borderColor: "color-mix(in srgb, var(--accent-gold) 18%, var(--border))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 -8px 32px rgba(0,0,0,0.35)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2 pb-safe-nav">
          {MOBILE_NAV_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="flex-1" aria-label={label} aria-current={isActive ? "page" : undefined} onClick={() => haptic("selection")}>
                <div
                  className="flex flex-col items-center gap-1 py-1 rounded-xl transition-colors"
                  style={{ color: isActive ? "var(--accent-gold)" : "var(--text-muted)" }}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span className="text-[10px] font-sans">{label}</span>
                </div>
              </Link>
            );
          })}

          {/* Center check-in FAB — Arc-style phase animation (Sprint 161) */}
          <CheckinFAB onCheckin={onCheckin} haptic={haptic} />

          {MOBILE_NAV_ITEMS.slice(2).map(({ href, label, icon: Icon }) => {
            const isActive = href === "/notifications" ? pathname === href : pathname.startsWith(href);
            const isNotifications = href === "/notifications";
            const mobileNotifBadge = isNotifications && unreadNotifications > 0
              ? (unreadNotifications > 9 ? "9+" : String(unreadNotifications))
              : null;
            const mobileLinkAriaLabel = mobileNotifBadge ? `${label}, ${mobileNotifBadge} unread` : label;
            return (
              <Link key={href} href={href} className="flex-1" aria-label={mobileLinkAriaLabel} aria-current={isActive ? "page" : undefined} onClick={() => haptic("selection")}>
                <div
                  className="flex flex-col items-center gap-1 py-1 rounded-xl transition-colors"
                  style={{ color: isActive ? "var(--accent-gold)" : "var(--text-muted)" }}
                >
                  <div className="relative">
                    <Icon size={20} aria-hidden="true" />
                    {isNotifications && unreadNotifications > 0 && (
                      <span
                        className="absolute -top-1 -right-2 min-w-[16px] h-4 px-0.5 rounded-full text-white text-[9px] font-mono flex items-center justify-center"
                        style={{ background: "var(--danger)" }}
                      >
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-sans">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
