"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home, Compass, User, Trophy, Users, Bell, Settings, Hop,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV_ITEMS = [
  { href: "/home",         label: "Feed",         icon: Home },
  { href: "/explore",      label: "Explore",      icon: Compass },
  { href: "/friends",      label: "Friends",      icon: Users },
  { href: "/achievements", label: "Achievements", icon: Trophy },
];

interface AppNavProps {
  username: string;
  unreadNotifications?: number;
  onCheckin: () => void;
}

export function AppNav({ username, unreadNotifications = 0, onCheckin }: AppNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0 border-r"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent-gold)" }}
            >
              <Hop size={18} style={{ color: "var(--bg)" }} />
            </div>
            <span
              className="font-display text-xl font-bold transition-colors group-hover:opacity-80"
              style={{ color: "var(--text-primary)" }}
            >
              HopTrack
            </span>
          </Link>
        </div>

        {/* Check-in CTA */}
        <div className="px-4 py-4">
          <button
            onClick={onCheckin}
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-2xl transition-all duration-150 active:scale-95 hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            <PlusCircle size={18} />
            Check In
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group"
                  style={{
                    background: isActive ? "color-mix(in srgb, var(--accent-gold) 12%, transparent)" : "transparent",
                    color: isActive ? "var(--accent-gold)" : "var(--text-secondary)",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
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
                  <Icon size={18} />
                  <span className="font-sans text-sm font-medium">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent-gold)" }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: "var(--border)" }}>
          {[
            {
              href: "/notifications",
              label: "Notifications",
              icon: Bell,
              exact: true,
              badge: unreadNotifications > 0 ? (unreadNotifications > 9 ? "9+" : String(unreadNotifications)) : null,
            },
            { href: `/profile/${username}`, label: "Profile",  icon: User,     exact: false },
            { href: "/settings",            label: "Settings", icon: Settings, exact: true  },
          ].map(({ href, label, icon: Icon, exact, badge }) => {
            const isActive = exact ? pathname === href : pathname.startsWith("/profile");
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={{
                    background: isActive ? "color-mix(in srgb, var(--accent-gold) 12%, transparent)" : "transparent",
                    color: isActive ? "var(--accent-gold)" : "var(--text-secondary)",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
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
                  <div className="relative">
                    <Icon size={18} />
                    {badge && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-mono flex items-center justify-center"
                        style={{ background: "var(--danger)" }}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                  <span className="font-sans text-sm font-medium">{label}</span>
                </div>
              </Link>
            );
          })}

          {/* Theme toggle */}
          <div className="px-3 pt-1">
            <ThemeToggle variant="full" />
          </div>
        </div>
      </aside>

      {/* ── Mobile bottom nav ───────────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md border-t"
        style={{ background: "color-mix(in srgb, var(--surface) 95%, transparent)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {NAV_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="flex-1">
                <div
                  className="flex flex-col items-center gap-1 py-1 rounded-xl transition-colors"
                  style={{ color: isActive ? "var(--accent-gold)" : "var(--text-muted)" }}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-sans">{label}</span>
                </div>
              </Link>
            );
          })}

          {/* Center check-in FAB */}
          <button onClick={onCheckin} className="flex-shrink-0 mx-2">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
              style={{
                background: "var(--accent-gold)",
                boxShadow: "0 4px 14px color-mix(in srgb, var(--accent-gold) 35%, transparent)",
              }}
            >
              <PlusCircle size={22} style={{ color: "var(--bg)" }} />
            </div>
          </button>

          {NAV_ITEMS.slice(2).map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="flex-1">
                <div
                  className="flex flex-col items-center gap-1 py-1 rounded-xl transition-colors"
                  style={{ color: isActive ? "var(--accent-gold)" : "var(--text-muted)" }}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-sans">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
