"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Check, X, ChevronDown, ChevronUp, Loader2, ArrowUpRight } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { spring, variants } from "@/lib/animation";
import Link from "next/link";
import type { SuggestionCategory } from "@/lib/ai-promotions";

// ── Types ──────────────────────────────────────────────────────────────

interface Suggestion {
  title: string;
  description: string;
  reasoning: string;
  category: SuggestionCategory;
  confidence: number;
  estimatedImpact: string;
}

interface AISuggestionsCardProps {
  breweryId: string;
  initialSuggestions: Suggestion[];
  initialId: string | null;
  tier: string;
}

// ── Category config ─────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<SuggestionCategory, { label: string; color: string }> = {
  loyalty: { label: "Loyalty", color: "#a78bfa" },
  promotion: { label: "Promo", color: "var(--accent-gold)" },
  event: { label: "Event", color: "#22c55e" },
  "tap-list": { label: "Tap List", color: "#60a5fa" },
  pricing: { label: "Pricing", color: "#f59e0b" },
};

// ── Component ───────────────────────────────────────────────────────────

export function AISuggestionsCard({ breweryId, initialSuggestions, initialId, tier }: AISuggestionsCardProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);
  const [suggestionId, setSuggestionId] = useState<string | null>(initialId);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const isPremium = tier === "cask" || tier === "barrel";

  // Tier gate — show upgrade CTA
  if (!isPremium) {
    return (
      <Card padding="spacious" className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
          >
            <Sparkles size={18} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <CardTitle as="h3">AI Suggestions</CardTitle>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Upgrade to Cask or Barrel for AI-powered business insights
            </p>
          </div>
        </div>
        <Link
          href={`/brewery-admin/${breweryId}/billing`}
          className="inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80"
          style={{ color: "var(--accent-gold)" }}
        >
          View plans <ArrowUpRight size={12} />
        </Link>
      </Card>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/brewery/${breweryId}/ai-suggestions`, { method: "POST" });
      if (res.status === 429) {
        showToast("Generation limit reached — try again tomorrow");
        return;
      }
      const json = await res.json();
      if (json.data?.suggestions) {
        setSuggestions(json.data.suggestions);
        showToast("New suggestions generated");
      }
    } catch {
      showToast("Failed to generate — try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "accept" | "dismiss") => {
    if (!suggestionId) return;
    try {
      await fetch(`/api/brewery/${breweryId}/ai-suggestions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId, action }),
      });
      showToast(action === "accept" ? "Suggestion accepted" : "Suggestion dismissed");
    } catch {
      showToast("Failed to update");
    }
  };

  return (
    <Card padding="spacious" className="mb-6 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-3 right-3 text-xs font-medium px-3 py-1.5 rounded-xl z-10"
            style={{
              background: "color-mix(in srgb, var(--accent-gold) 15%, var(--surface))",
              color: "var(--accent-gold)",
              border: "1px solid color-mix(in srgb, var(--accent-gold) 30%, transparent)",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
          >
            <Sparkles size={18} style={{ color: "var(--accent-gold)" }} />
          </div>
          <div>
            <CardTitle as="h3">AI Suggestions</CardTitle>
            <p className="text-[10px] font-mono uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>
              Powered by HopTrack AI
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Empty state */}
      {suggestions.length === 0 && !loading && (
        <EmptyState
          emoji="🤖"
          title="Your AI advisor is ready"
          description="Generate personalized business suggestions based on your brewery data."
          action={{ label: "Generate Suggestions", onClick: handleGenerate, variant: "gold" }}
          size="sm"
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8 gap-2">
          <Loader2 size={16} className="animate-spin" style={{ color: "var(--accent-gold)" }} />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>Analyzing your data...</span>
        </div>
      )}

      {/* Suggestions list */}
      {suggestions.length > 0 && !loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06 } },
          }}
          className="space-y-3"
        >
          {suggestions.map((s, i) => {
            const cat = CATEGORY_CONFIG[s.category] ?? CATEGORY_CONFIG.promotion;
            const isExpanded = expandedIdx === i;

            return (
              <motion.div
                key={`${s.title}-${i}`}
                variants={variants.slideUp}
                transition={spring.default}
                className="rounded-xl border p-3"
                style={{
                  background: "color-mix(in srgb, var(--surface) 80%, transparent)",
                  borderColor: "var(--border)",
                }}
              >
                {/* Title row */}
                <div className="flex items-start gap-2">
                  <Pill size="xs" variant="style" styleColor={cat.color}>
                    {cat.label}
                  </Pill>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {s.title}
                    </p>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {s.description}
                    </p>
                  </div>
                </div>

                {/* Impact + confidence */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-mono" style={{ color: "#22c55e" }}>
                    {s.estimatedImpact}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                    {Math.round(s.confidence * 100)}% confidence
                  </span>
                </div>

                {/* Expandable reasoning */}
                <button
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                  className="flex items-center gap-1 mt-2 text-[10px] font-mono transition-opacity hover:opacity-70"
                  style={{ color: "var(--accent-gold)" }}
                >
                  {isExpanded ? "Hide" : "Why this?"}{" "}
                  {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={spring.snappy}
                      className="overflow-hidden"
                    >
                      <p className="text-xs mt-2 pt-2 leading-relaxed border-t" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                        {s.reasoning}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleAction("accept")}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                    style={{
                      background: "color-mix(in srgb, #22c55e 12%, transparent)",
                      color: "#22c55e",
                    }}
                  >
                    <Check size={10} /> Accept
                  </button>
                  <button
                    onClick={() => handleAction("dismiss")}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all hover:opacity-80"
                    style={{
                      background: "color-mix(in srgb, var(--text-muted) 10%, transparent)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <X size={10} /> Dismiss
                  </button>
                </div>
              </motion.div>
            );
          })}

          {/* Regenerate button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ color: "var(--accent-gold)" }}
            >
              <Sparkles size={12} /> Generate new suggestions
            </button>
          </div>
        </motion.div>
      )}
    </Card>
  );
}
