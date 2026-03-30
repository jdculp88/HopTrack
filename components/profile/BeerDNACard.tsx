"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Check } from "lucide-react";
import { getStyleVars } from "@/lib/beerStyleColors";

// Match HomeFeed's StyleDNAEntry shape (avgRating can be null)
interface StyleDNAEntry {
  style: string;
  count: number;
  avgRating: number | null;
}

interface BeerDNACardProps {
  styleDNA: StyleDNAEntry[];
  username: string;
}

function getPersonality(styleDNA: StyleDNAEntry[]): { label: string; emoji: string; tagline: string } {
  if (!styleDNA.length) return { label: "The Explorer", emoji: "🧭", tagline: "Every pour is a new adventure" };

  const top = styleDNA[0].style.toLowerCase();
  const totalBeers = styleDNA.reduce((s, e) => s + e.count, 0);
  const topShare = styleDNA[0].count / totalBeers;

  // Dominant style detection
  if (top.includes("ipa") || top.includes("pale ale") || top.includes("hop")) {
    return { label: "The Hophead", emoji: "🌿", tagline: "If it's not bitter, it's not better" };
  }
  if (top.includes("stout") || top.includes("porter") || top.includes("dark")) {
    return { label: "The Dark Arts", emoji: "🌑", tagline: "Life's too short for light beer" };
  }
  if (top.includes("sour") || top.includes("gose") || top.includes("kettle") || top.includes("lambic")) {
    return { label: "The Sour Seeker", emoji: "⚡", tagline: "Pucker up — complexity is the point" };
  }
  if (top.includes("lager") || top.includes("pilsner") || top.includes("pils") || top.includes("kölsch")) {
    return { label: "The Purist", emoji: "✨", tagline: "Clean lines. Crisp finish. No compromises" };
  }
  if (top.includes("wheat") || top.includes("hefeweizen") || top.includes("witbier") || top.includes("saison")) {
    return { label: "The Farmhouse Fan", emoji: "🌾", tagline: "Yeast is the real magic ingredient" };
  }
  if (top.includes("belgian") || top.includes("abbey") || top.includes("tripel") || top.includes("dubbel")) {
    return { label: "The Belgian Explorer", emoji: "🏰", tagline: "Complexity brewed over centuries" };
  }

  // Mixed taste — diverse palate
  if (topShare < 0.4 && styleDNA.length >= 4) {
    return { label: "The Explorer", emoji: "🧭", tagline: "No style too strange, no hop too wild" };
  }

  return { label: "The Connoisseur", emoji: "🍺", tagline: "Quality in every pour" };
}

export function BeerDNACard({ styleDNA, username }: BeerDNACardProps) {
  const [copied, setCopied] = useState(false);

  if (!styleDNA || styleDNA.length < 3) return null;

  const personality = getPersonality(styleDNA);
  const topStyles = styleDNA.slice(0, 5);
  const totalBeers = styleDNA.reduce((s, e) => s + e.count, 0);
  // Drive the color wash from actual top 3 styles
  const dnaC1 = getStyleVars(topStyles[0]?.style ?? "").primary;
  const dnaC2 = getStyleVars(topStyles[1]?.style ?? "").primary;
  const dnaC3 = getStyleVars(topStyles[2]?.style ?? "").primary;
  const shareText = `My Beer DNA on HopTrack: "${personality.label}" 🍺 — ${personality.tagline}. Top style: ${topStyles[0]?.style}. Track yours at hoptrack.beer`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "My Beer DNA", text: shareText, url: `https://hoptrack.beer/profile/${username}` });
      } catch (_) {
        // cancelled — no-op
      }
      return;
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // ignore
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="card-bg-taste-dna rounded-2xl p-5 relative overflow-hidden"
      style={{
        border: "1px solid var(--border)",
        "--dna-c1": dnaC1,
        "--dna-c2": dnaC2,
        "--dna-c3": dnaC3,
      } as React.CSSProperties}
    >

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: "var(--accent-gold)" }}>
            Your Beer DNA
          </p>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{personality.emoji}</span>
            <h3 className="font-display text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {personality.label}
            </h3>
          </div>
          <p className="text-xs mt-1 italic" style={{ color: "var(--text-secondary)" }}>
            {personality.tagline}
          </p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
          style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          aria-label="Share your Beer DNA"
        >
          {copied ? <Check size={13} /> : <Share2 size={13} />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>

      {/* Style bars */}
      <div className="space-y-2">
        {topStyles.map((entry, i) => (
          <div key={entry.style} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                {entry.style}
              </span>
              <span className="text-[10px] font-mono" style={{ color: "var(--accent-gold)" }}>
                {entry.count} beer{entry.count !== 1 ? "s" : ""}
                {entry.avgRating != null ? ` · ★ ${entry.avgRating.toFixed(1)}` : ""}
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--accent-gold) 12%, var(--surface-2))" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(entry.count / topStyles[0].count) * 100}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                className="h-full rounded-full"
                style={{ background: getStyleVars(entry.style).primary }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] font-mono mt-3" style={{ color: "var(--accent-gold)" }}>
        Based on {totalBeers} beer{totalBeers !== 1 ? "s" : ""} logged · hoptrack.beer
      </p>
    </motion.div>
  );
}
