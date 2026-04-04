"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { MapPin, ExternalLink } from "lucide-react";
import { cardHover } from "@/lib/animation";
import Link from "next/link";

interface AdData {
  id: string;
  brewery_id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  cta_url: string | null;
  cta_label: string;
  brewery: {
    name: string;
    city: string | null;
    state: string | null;
    logo_url: string | null;
  };
}

export function BreweryAdFeedCard({ ad }: { ad: AdData }) {
  const impressionSent = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Track impression via intersection observer
  useEffect(() => {
    if (!cardRef.current || impressionSent.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressionSent.current) {
          impressionSent.current = true;
          fetch("/api/ads/impression", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ad_id: ad.id }),
          }).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [ad.id]);

  function handleClick() {
    fetch("/api/ads/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ad_id: ad.id }),
    }).catch(() => {});
  }

  return (
    <motion.div
      ref={cardRef}
      {...cardHover}
      className="rounded-2xl overflow-hidden border"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Sponsored badge */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-md"
          style={{
            color: "var(--text-muted)",
            background: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
          }}
        >
          Sponsored
        </span>
      </div>

      {/* Image */}
      {ad.image_url && (
        <div className="aspect-[2/1] overflow-hidden">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Brewery info */}
        <div className="flex items-center gap-2">
          {ad.brewery.logo_url ? (
            <img
              src={ad.brewery.logo_url}
              alt=""
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              {ad.brewery.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {ad.brewery.name}
            </p>
            {ad.brewery.city && (
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                <MapPin size={10} />
                {ad.brewery.city}{ad.brewery.state ? `, ${ad.brewery.state}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Ad content */}
        <div>
          <h3 className="font-display font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
            {ad.title}
          </h3>
          {ad.body && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {ad.body}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <Link
            href={ad.cta_url || `/brewery/${ad.brewery_id}`}
            onClick={handleClick}
            target={ad.cta_url ? "_blank" : undefined}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {ad.cta_label || "Visit"}
            {ad.cta_url && <ExternalLink size={13} />}
          </Link>
          <Link
            href={`/brewery/${ad.brewery_id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            View Brewery
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
