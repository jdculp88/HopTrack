"use client";

// BreweryDetailClient — Sprint 160 (The Flow)
// Client container for brewery detail 5-tab restructure. Sticky tabs,
// URL-synced via ?tab=, dynamic tab hiding based on data presence.

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Globe, Phone, Star, Users, TrendingUp, Beer, CheckCheck, GlassWater } from "lucide-react";
import { getStyleVars } from "@/lib/beerStyleColors";
import { BeerStyleBadge } from "@/components/ui/BeerStyleBadge";
import { PillTabs, type PillTab } from "@/components/ui/PillTabs";
import { useTabUrlSync } from "@/hooks/useTabUrlSync";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { transition } from "@/lib/animation";
import { InstagramIcon, FacebookIcon, XTwitterIcon } from "@/components/ui/SocialIcons";
import { formatPhone } from "@/lib/brewery-utils";
import { BreweryChallenges } from "@/components/brewery/BreweryChallenges";
import { MugClubSection } from "@/components/brewery/MugClubSection";
import { LoyaltyStampCard } from "@/components/loyalty/LoyaltyStampCard";
import { BrandLoyaltyStampCard } from "@/components/loyalty/BrandLoyaltyStampCard";
import { ClosedBreweryBanner } from "@/components/brewery/ClosedBreweryBanner";
import { BreweryRatingHeader } from "@/components/brewery/BreweryRatingHeader";
import { BreweryTapListSection } from "./BreweryTapListSection";
import { BreweryMenusSection } from "@/components/brewery/BreweryMenusSection";
import { BreweryEventsSection } from "./BreweryEventsSection";
import { BreweryReviewsSection } from "./BreweryReviewsSection";
import { AuthGate } from "@/components/ui/AuthGate";
import { StorefrontGate } from "@/components/ui/StorefrontGate";
import { DrinkingNowStrip } from "@/components/brewery/DrinkingNowStrip";
import type { Brewery, BreweryVisit, Profile } from "@/types/database";

type BreweryTab = "about" | "taplist" | "community" | "events" | "loyalty";

// ─── Data shapes ─────────────────────────────────────────────────────────────

interface ActiveFriendSession {
  id: string;
  user_id: string;
  started_at: string;
  profile: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  beer_logs: { id: string }[];
}

interface BreweryEvent {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: string;
  description: string | null;
}

interface TopVisitor extends BreweryVisit {
  profile: Profile;
}

export interface BreweryDetailClientProps {
  brewery: Brewery;
  userVisit: BreweryVisit | null;
  isAuthenticated: boolean;
  currentUserId: string | null;
  returnPath: string;
  hasAdmin: boolean;
  hasStorefront: boolean;
  isClosed: boolean;

  // Stats
  totalCheckins: number;
  uniqueVisitors: number;
  avgRating: number | null;
  mostPopularBeer: { name: string; style: string | null; count: number } | null;
  beersOnTap: number;

  // Community
  friendsHere: ActiveFriendSession[];
  topVisitors: TopVisitor[];

  // Tap List
  beers: any[];
  breweryMenus: any[];

  // Events + Challenges
  upcomingEvents: BreweryEvent[];
  activeChallenges: any[];
  myParticipations: any[];
  myEventRsvps: Record<string, { status: string }>;

  // Loyalty
  mugClubs: any[];
  myMugMemberships: any[];
  loyaltyPrograms: any[] | null;
  myLoyaltyCards: Record<string, { stamps: number; lifetime_stamps: number }>;
  brandName: string | null;
  hasBrandLoyalty: boolean;
}

