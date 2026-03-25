"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hop, LayoutDashboard, List, BarChart2, Gift, Settings, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "",           label: "Overview",   icon: LayoutDashboard },
  { href: "/tap-list",  label: "Tap List",   icon: List },
  { href: "/analytics", label: "Analytics",  icon: BarChart2 },
  { href: "/loyalty",   label: "Loyalty",    icon: Gift },
  { href: "/settings",  label: "Settings",   icon: Settings },
];

export function BreweryAdminNav({ accounts }: { accounts: any[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        <div className="px-5 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/home" className="flex items-center gap-2 mb-4 opacity-60 hover:opacity-100 transition-opacity">
            <Hop size={16} style={{ color: "var(--accent-gold)" }} />
            <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>HopTrack</span>
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
                    ? "text-[#0F0E0C] font-semibold"
                    : "hover:opacity-80"
                )}
                style={isActive
                  ? { background: "var(--accent-gold)", color: "#0F0E0C" }
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
        <div className="px-4 py-4 border-t space-y-2" style={{ borderColor: "var(--border)" }}>
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
        <div className="flex overflow-x-auto scrollbar-hide border-t" style={{ borderColor: "var(--border)" }}>
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
    </>
  );
}

function BreweryAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={cn("rounded-xl flex items-center justify-center font-bold flex-shrink-0", sizeClass)}
      style={{ background: "var(--accent-gold)", color: "#0F0E0C" }}>
      {initials}
    </div>
  );
}
