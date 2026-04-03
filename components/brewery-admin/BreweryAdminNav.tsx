"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, BarChart2, BarChart3, Gift, Settings, ChevronDown, ChevronRight, ExternalLink, Rewind, LogOut, Calendar, QrCode, CreditCard, Users, FileText, Mail, Trophy, BookOpen, Activity, Code2, Tv, RefreshCw, Megaphone, Crown, Building2, UtensilsCrossed, MoreHorizontal, X } from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

// --- Nav Data Structure ---

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  label?: string;
  icon?: LucideIcon;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  { id: "overview", items: [
    { href: "",           label: "Overview",   icon: LayoutDashboard },
  ]},
  { id: "content", label: "Content", icon: List, items: [
    { href: "/tap-list",  label: "Tap List",   icon: List },
    { href: "/menus",     label: "Menus",      icon: UtensilsCrossed },
    { href: "/board",     label: "Board",      icon: Tv },
    { href: "/embed",     label: "Embed",      icon: Code2 },
  ]},
  { id: "engage", label: "Engage", icon: Mail, items: [
    { href: "/messages",    label: "Messages",     icon: Mail },
    { href: "/loyalty",     label: "Loyalty",      icon: Gift },
    { href: "/mug-clubs",   label: "Mug Clubs",    icon: Crown },
    { href: "/challenges",  label: "Challenges",   icon: Trophy },
    { href: "/promotions",  label: "Promo Hub",    icon: Megaphone },
    { href: "/ads",         label: "Ad Campaigns", icon: Megaphone },
  ]},
  { id: "insights", label: "Insights", icon: BarChart2, items: [
    { href: "/analytics",   label: "Analytics",    icon: BarChart2 },
    { href: "/customers",   label: "Customers",    icon: Users },
    { href: "/sessions",    label: "Sessions",     icon: Activity },
    { href: "/report",      label: "Report",       icon: FileText },
    { href: "/pint-rewind", label: "Pint Rewind",  icon: Rewind },
  ]},
  { id: "operations", label: "Operations", icon: Calendar, items: [
    { href: "/events",    label: "Events",     icon: Calendar },
    { href: "/qr",        label: "Table Tent", icon: QrCode },
    { href: "/pos-sync",  label: "POS Sync",   icon: RefreshCw },
  ]},
  { id: "account", label: "Account", icon: Settings, items: [
    { href: "/settings",  label: "Settings",  icon: Settings },
    { href: "/billing",   label: "Billing",   icon: CreditCard },
    { href: "/resources", label: "Resources", icon: BookOpen },
  ]},
];

// Flat list for convenience
const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

// Brand nav items (DRY — was 110+ lines of repeated JSX)
const BRAND_NAV_ITEMS = [
  { path: "dashboard",  label: "Brand Dashboard", icon: Building2 },
  { path: "reports",    label: "Brand Reports",   icon: BarChart3 },
  { path: "customers",  label: "Brand Customers", icon: Users },
  { path: "team",       label: "Brand Team",      icon: Users },
  { path: "loyalty",    label: "Brand Loyalty",    icon: Gift },
  { path: "catalog",    label: "Brand Catalog",    icon: List },
  { path: "billing",    label: "Brand Billing",    icon: CreditCard },
];

// Mobile brand tabs (condensed labels)
const MOBILE_BRAND_ITEMS = [
  { path: "dashboard",  label: "Brand",     icon: Building2 },
  { path: "customers",  label: "Customers", icon: Users },
  { path: "team",       label: "Team",      icon: Users },
  { path: "loyalty",    label: "Loyalty",    icon: Gift },
  { path: "catalog",    label: "Catalog",    icon: List },
];

// Mobile priority items (shown in the strip, rest go in "More" sheet)
const MOBILE_PRIORITY_HREFS = ["", "/tap-list", "/analytics", "/messages", "/loyalty", "/settings"];

const STORAGE_KEY = "ht-nav-groups";

function getStoredGroups(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function storeGroups(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or unavailable
  }
}

// --- Main Component ---

