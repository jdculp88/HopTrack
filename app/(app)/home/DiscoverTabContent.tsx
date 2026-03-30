"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Compass, Beer } from "lucide-react";
import {
  BeerOfTheWeekCard,
  type FeaturedBeer,
} from "@/components/social/BeerOfTheWeekCard";
import {
  TrendingCard,
  BreweryReviewCard,
  EventCard,
  SeasonalBeersScroll,
  CuratedCollectionsList,
  type TrendingReview,
  type BreweryReviewItem,
  type EventItem,
  type SeasonalBeer,
  type CuratedCollection,
} from "@/components/social/DiscoveryCard";
import type { NewBrewery, RecommendedBeer } from "./HomeFeed";
import { RecommendationsScroll } from "@/components/social/RecommendationsScroll";

export interface CommunityContent {
  featuredBeers: FeaturedBeer[];
  topReviews: TrendingReview[];
  breweryReviews: BreweryReviewItem[];
  upcomingEvents: EventItem[];
  newBreweries: NewBrewery[];
  seasonalBeers?: SeasonalBeer[];
  curatedCollections?: CuratedCollection[];
}

// Consistent section label — JetBrains Mono, uppercase, tracked
function SectionLabel({ label, gold }: { label: string; gold?: boolean }) {
  return (
    <p
      className="text-[10px] font-mono uppercase tracking-widest px-1 font-medium"
      style={{ color: gold ? "var(--accent-gold)" : "var(--text-muted)" }}
    >
      {label}
    </p>
  );
}

export function DiscoverTabContent({
  communityContent,
  hasCommunityContent,
  recommendations,
}: {
  communityContent?: CommunityContent;
  hasCommunityContent: boolean;
  recommendations?: RecommendedBeer[];
}) {
  const hasNewBreweries = (communityContent?.newBreweries?.length ?? 0) > 0;
  const effectivelyEmpty = !hasCommunityContent && !hasNewBreweries;

  if (effectivelyEmpty || !communityContent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 space-y-5"
      >
        <span className="text-6xl block">🍶</span>
        <div className="space-y-2">
          <h3
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            The cellar is being restocked.
          </h3>
          <p
            className="max-w-xs mx-auto text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Fresh recommendations loading soon.
          </p>
        </div>
        <Link
          href="/explore"
          className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
        >
          <Compass size={15} />
          Explore Breweries
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan a HopRoute — hero CTA */}
      <Link href="/hop-route/new" className="block">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="card-bg-hoproute rounded-2xl p-5 border"
          style={{ borderColor: "color-mix(in srgb, var(--accent-gold) 30%, transparent)" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Beer size={16} style={{ color: "var(--accent-gold)" }} />
                <span
                  className="text-[10px] font-mono uppercase tracking-widest"
                  style={{ color: "var(--accent-gold)" }}
                >
                  New
                </span>
              </div>
              <p className="font-display text-lg font-bold text-[var(--text-primary)]">
                Plan a HopRoute
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                AI-powered brewery crawl planner. Tell us where and when — we
                build your night.
              </p>
            </div>
            <div
              className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
              }}
            >
              🗺️
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Beer of the Week */}
      {communityContent.featuredBeers.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="Beer of the Week" gold />
          <BeerOfTheWeekCard beer={communityContent.featuredBeers[0]} index={0} />
        </div>
      )}

      {/* For You — Personalized Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <RecommendationsScroll beers={recommendations} />
      )}

      {/* Trending beer reviews */}
      {communityContent.topReviews.length > 0 && (
        <div className="space-y-2">
          <TrendingCard reviews={communityContent.topReviews} />
        </div>
      )}

      {/* Upcoming events */}
      {communityContent.upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="Happening Soon" />
          {communityContent.upcomingEvents.slice(0, 3).map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}

      {/* Community brewery reviews */}
      {communityContent.breweryReviews.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="Community Reviews" />
          {communityContent.breweryReviews.slice(0, 4).map((review, i) => (
            <BreweryReviewCard key={review.id} review={review} index={i} />
          ))}
        </div>
      )}

      {/* New Breweries */}
      {communityContent.newBreweries && communityContent.newBreweries.length > 0 && (
        <div className="space-y-2">
          <SectionLabel label="New on HopTrack" />
          <div className="grid grid-cols-2 gap-2">
            {communityContent.newBreweries.slice(0, 6).map((brewery, i) => (
              <motion.div
                key={brewery.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.28 }}
              >
                <Link href={`/brewery/${brewery.id}`}>
                  <div
                    className="p-3 rounded-xl h-full"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">🍻</span>
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {brewery.name}
                      </p>
                    </div>
                    {(brewery.city || brewery.state) && (
                      <p
                        className="text-[10px] truncate"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {[brewery.city, brewery.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {brewery.type && (
                      <span
                        className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full"
                        style={{
                          background:
                            "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                          color: "var(--accent-gold)",
                        }}
                      >
                        {brewery.type}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center pt-1">
            <Link
              href="/explore"
              className="text-xs font-medium"
              style={{ color: "var(--accent-gold)" }}
            >
              Explore all breweries →
            </Link>
          </div>
        </div>
      )}

      {/* Seasonal & Limited */}
      {communityContent.seasonalBeers && communityContent.seasonalBeers.length > 0 && (
        <SeasonalBeersScroll beers={communityContent.seasonalBeers} />
      )}

      {/* Curated Collections */}
      {communityContent.curatedCollections &&
        communityContent.curatedCollections.length > 0 && (
          <CuratedCollectionsList collections={communityContent.curatedCollections} />
        )}
    </div>
  );
}
