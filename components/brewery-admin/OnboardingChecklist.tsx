// Onboarding Checklist — Sprint 145 (The Revenue Push)
// Owner: Dakota (Dev Lead)
// Wireframe: Finley (Product Designer)
//
// Persistent checklist shown on the brewery dashboard for the first 14 days.
// Each item checks real data — not just wizard completion.

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Circle, X, Camera, Beer, Gift, Eye, Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { spring, stagger } from "@/lib/animation";

interface ChecklistItem {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  complete: boolean;
}

interface OnboardingChecklistProps {
  breweryId: string;
  verifiedAt: string | null;
  hasLogo: boolean;
  beerCount: number;
  hasLoyalty: boolean;
}

const DISMISS_KEY_PREFIX = "ht-onboarding-checklist-dismissed-";

export function OnboardingChecklist({
  breweryId,
  verifiedAt,
  hasLogo,
  beerCount,
  hasLoyalty,
}: OnboardingChecklistProps) {
  // Lazy useState init reads localStorage once on mount (SSR-safe via typeof check).
  // This avoids a setState-in-effect cascade and is the React Compiler-friendly pattern.
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem(`${DISMISS_KEY_PREFIX}${breweryId}`) === "true";
  });

  // Only show for breweries verified within the last 14 days
  // useMemo with verifiedAt dep stabilizes Date.now() per verifiedAt change.
  // eslint-disable-next-line react-hooks/purity, react-hooks/rules-of-hooks -- intentional time read for verification age, conditional hook is fine post-early-return
  const daysSinceVerified = useMemo(() => Math.floor(
    (Date.now() - new Date(verifiedAt ?? "").getTime()) / (1000 * 60 * 60 * 24)
  ), [verifiedAt]);
  if (!verifiedAt) return null;
  if (daysSinceVerified > 14) return null;
  if (dismissed) return null;

  const items: ChecklistItem[] = [
    {
      key: "logo",
      label: "Upload your logo",
      description: "Make your brewery page stand out",
      icon: Camera,
      href: `/brewery-admin/${breweryId}/settings`,
      complete: hasLogo,
    },
    {
      key: "beers",
      label: "Add your first beer",
      description: "Get your tap list started",
      icon: Beer,
      href: `/brewery-admin/${breweryId}/tap-list`,
      complete: beerCount > 0,
    },
    {
      key: "loyalty",
      label: "Set up a loyalty program",
      description: "Give customers a reason to come back",
      icon: Gift,
      href: `/brewery-admin/${breweryId}/loyalty`,
      complete: hasLoyalty,
    },
    {
      key: "preview",
      label: "Preview your public page",
      description: "See what customers see",
      icon: Eye,
      href: `/brewery/${breweryId}`,
      complete: hasLogo && beerCount > 0, // "complete" when they have content to show
    },
    {
      key: "board",
      label: "Launch The Board",
      description: "Put your tap list on your bar TV",
      icon: Monitor,
      href: `/brewery-admin/${breweryId}/board`,
      complete: false, // We can't easily track this — it's always a "go do it" item
    },
  ];

  const completedCount = items.filter((i) => i.complete).length;
  const allComplete = completedCount === items.length;

  const handleDismiss = () => {
    const key = `${DISMISS_KEY_PREFIX}${breweryId}`;
    localStorage.setItem(key, "true");
    setDismissed(true);
  };

  if (allComplete) return null;

  return (
    <Card padding="default">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Getting Started
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {completedCount} of {items.length} complete
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
          style={{ color: "var(--text-muted)" }}
          aria-label="Dismiss checklist"
        >
          <X size={14} />
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full rounded-full mb-4 overflow-hidden"
        style={{ background: "var(--surface-2)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--accent-gold)" }}
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / items.length) * 100}%` }}
          transition={spring.default}
        />
      </div>

      {/* Checklist items */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger.container()}
        className="space-y-1"
      >
        {items.map((item) => (
          <motion.div key={item.key} variants={stagger.item}>
            <Link
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
              style={{
                background: item.complete ? "transparent" : undefined,
              }}
            >
              {item.complete ? (
                <CheckCircle2
                  size={18}
                  style={{ color: "var(--accent-gold)" }}
                  className="shrink-0"
                />
              ) : (
                <Circle
                  size={18}
                  style={{ color: "var(--text-muted)" }}
                  className="shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm"
                  style={{
                    color: item.complete
                      ? "var(--text-muted)"
                      : "var(--text-primary)",
                    textDecoration: item.complete ? "line-through" : undefined,
                  }}
                >
                  {item.label}
                </p>
                {!item.complete && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
              {!item.complete && (
                <item.icon
                  size={14}
                  style={{ color: "var(--text-muted)" }}
                  className="shrink-0"
                />
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </Card>
  );
}