export function BreweryAdminNav({ accounts, brandAccounts = [] }: { accounts: any[]; brandAccounts?: any[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // Collapsible group state
  const [groupState, setGroupState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setGroupState(getStoredGroups());
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setGroupState(prev => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      storeGroups(next);
      return next;
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // Find active brewery from URL
  const pathSegment = pathname.split("/brewery-admin/")[1]?.split("/")[0];
  const isBrandPage = pathSegment === "brand";
  const activeBrandId = isBrandPage ? pathname.split("/brand/")[1]?.split("/")[0] : null;

  let activeBreweryId = pathSegment;
  if (isBrandPage && activeBrandId) {
    const brandBrewery = accounts.find((a: any) => a.brewery?.brand?.id === activeBrandId);
    activeBreweryId = brandBrewery?.brewery_id ?? accounts[0]?.brewery_id;
  }
  const activeAccount = accounts.find((a: any) => a.brewery_id === activeBreweryId) ?? accounts[0];
  const brewery = activeAccount?.brewery;
  const hasBrand = brewery?.brand && brandAccounts.some((ba: any) => ba.brand_id === brewery.brand.id);

  // Active link helper
  function isItemActive(href: string) {
    const fullHref = `/brewery-admin/${activeBreweryId}${href}`;
    return href === ""
      ? pathname === `/brewery-admin/${activeBreweryId}`
      : pathname.startsWith(fullHref);
  }

  function isGroupActive(group: NavGroup) {
    return group.items.some(item => isItemActive(item.href));
  }

  function isGroupExpanded(group: NavGroup) {
    // Always expanded if it contains the active page
    if (isGroupActive(group)) return true;
    // Use stored preference, default to expanded
    return groupState[group.id] !== false;
  }

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
                onClick={() => setSelectorOpen(!selectorOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-xl transition-colors text-left"
                style={{ background: "var(--surface-2)" }}
              >
                {isBrandPage && brewery?.brand ? (
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
                    <Building2 size={16} style={{ color: "var(--accent-gold)" }} />
                  </div>
                ) : (
                  <BreweryAvatar name={brewery?.name ?? ""} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-sm truncate" style={{ color: isBrandPage ? "var(--accent-gold)" : "var(--text-primary)" }}>
                    {isBrandPage && brewery?.brand ? brewery.brand.name : brewery?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {isBrandPage ? "Brand Management" : `${brewery?.city}, ${brewery?.state}`}
                  </p>
                </div>
                <ChevronDown size={14} style={{ color: "var(--text-muted)" }} className={cn("transition-transform", selectorOpen && "rotate-180")} />
              </button>
              {selectorOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                  {(() => {
                    const branded = accounts.filter((a: any) => a.brewery?.brand);
                    const independent = accounts.filter((a: any) => !a.brewery?.brand);
                    const brandGroups = new Map<string, { brand: any; locations: any[] }>();
                    branded.forEach((a: any) => {
                      const b = a.brewery.brand;
                      if (!brandGroups.has(b.id)) brandGroups.set(b.id, { brand: b, locations: [] });
                      brandGroups.get(b.id)!.locations.push(a);
                    });

                    return (
                      <>
                        {Array.from(brandGroups.values()).map(({ brand: b, locations: locs }) => (
                          <div key={b.id}>
                            <Link
                              href={`/brewery-admin/brand/${b.id}/dashboard`}
                              onClick={() => setSelectorOpen(false)}
                              className="flex items-center justify-between px-3 py-2.5 border-b transition-colors"
                              style={{ borderColor: "var(--border)", background: activeBrandId === b.id ? "color-mix(in srgb, var(--accent-gold) 12%, transparent)" : undefined }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "color-mix(in srgb, var(--accent-gold) 12%, transparent)"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = activeBrandId === b.id ? "color-mix(in srgb, var(--accent-gold) 12%, transparent)" : "transparent"}
                            >
                              <div className="flex items-center gap-2">
                                <Building2 size={14} style={{ color: "var(--accent-gold)" }} />
                                <span className="text-xs font-bold" style={{ color: "var(--accent-gold)" }}>{b.name}</span>
                              </div>
                              <span className="text-[10px] font-medium" style={{ color: "var(--accent-gold)", opacity: 0.7 }}>Brand Dashboard →</span>
                            </Link>
                            {locs.map((a: any) => (
                              <Link
                                key={a.brewery_id}
                                href={`/brewery-admin/${a.brewery_id}`}
                                onClick={() => setSelectorOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 pl-7 transition-colors"
                                style={{ color: "var(--text-primary)" }}
                              >
                                <BreweryAvatar name={a.brewery?.name ?? ""} size="sm" />
                                <span className="text-sm font-medium">{a.brewery?.name}</span>
                              </Link>
                            ))}
                          </div>
                        ))}
                        {independent.map((a: any) => (
                          <Link
                            key={a.brewery_id}
                            href={`/brewery-admin/${a.brewery_id}`}
                            onClick={() => setSelectorOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                            style={{ color: "var(--text-primary)" }}
                          >
                            <BreweryAvatar name={a.brewery?.name ?? ""} size="sm" />
                            <span className="text-sm font-medium">{a.brewery?.name}</span>
                          </Link>
                        ))}
                      </>
                    );
                  })()}
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
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {/* Brand links */}
          {hasBrand && (
            <div className="mb-3 space-y-1">
              {BRAND_NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const bHref = `/brewery-admin/brand/${brewery.brand.id}/${path}`;
                const bActive = pathname.includes(`/brand/${brewery.brand.id}/${path}`);
                return (
                  <Link
                    key={path}
                    href={bHref}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      bActive ? "text-[var(--bg)] font-semibold" : "hover:opacity-80"
                    )}
                    style={bActive
                      ? { background: "var(--accent-gold)", color: "var(--bg)" }
                      : { color: "var(--accent-gold)", background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)" }
                    }
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Grouped brewery nav */}
          {NAV_GROUPS.map(group => {
            // Overview group renders standalone (no header, no collapse)
            if (group.id === "overview") {
              const item = group.items[0];
              const fullHref = `/brewery-admin/${activeBreweryId}${item.href}`;
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-2",
                    active ? "text-[var(--bg)] font-semibold" : "hover:opacity-80"
                  )}
                  style={active
                    ? { background: "var(--accent-gold)", color: "var(--bg)" }
                    : { color: "var(--text-secondary)" }
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            }

            const expanded = isGroupExpanded(group);
            const active = isGroupActive(group);
            const GroupIcon = group.icon!;

            return (
              <div key={group.id} className="mb-1">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors"
                  style={{ color: active ? "var(--accent-gold)" : "var(--text-muted)" }}
                >
                  <GroupIcon size={13} style={{ opacity: 0.7 }} />
                  <span className="flex-1 text-left">{group.label}</span>
                  <motion.div
                    animate={{ rotate: expanded ? 90 : 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <ChevronRight size={12} style={{ opacity: 0.5 }} />
                  </motion.div>
                </button>

                {/* Group items */}
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 pb-1">
                        {group.items.map(({ href, label, icon: Icon }) => {
                          const fullHref = `/brewery-admin/${activeBreweryId}${href}`;
                          const itemActive = isItemActive(href);
                          return (
                            <Link
                              key={href}
                              href={fullHref}
                              className={cn(
                                "flex items-center gap-3 pl-6 pr-3 py-2 rounded-xl text-sm font-medium transition-all",
                                itemActive ? "text-[var(--bg)] font-semibold" : "hover:opacity-80"
                              )}
                              style={itemActive
                                ? { background: "var(--accent-gold)", color: "var(--bg)" }
                                : { color: "var(--text-secondary)" }
                              }
                            >
                              <Icon size={15} />
                              {label}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
            {isBrandPage && brewery?.brand ? (
              <>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
                  <Building2 size={13} style={{ color: "var(--accent-gold)" }} />
                </div>
                <span className="font-display font-semibold text-sm truncate max-w-[160px]" style={{ color: "var(--accent-gold)" }}>{brewery.brand.name}</span>
              </>
            ) : (
              <>
                <BreweryAvatar name={brewery?.name ?? ""} size="sm" />
                <span className="font-display font-semibold text-sm truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>{brewery?.name}</span>
              </>
            )}
          </div>
          <Link href="/home" className="text-xs flex-shrink-0" style={{ color: "var(--accent-gold)" }}>← App</Link>
        </div>
        {/* Scrollable tab strip */}
        <div className="relative border-t" style={{ borderColor: "var(--border)" }}>
          {/* Fade indicator */}
          <div
            className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
            style={{ background: "linear-gradient(to right, transparent, var(--surface))" }}
          />
          <div className="flex overflow-x-auto scrollbar-hide">
            {/* Brand tabs (mobile) */}
            {hasBrand && (
              <>
                {MOBILE_BRAND_ITEMS.map(({ path, label, icon: BIcon }) => {
                  const bHref = `/brewery-admin/brand/${brewery.brand.id}/${path}`;
                  const bActive = pathname.startsWith(bHref);
                  return (
                    <Link
                      key={bHref}
                      href={bHref}
                      className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0"
                      style={bActive
                        ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" }
                        : { color: "var(--accent-gold)", borderColor: "transparent", opacity: 0.6 }
                      }
                    >
                      <BIcon size={13} />
                      {label}
                    </Link>
                  );
                })}
                <div className="w-px my-2 flex-shrink-0" style={{ background: "var(--border)" }} />
              </>
            )}

            {/* Priority brewery tabs */}
            {ALL_NAV_ITEMS.filter(item => MOBILE_PRIORITY_HREFS.includes(item.href)).map(({ href, label, icon: Icon }) => {
              const fullHref = `/brewery-admin/${activeBreweryId}${href}`;
              const active = isItemActive(href);
              return (
                <Link
                  key={href}
                  href={fullHref}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0"
                  style={active
                    ? { color: "var(--accent-gold)", borderColor: "var(--accent-gold)" }
                    : { color: "var(--text-muted)", borderColor: "transparent" }
                  }
                >
                  <Icon size={13} />
                  {label}
                </Link>
              );
            })}

            {/* "More" pill */}
            <button
              onClick={() => setMoreOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0"
              style={{
                color: ALL_NAV_ITEMS.some(item => !MOBILE_PRIORITY_HREFS.includes(item.href) && isItemActive(item.href))
                  ? "var(--accent-gold)"
                  : "var(--text-muted)",
                borderColor: ALL_NAV_ITEMS.some(item => !MOBILE_PRIORITY_HREFS.includes(item.href) && isItemActive(item.href))
                  ? "var(--accent-gold)"
                  : "transparent",
              }}
            >
              <MoreHorizontal size={13} />
              More
            </button>
          </div>
        </div>
      </div>

      {/* Mobile "More" bottom sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-[60]"
              style={{ background: "rgba(0,0,0,0.5)" }}
              onClick={() => setMoreOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-[61] rounded-t-2xl border-t max-h-[75vh] overflow-y-auto"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {/* Sheet header */}
              <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <span className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>All Pages</span>
                <button onClick={() => setMoreOpen(false)} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>
                  <X size={18} />
                </button>
              </div>
              {/* Grouped items */}
              <div className="px-3 py-3 space-y-4">
                {NAV_GROUPS.filter(g => g.id !== "overview").map(group => (
                  <div key={group.id}>
                    <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                      {group.label}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map(({ href, label, icon: Icon }) => {
                        const fullHref = `/brewery-admin/${activeBreweryId}${href}`;
                        const active = isItemActive(href);
                        return (
                          <Link
                            key={href}
                            href={fullHref}
                            onClick={() => setMoreOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                              active ? "font-semibold" : "hover:opacity-80"
                            )}
                            style={active
                              ? { background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)", color: "var(--accent-gold)" }
                              : { color: "var(--text-secondary)" }
                            }
                          >
                            <Icon size={16} />
                            {label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {/* Safe area spacer for iOS */}
              <div className="h-8" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
