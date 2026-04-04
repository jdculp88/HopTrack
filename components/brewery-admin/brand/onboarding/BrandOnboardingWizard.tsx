"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { BrandOnboardingStepLocations } from "./BrandOnboardingStepLocations";
import { BrandOnboardingStepLoyalty } from "./BrandOnboardingStepLoyalty";
import { BrandOnboardingStepTeam } from "./BrandOnboardingStepTeam";
import { BrandOnboardingStepPreview } from "./BrandOnboardingStepPreview";

interface BrandOnboardingWizardProps {
  brandId: string;
  brandName: string;
  brandSlug?: string;
  locationCount: number;
}

export const STEPS = [
  { label: "Add Locations", shortLabel: "Locations" },
  { label: "Brand Loyalty", shortLabel: "Loyalty" },
  { label: "Invite Team", shortLabel: "Team" },
  { label: "Review & Preview", shortLabel: "Preview" },
];

export function BrandOnboardingWizard({
  brandId,
  brandName,
  brandSlug,
  locationCount,
}: BrandOnboardingWizardProps) {
  const storageKey = `hoptrack:brand-onboarding-wizard-${brandId}`;
  const dismissKey = `hoptrack:brand-onboarding-wizard-${brandId}-complete`;
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Track what was accomplished during onboarding
  const [locationsAdded, setLocationsAdded] = useState(false);
  const [loyaltyConfigured, setLoyaltyConfigured] = useState(false);
  const [teamInvited, setTeamInvited] = useState(false);

  useEffect(() => {
    // Show wizard if not previously dismissed AND brand has < 2 locations
    if (!localStorage.getItem(dismissKey) && locationCount < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      // Restore progress
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const state = JSON.parse(saved);
          if (state.step) setCurrentStep(state.step);
          if (state.locationsAdded) setLocationsAdded(true);
          if (state.loyaltyConfigured) setLoyaltyConfigured(true);
          if (state.teamInvited) setTeamInvited(true);
        } catch { /* ignore corrupt state */ }
      }
    }
  }, [dismissKey, storageKey, locationCount]);

  // Persist progress
  useEffect(() => {
    if (visible) {
      localStorage.setItem(storageKey, JSON.stringify({
        step: currentStep,
        locationsAdded,
        loyaltyConfigured,
        teamInvited,
      }));
    }
  }, [visible, currentStep, locationsAdded, loyaltyConfigured, teamInvited, storageKey]);

  function goNext() {
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  }

  function goPrev() {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  }

  function finish() {
    localStorage.setItem(dismissKey, "1");
    setVisible(false);
  }

  function dismiss() {
    setVisible(false);
    localStorage.setItem(dismissKey, "1");
  }

  if (!visible) return null;

  const isLastStep = currentStep === STEPS.length - 1;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3">
          <div>
            <h2 className="font-display text-xl font-bold" style={{ color: "var(--accent-gold)" }}>
              Set up {brandName}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Step {currentStep + 1} of {STEPS.length} · {STEPS[currentStep].label}
            </p>
          </div>
          <button
            onClick={dismiss}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close brand onboarding wizard"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress stepper */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step.shortLabel} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "color-mix(in srgb, var(--accent-gold) 15%, transparent)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "var(--accent-gold)" }}
                    initial={false}
                    animate={{ width: i <= currentStep ? "100%" : "0%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>
                <span className="text-[10px] font-mono" style={{ color: i <= currentStep ? "var(--accent-gold)" : "var(--text-muted)" }}>
                  {step.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-5 overflow-hidden" style={{ minHeight: 300 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            >
              {currentStep === 0 && (
                <BrandOnboardingStepLocations
                  brandId={brandId}
                  onComplete={() => setLocationsAdded(true)}
                />
              )}
              {currentStep === 1 && (
                <BrandOnboardingStepLoyalty
                  brandId={brandId}
                  onComplete={() => setLoyaltyConfigured(true)}
                />
              )}
              {currentStep === 2 && (
                <BrandOnboardingStepTeam
                  brandId={brandId}
                  onComplete={() => setTeamInvited(true)}
                />
              )}
              {currentStep === 3 && (
                <BrandOnboardingStepPreview
                  brandId={brandId}
                  brandName={brandName}
                  brandSlug={brandSlug}
                  locationsAdded={locationsAdded}
                  loyaltyConfigured={loyaltyConfigured}
                  teamInvited={teamInvited}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-5 pt-4">
          <button
            onClick={goPrev}
            disabled={currentStep === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            {!isLastStep && (
              <button
                onClick={goNext}
                className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
              >
                Skip
              </button>
            )}
            <button
              onClick={isLastStep ? finish : goNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
            >
              {isLastStep ? (
                <>
                  <Check size={16} />
                  Finish Setup
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
