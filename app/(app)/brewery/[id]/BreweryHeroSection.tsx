"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Beer } from "lucide-react";
import type { Brewery, BreweryVisit } from "@/types/database";
import { breweryTransitionName } from "@/lib/view-transitions";
import BreweryCheckinButton from "@/components/session/BreweryCheckinButton";
import { FollowBreweryButton } from "@/components/brewery/FollowBreweryButton";

interface BreweryHeroSectionProps {
  brewery: Brewery;
  userVisit: BreweryVisit | null;
  gradient: string;
  isAuthenticated?: boolean;
  returnPath?: string;
}

export function BreweryHeroSection({
  brewery,
  userVisit,
  gradient,
  isAuthenticated = true,
  returnPath,
}: BreweryHeroSectionProps) {
  return (
    <div className="relative h-72 sm:h-96">
      <div
        className="absolute inset-0"
        style={!brewery.cover_image_url ? { background: gradient } : undefined}
      >
        {brewery.cover_image_url && (
          <Image
            src={brewery.cover_image_url}
            alt={brewery.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/60 to-[var(--bg)]/20" />

      {isAuthenticated && (
        <div className="absolute top-4 left-4">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-white/70 hover:text-white bg-black/30 backdrop-blur-sm px-3 py-2 rounded-xl text-sm transition-colors"
          >
            <MapPin size={14} />
            Explore
          </Link>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-6">
        {brewery.brewery_type && (
          <span className="text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider block mb-1">
            {brewery.brewery_type}
          </span>
        )}
        <h1
          className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg"
          style={breweryTransitionName(brewery.id)}
        >
          {brewery.name}
        </h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-white/80">
          <span className="flex items-center gap-1">
            <MapPin size={13} />
            {brewery.city}
            {brewery.state ? `, ${brewery.state}` : ""}
          </span>
          {userVisit && (
            <span className="flex items-center gap-1 text-[var(--accent-gold)]">
              ✓ {userVisit.total_visits} visit{userVisit.total_visits > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {isAuthenticated ? (
            <>
              <BreweryCheckinButton brewery={brewery} />
              <FollowBreweryButton breweryId={brewery.id} />
              <Link
                href={`/hop-route/new?brewery=${brewery.id}&city=${encodeURIComponent(brewery.city ?? "")}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono border transition-colors"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                <Beer size={12} /> Start a HopRoute here
              </Link>
            </>
          ) : (
            <Link
              href={`/signup?next=${encodeURIComponent(returnPath ?? "/")}`}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              <Beer size={14} />
              Check In Here — Sign Up Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
