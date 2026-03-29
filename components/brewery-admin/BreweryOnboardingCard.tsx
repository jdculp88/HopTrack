"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, List, Gift, QrCode, ExternalLink } from "lucide-react";

interface Step {
  label: string;
  href: string;
  icon: typeof List;
  complete: boolean;
}

interface BreweryOnboardingCardProps {
  breweryId: string;
  hasBeers: boolean;
  hasLoyalty: boolean;
  /** Whether the brewery has generated / viewed the QR page before — default false */
  hasQr?: boolean;
  /** Whether the brewery public page has been shared — default false */
  hasShared?: boolean;
}

export default function BreweryOnboardingCard({
  breweryId,
  hasBeers,
  hasLoyalty,
  hasQr = false,
  hasShared = false,
}: BreweryOnboardingCardProps) {
  const storageKey = `hoptrack:brewery-onboarding-${breweryId}-dismissed`;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not previously dismissed
    if (!localStorage.getItem(storageKey)) {
      setVisible(true);
    }
  }, [storageKey]);

  const steps: Step[] = [
    { label: "Add your beers", href: `/brewery-admin/${breweryId}/tap-list`, icon: List, complete: hasBeers },
    { label: "Create a loyalty program", href: `/brewery-admin/${breweryId}/loyalty`, icon: Gift, complete: hasLoyalty },
    { label: "Generate QR table tents", href: `/brewery-admin/${breweryId}/qr`, icon: QrCode, complete: hasQr },
    { label: "Share your brewery page", href: `/brewery/${breweryId}`, icon: ExternalLink, complete: hasShared },
  ];

  const completedCount = steps.filter((s) => s.complete).length;
  const progress = completedCount / steps.length;

  function dismiss() {
    setVisible(false);
    localStorage.setItem(storageKey, "1");
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: "hidden" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="rounded-2xl p-5 relative mb-8"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--accent-gold) 8%, transparent), transparent)",
            border:
              "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
          }}
        >
          {/* Dismiss */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 p-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            aria-label="Dismiss onboarding card"
          >
            <X size={16} />
          </button>

          {/* Header */}
          <h3
            className="font-display text-lg font-bold mb-1"
            style={{ color: "var(--accent-gold)" }}
          >
            Get your brewery set up
          </h3>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            {completedCount === steps.length
              ? "You\u2019re all set \u2014 nice work!"
              : `${completedCount} of ${steps.length} steps complete`}
          </p>

          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full mb-5 overflow-hidden"
            style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent-gold)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Link
                  key={step.label}
                  href={step.href}
                  target={step.icon === ExternalLink ? "_blank" : undefined}
                  className="flex items-center gap-3 w-full text-left p-3 rounded-xl transition-colors"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Checkbox circle */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                    style={
                      step.complete
                        ? { background: "var(--accent-gold)" }
                        : {
                            background: "transparent",
                            border: "2px solid color-mix(in srgb, var(--accent-gold) 40%, transparent)",
                          }
                    }
                  >
                    {step.complete && <Check size={14} style={{ color: "var(--bg)" }} strokeWidth={3} />}
                  </div>

                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "color-mix(in srgb, var(--accent-gold) 15%, transparent)",
                    }}
                  >
                    <Icon size={16} style={{ color: "var(--accent-gold)" }} />
                  </div>

                  {/* Label */}
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: step.complete ? "var(--text-muted)" : "var(--text-primary)",
                      textDecoration: step.complete ? "line-through" : "none",
                    }}
                  >
                    {step.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