export function BreweryDetailClient(props: BreweryDetailClientProps) {
  const {
    brewery,
    isAuthenticated,
    currentUserId,
    returnPath,
    hasAdmin,
    hasStorefront,
    isClosed,
    totalCheckins,
    uniqueVisitors,
    avgRating,
    mostPopularBeer,
    beersOnTap,
    friendsHere,
    topVisitors,
    beers,
    breweryMenus,
    upcomingEvents,
    activeChallenges,
    myParticipations,
    myEventRsvps,
    mugClubs,
    myMugMemberships,
    loyaltyPrograms,
    myLoyaltyCards,
    brandName,
    hasBrandLoyalty,
  } = props;

  const reducedMotion = useReducedMotion();

  // Compute which tabs should be visible based on data presence
  const hasEvents = upcomingEvents.length > 0 || activeChallenges.length > 0;
  const hasLoyalty = mugClubs.length > 0 || hasBrandLoyalty || (loyaltyPrograms?.length ?? 0) > 0;

  const availableTabs: readonly BreweryTab[] = [
    "about",
    "taplist",
    "community",
    ...(hasEvents ? (["events"] as const) : ([] as const)),
    ...(hasLoyalty ? (["loyalty"] as const) : ([] as const)),
  ] as const;

  const [activeTab, setActiveTab] = useTabUrlSync<BreweryTab>({
    param: "tab",
    defaultTab: "about",
    tabs: availableTabs,
  });
  useScrollMemory(activeTab);

  // Precompute friend elapsed times. Uses useState initializer so "now" is
  // captured once on mount (React compiler considers initializers pure-ish).
  const [mountTime] = useState(() => Date.now());
  const friendsHereWithElapsed = useMemo(() => {
    return friendsHere.map((s) => {
      const diffMs = mountTime - new Date(s.started_at).getTime();
      const mins = Math.floor(diffMs / 60000);
      const elapsed = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
      const beerCount = Array.isArray(s.beer_logs) ? s.beer_logs.length : 0;
      return { session: s, elapsed, beerCount };
    });
  }, [friendsHere, mountTime]);

  const pillTabs: PillTab<BreweryTab>[] = [
    { key: "about", label: "About" },
    { key: "taplist", label: "Tap List", count: beersOnTap || undefined },
    { key: "community", label: "Community" },
    { key: "events", label: "Events", hidden: !hasEvents },
    { key: "loyalty", label: "Loyalty", hidden: !hasLoyalty },
  ];

  const id = brewery.id;

  return (
    <div>
      {/* Sticky tab bar */}
      <div className="px-4 sm:px-6 mb-6">
        <PillTabs
          tabs={pillTabs}
          value={activeTab}
          onChange={setActiveTab}
          ariaLabel="Brewery sections"
          variant="underline"
          snapScroll
          sticky={{ top: 0 }}
        />
      </div>

      <div className="px-4 sm:px-6 pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={reducedMotion ? { duration: 0 } : transition.fast}
          >
            {/* ─── ABOUT TAB ─────────────────────────────────────────────── */}
            {activeTab === "about" && (
              <div className="space-y-8">
                {/* Closed banner */}
                {isClosed && <ClosedBreweryBanner breweryName={brewery.name} />}

                {/* Contact */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {brewery.website_url && (
                    <a
                      href={brewery.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[var(--accent-gold)] hover:underline"
                    >
                      <Globe size={14} /> Website
                    </a>
                  )}
                  {brewery.phone && (
                    <a
                      href={`tel:${brewery.phone}`}
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Phone size={14} />
                      {formatPhone(brewery.phone)}
                    </a>
                  )}
                  {brewery.instagram_url && (
                    <a
                      href={brewery.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <InstagramIcon size={14} /> Instagram
                    </a>
                  )}
                  {brewery.facebook_url && (
                    <a
                      href={brewery.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <FacebookIcon size={14} /> Facebook
                    </a>
                  )}
                  {brewery.twitter_url && (
                    <a
                      href={brewery.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <XTwitterIcon size={14} /> X
                    </a>
                  )}
                  {brewery.untappd_url && (
                    <a
                      href={brewery.untappd_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <Beer size={14} /> Untappd
                    </a>
                  )}
                </div>

                {/* Description */}
                {brewery.description && (
                  <p className="text-[var(--text-secondary)] leading-relaxed">{brewery.description}</p>
                )}

                {/* Stats — profile-style cards with amber top bars */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  role="region"
                  aria-label="Brewery statistics"
                >
                  {[
                    { value: totalCheckins.toLocaleString(), label: "Visits", icon: CheckCheck },
                    { value: uniqueVisitors.toLocaleString(), label: "Visitors", icon: Users },
                    { value: avgRating != null ? avgRating.toFixed(1) : "—", label: "Avg Rating", icon: Star },
                    { value: beersOnTap, label: "On Tap", icon: Beer },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[14px] overflow-hidden"
                      style={{
                        background: "var(--card-bg)",
                        border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, var(--border))",
                      }}
                    >
                      <div className="h-[3px]" style={{ background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber, var(--accent-gold)))" }} />
                      <div className="p-3.5">
                        <div
                          className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-2"
                          style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, var(--surface-2))" }}
                        >
                          <stat.icon size={16} style={{ color: "var(--accent-gold)" }} />
                        </div>
                        <p className="font-mono font-bold text-[28px] leading-none" style={{ color: stat.label === "Avg Rating" && avgRating != null ? "var(--accent-gold)" : "var(--text-primary)" }}>
                          {stat.value}
                        </p>
                        <p className="text-[9px] font-mono uppercase mt-1.5" style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}>
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Top Beer — favorite beer style card */}
                {mostPopularBeer ? (() => {
                  const styleVars = getStyleVars(mostPopularBeer.style);
                  return (
                    <div
                      className="rounded-[14px] overflow-hidden"
                      style={{
                        background: "var(--card-bg)",
                        border: "1px solid color-mix(in srgb, var(--accent-gold) 25%, var(--border))",
                      }}
                    >
                      <div className="h-[3px]" style={{ background: "linear-gradient(to right, var(--accent-gold), var(--accent-amber, var(--accent-gold)))" }} />
                      <div className="flex items-center gap-3.5 p-4">
                        {/* Glass thumbnail — style tinted */}
                        <div
                          className="w-14 h-14 rounded-[14px] flex-shrink-0 flex items-center justify-center"
                          style={{
                            background: `color-mix(in srgb, ${styleVars.primary} 12%, var(--surface-2))`,
                            border: `1px solid color-mix(in srgb, ${styleVars.primary} 18%, transparent)`,
                          }}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={styleVars.primary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                            <path d="M7 3h10l-1.5 15a2 2 0 0 1-2 1.8h-3a2 2 0 0 1-2-1.8L7 3z"/>
                            <path d="M8 3c0 0 .5 2 4 2s4-2 4-2"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <TrendingUp size={10} style={{ color: "var(--accent-gold)" }} />
                            <span className="text-[9px] font-mono uppercase tracking-[0.12em] font-bold" style={{ color: "var(--accent-gold)" }}>
                              Top Beer
                            </span>
                          </div>
                          <p className="font-display font-bold text-base text-[var(--text-primary)] truncate">
                            {mostPopularBeer.name}
                          </p>
                          {mostPopularBeer.style && (
                            <div className="mt-0.5">
                              <BeerStyleBadge style={mostPopularBeer.style} size="xs" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="font-mono text-2xl font-bold leading-none" style={{ color: "var(--accent-gold)" }}>
                            {mostPopularBeer.count}
                          </span>
                          <span className="text-[10px] font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                            pours
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })() : null}

                {/* Explore prompt — audit #17: content below stats */}
                {beersOnTap > 0 && (
                  <div
                    className="rounded-[14px] border p-4 flex items-center gap-4 cursor-pointer transition-colors hover:border-[var(--accent-gold)]/30"
                    style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
                    onClick={() => setActiveTab("taplist")}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className="w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--warm-bg, var(--surface-2))" }}
                    >
                      <span className="text-xl">🍺</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        Explore {beersOnTap} beers on tap
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        Browse the full tap list, ratings, and styles →
                      </p>
                    </div>
                  </div>
                )}

                {/* Claim CTA */}
                {!hasAdmin && (
                  <div
                    className="border rounded-[14px] p-6 text-center space-y-3"
                    style={{ background: "var(--surface, var(--bg))", border: "1.5px dashed var(--border)" }}
                  >
                    <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto"
                         style={{ background: "var(--warm-bg, var(--surface-2))" }}>
                      <span className="text-xl">🏠</span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[var(--text-primary)]">Own this brewery?</h3>
                    <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                      Claim your listing to manage your tap list, run loyalty programs, and see analytics.
                    </p>
                    <Link
                      href={`/brewery-admin/claim?brewery_id=${id}`}
                      className="inline-flex items-center gap-2 border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[var(--bg)] font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
                    >
                      Is this your brewery? Claim it →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAP LIST TAB ──────────────────────────────────────────── */}
            {activeTab === "taplist" && (
              <div className="space-y-8">
                {isAuthenticated || hasStorefront ? (
                  <BreweryTapListSection
                    beers={beers as any[]}
                    breweryId={id}
                    breweryName={brewery.name}
                    menuImageUrl={brewery.menu_image_url ?? null}
                  />
                ) : (
                  <StorefrontGate isUnlocked={hasStorefront} sectionName="Tap List" breweryId={id}>
                    <BreweryTapListSection
                      beers={beers as any[]}
                      breweryId={id}
                      breweryName={brewery.name}
                      menuImageUrl={brewery.menu_image_url ?? null}
                    />
                  </StorefrontGate>
                )}

                {isAuthenticated || hasStorefront ? (
                  <BreweryMenusSection menus={breweryMenus} />
                ) : breweryMenus.length > 0 ? (
                  <StorefrontGate isUnlocked={hasStorefront} sectionName="Menus & Food" breweryId={id}>
                    <BreweryMenusSection menus={breweryMenus} />
                  </StorefrontGate>
                ) : null}
              </div>
            )}

            {/* ─── COMMUNITY TAB ─────────────────────────────────────────── */}
            {activeTab === "community" && (
              <div className="space-y-8">
                {/* Friends Here Now */}
                {isAuthenticated && friendsHere.length > 0 && (
                  <div className="card-bg-live border border-[var(--accent-gold)]/20 rounded-[14px] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                        style={{ background: "var(--live-green)" }}
                      />
                      <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">Friends Here Now</h2>
                      <span className="text-xs font-mono text-[var(--accent-gold)] ml-auto">
                        {friendsHere.length} drinking
                      </span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1 snap-x">
                      {friendsHereWithElapsed.map(({ session: s, elapsed, beerCount }) => {
                        return (
                          <Link
                            key={s.id}
                            href={`/profile/${s.profile?.username}`}
                            className="flex flex-col items-center gap-2 p-3 rounded-[14px] border flex-shrink-0 w-[100px] hover:border-[var(--accent-gold)]/40 transition-colors"
                            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
                          >
                            <div className="relative">
                              <div
                                className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center font-bold text-sm"
                                style={{ color: "var(--accent-gold)" }}
                              >
                                {s.profile?.avatar_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={s.profile.avatar_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  (s.profile?.display_name ?? s.profile?.username ?? "?")[0].toUpperCase()
                                )}
                              </div>
                              <span
                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                                style={{ background: "var(--live-green)", borderColor: "var(--surface)" }}
                              />
                            </div>
                            <p
                              className="text-xs font-medium text-center truncate w-full"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {(s.profile?.display_name ?? s.profile?.username ?? "Friend").split(" ")[0]}
                            </p>
                            <p
                              className="text-[10px] font-mono text-center"
                              style={{ color: "var(--live-green)" }}
                            >
                              {beerCount} pours · {elapsed}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Drinking Now realtime presence */}
                <DrinkingNowStrip breweryId={id} />

                {/* Brewery rating */}
                <BreweryRatingHeader
                  breweryId={id}
                  currentUserId={currentUserId}
                  isAuthenticated={isAuthenticated}
                  returnPath={returnPath}
                />

                {/* Reviews + top visitors */}
                <BreweryReviewsSection
                  breweryId={id}
                  currentUserId={currentUserId}
                  topVisitors={topVisitors}
                  isAuthenticated={isAuthenticated}
                  returnPath={returnPath}
                />
              </div>
            )}

            {/* ─── EVENTS TAB ────────────────────────────────────────────── */}
            {activeTab === "events" && (
              <div className="space-y-8">
                {activeChallenges.length > 0 &&
                  (isAuthenticated || hasStorefront ? (
                    <BreweryChallenges
                      challenges={activeChallenges}
                      myParticipations={myParticipations}
                      isAuthenticated={isAuthenticated}
                      returnPath={returnPath}
                    />
                  ) : (
                    <StorefrontGate isUnlocked={hasStorefront} sectionName="Challenges" breweryId={id}>
                      <BreweryChallenges
                        challenges={activeChallenges}
                        myParticipations={[]}
                        isAuthenticated={false}
                        returnPath={returnPath}
                      />
                    </StorefrontGate>
                  ))}

                {isAuthenticated || hasStorefront ? (
                  <BreweryEventsSection
                    events={upcomingEvents}
                    myEventRsvps={myEventRsvps}
                    isAuthenticated={isAuthenticated}
                    returnPath={returnPath}
                  />
                ) : upcomingEvents.length > 0 ? (
                  <StorefrontGate isUnlocked={hasStorefront} sectionName="Events" breweryId={id}>
                    <BreweryEventsSection
                      events={upcomingEvents}
                      myEventRsvps={{}}
                      isAuthenticated={false}
                      returnPath={returnPath}
                    />
                  </StorefrontGate>
                ) : null}
              </div>
            )}

            {/* ─── LOYALTY TAB ───────────────────────────────────────────── */}
            {activeTab === "loyalty" && (
              <div className="space-y-8">
                {mugClubs.length > 0 &&
                  (isAuthenticated || hasStorefront ? (
                    <MugClubSection
                      clubs={mugClubs}
                      myMemberships={myMugMemberships}
                      breweryId={brewery.id}
                      isAuthenticated={isAuthenticated}
                      returnPath={returnPath}
                    />
                  ) : (
                    <StorefrontGate isUnlocked={hasStorefront} sectionName="Mug Clubs" breweryId={id}>
                      <MugClubSection
                        clubs={mugClubs}
                        myMemberships={[]}
                        breweryId={brewery.id}
                        isAuthenticated={false}
                        returnPath={returnPath}
                      />
                    </StorefrontGate>
                  ))}

                {hasBrandLoyalty && brewery.brand_id && brandName && (
                  <div>
                    <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-3">
                      {brandName} Passport
                    </h2>
                    {isAuthenticated ? (
                      <BrandLoyaltyStampCard
                        brandId={brewery.brand_id}
                        brandName={brandName}
                        breweryId={brewery.id}
                        breweryName={brewery.name}
                      />
                    ) : hasStorefront ? (
                      <AuthGate isAuthenticated={false} featureName="track loyalty stamps" returnPath={returnPath}>
                        <BrandLoyaltyStampCard
                          brandId={brewery.brand_id}
                          brandName={brandName}
                          breweryId={brewery.id}
                          breweryName={brewery.name}
                        />
                      </AuthGate>
                    ) : (
                      <StorefrontGate
                        isUnlocked={hasStorefront}
                        sectionName="Loyalty Program"
                        breweryId={id}
                      >
                        <BrandLoyaltyStampCard
                          brandId={brewery.brand_id}
                          brandName={brandName}
                          breweryId={brewery.id}
                          breweryName={brewery.name}
                        />
                      </StorefrontGate>
                    )}
                  </div>
                )}

                {!hasBrandLoyalty && (loyaltyPrograms ?? []).length > 0 && (
                  <div>
                    <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[var(--text-primary)] mb-3">
                      Loyalty Program
                    </h2>
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        {(loyaltyPrograms ?? []).map((program: any) => (
                          <LoyaltyStampCard
                            key={program.id}
                            program={program}
                            card={myLoyaltyCards[program.id] ?? null}
                            breweryName={brewery.name}
                            breweryId={brewery.id}
                          />
                        ))}
                      </div>
                    ) : hasStorefront ? (
                      <AuthGate isAuthenticated={false} featureName="earn loyalty stamps" returnPath={returnPath}>
                        <div className="space-y-4">
                          {(loyaltyPrograms ?? []).map((program: any) => (
                            <LoyaltyStampCard
                              key={program.id}
                              program={program}
                              card={null}
                              breweryName={brewery.name}
                              breweryId={brewery.id}
                            />
                          ))}
                        </div>
                      </AuthGate>
                    ) : (
                      <StorefrontGate
                        isUnlocked={hasStorefront}
                        sectionName="Loyalty Program"
                        breweryId={id}
                      >
                        <div className="space-y-4">
                          {(loyaltyPrograms ?? []).map((program: any) => (
                            <LoyaltyStampCard
                              key={program.id}
                              program={program}
                              card={null}
                              breweryName={brewery.name}
                              breweryId={brewery.id}
                            />
                          ))}
                        </div>
                      </StorefrontGate>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
