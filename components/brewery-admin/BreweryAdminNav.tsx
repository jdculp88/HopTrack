"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, BarChart2, Gift, Settings, ChevronDown, ExternalLink, Rewind, LogOut, Calendar, QrCode, CreditCard, Users, FileText, Beer } from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "",           label: "Overview",   icon: LayoutDashboard },
  { href: "/tap-list",  label: "Tap List",   icon: List },
  { href: "/analytics", label: "Analytics",  icon: BarChart2 },
  { href: "/customers", label: "Customers",  icon: Users },
  { href: "/loyalty",       label: "Loyalty",      icon: Gift },
  { href: "/events",        label: "Events",       icon: Calendar },
  { href: "/qr",            label: "Table Tent",   icon: QrCode },
  { href: "/report",        label: "Report",       icon: FileText },
  { href: "/promotions",    label: "Promotions",   icon: Beer },
  { href: "/pint-rewind",   label: "Pint Rewind",  icon: Rewind },
  { href: "/settings",      label: "Settings",     icon: Settings },
  { href: "/billing",       label: "Billing",      icon: CreditCard },
];

export function BreweryAdminNav({ accounts }: { accounts: any[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Find active brewery from URL
  const activeBreweryId = pathname.split("/brewery-admin/")[1]?.split("/")[0];
  const activeAccount = accounts.find((a: any) => a.brewery_id === activeBreweryId) ?? accounts[0];
  const brewery = activeAccount?.brewery;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r flex-shrink-0"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>

        {/* Header */}
        <div className="px-6 py-6 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/home" className="flex items-center mb-4 transition-opacity hover:opacity-80">
            <HopMark variant="horizontal" theme="auto" height={32} />
          </Link>

          {/* Brewery selector */}
          {accounts.length > 1 ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left"
                style={{ background: "var(--surface-2)" }}
              >
                <BreweryAvatar name={brewery?.name ?? ""} />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{brewery?.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{brewery?.city}, {brewery?.state}</p>
                </div>
                <ChevronDown size={14} style={{ color: "var(--text-muted)" }} className={cn("transition-transform", open && "rotate-180")} />
              </button>
              {open && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  {accounts.map((a: any) => (
                    <Link
                      key={a.brewery_id}
                      href={`/brewery-admin/${a.brewery_id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      <BreweryAvatar name={a.brewery?.name ?? ""} size="sm" />
                      <span className="text-sm font-medium">{a.brewery?.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "var(--surface-2)" }}>
              <BreweryAvatar name={brewery?.name ?? ""} />
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{brewery?.name}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{brewery?.city}, {brewery?.state}</p>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const fullHref = `/brewery-admin/${activeBreweryId}${href}`;
            const isActive = href === ""
              ? pathname === `/brewery-admin/${activeBreweryId}`
              : pathname.startsWith(fullHref);
            return (
              <Link
                key={href}
                href={fullHref}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "text-[var(--bg)] font-semibold"
                    : "hover:opacity-80"
                )}
                style={isActive
                  ? { background: "var(--accent-gold)", color: "var(--bg)" }
                  : { color: "var(--text-secondary)" }
                }
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t space-y-3" style={{ borderColor: "var(--border)" }}>
          <TrialBadge brewery={brewery} breweryId={activeBreweryId} />
          <Link
            href={`/brewery/${activeBreweryId}`}
            className="flex items-center gap-2 text-xs transition-colors"
            style={{ color: "var(--text-muted)" }}
            target="_blank"
          >
            <ExternalLink size={12} />
            View public page
          </Link>
          <div className="flex items-center gap-2">
            <div
              className={cn("w-1.5 h-1.5 rounded-full", activeAccount?.verified ? "bg-green-500 animate-none" : "animate-pulse")}
              style={activeAccount?.verified ? {} : { background: "var(--accent-gold)" }}
            />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {activeAccount?.role === "owner" ? "Owner" : "Manager"} ·{" "}
              {activeAccount?.verified ? "Verified" : "Pending Verification"}
            </span>
          </div>
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

      {/* Mobile top bar + tab strip */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        {/* Top row */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <BreweryAvatar name={brewery?.name ?? ""} size="sm" />
            <span className="font-display font-semibold text-sm truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>{brewery?.name}</span>
          </div>
          <Link href="/home" className="text-xs flex-shrink-0" style={{ color: "var(--accent-gold)" }}>← App</Link>
        </div>
        {/* Scrollable tab strip */}
        <div className="relative border-t" style={{ borderColor: "var(--border)" }}>
        {/* Fade indicator — hints there are more tabs to the right */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
          style={{ background: "linear-gradient(to right, transparent, var(--surface))" }}
        />
        <div className="flex overflow-x-auto scrollbar-hide">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const fullHref = `/brewery-admin/${activeBreweryId}${href}`;
            const isActive = href === ""
              ? pathname === `/brewery-admin/${activeBreweryId}`
              : pathname.startsWith(fullHref);
            return (
              <Link
                key={href}
                href={fullHref}
                className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0"
                style={isActive
                  ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" }
                  : { color: "var(--text-muted)", borderColor: "transparent" }
                }
              >
                <Icon size={13} />
                {label}
              </Link>
            );
          })}
        </div>
        </div>
      </div>
    </>
  );
}

function TrialBadge({ brewery, breweryId }: { brewery: any; breweryId: string }) {
  if (!brewery?.created_at) return null;
  const createdAt = new Date(brewery.created_at);
  const now = new Date();
  const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, 14 - daysSinceCreation);
  if (daysRemaining <= 0) return null;

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
        style={{
          color: "var(--accent-gold)",
          background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
        }}
      >
        <CreditCard size={13} />
        {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left on trial
      </div>
      <Link
        href={`/brewery-admin/${breweryId}/billing`}
        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold transition-opacity hover:opacity-90"
        style={{
          background: "var(--accent-gold)",
          color: "var(--bg)",
        }}
      >
        Upgrade Plan
      </Link>
    </div>
  );
}

function BreweryAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={cn("rounded-xl flex items-center justify-center font-bold flex-shrink-0", sizeClass)}
      style={{ background: "var(--accent-gold)", color: "var(--bg)" }}>
      {initials}
    </div>
  );
}
