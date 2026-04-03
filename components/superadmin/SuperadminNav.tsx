"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Monitor,
  Users,
  Beer,
  ClipboardCheck,
  FileText,
  BarChart2,
  ShieldAlert,
  LogOut,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  badge?: number;
}

interface SuperadminNavProps {
  pendingClaimsCount: number;
  pendingBarbackCount?: number;
}

export function SuperadminNav({ pendingClaimsCount, pendingBarbackCount = 0 }: SuperadminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const NAV_ITEMS: NavItem[] = [
    { href: "/superadmin",           label: "Command Center", icon: Monitor },
    { href: "/superadmin/users",     label: "Users",          icon: Users },
    { href: "/superadmin/breweries", label: "Breweries",      icon: Beer },
    { href: "/superadmin/claims",    label: "Claims Queue",   icon: ClipboardCheck, badge: pendingClaimsCount },
    { href: "/superadmin/barback",   label: "The Barback",    icon: Bot, badge: pendingBarbackCount },
    { href: "/superadmin/content",   label: "Content",        icon: FileText },
    { href: "/superadmin/stats",     label: "Platform Stats", icon: BarChart2 },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 min-h-screen border-r flex-shrink-0"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert size={16} style={{ color: "var(--danger)" }} />
            <span
              className="text-xs font-mono uppercase tracking-widest font-bold"
              style={{ color: "var(--danger)" }}
            >
              Superadmin
            </span>
          </div>
          <p
            className="text-xs font-mono uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            HopTrack Platform
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
            const isActive =
              href === "/superadmin"
                ? pathname === "/superadmin"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive ? "font-semibold" : "hover:opacity-90"
                )}
                style={
                  isActive
                    ? { background: "var(--surface-2)", color: "var(--text-primary)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon
                  size={15}
                  style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
                />
                <span className="flex-1">{label}</span>
                {badge != null && badge > 0 && (
                  <span
                    className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-md min-w-[20px] text-center"
                    style={{ background: "var(--danger)", color: "var(--text-primary)" }}
                  >
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
          <Link
            href="/home"
            className="block text-xs transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back to app
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs transition-colors w-full"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--danger)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"}
          >
            <LogOut size={12} />
            Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <ShieldAlert size={14} style={{ color: "var(--danger)" }} />
          <span
            className="text-xs font-mono uppercase tracking-widest font-bold"
            style={{ color: "var(--danger)" }}
          >
            Superadmin
          </span>
        </div>
        <Link href="/home" className="text-xs" style={{ color: "var(--text-muted)" }}>
          ← App
        </Link>
      </div>
    </>
  );
}
