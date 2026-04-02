"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { BrandNameStep } from "./BrandNameStep";
import { BrandDetailsStep } from "./BrandDetailsStep";
import { BrandConfirmStep } from "./BrandConfirmStep";
import type { BreweryBrand } from "@/types/database";

interface CreateBrandWizardProps {
  breweryId: string;
  breweryName: string;
  userId: string;
  onComplete: (brand: BreweryBrand) => void;
  onClose: () => void;
}

const STEPS = [
  { label: "Brand Name & Slug", shortLabel: "Name" },
  { label: "Logo & Details", shortLabel: "Details" },
  { label: "Confirm & Create", shortLabel: "Confirm" },
];

export function CreateBrandWizard({ breweryId, breweryName, userId, onComplete, onClose }: CreateBrandWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Wizard state
  const [brandName, setBrandName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugAvailable, setSlugAvailable] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [creating, setCreating] = useState(false);

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

  const canProceedStep0 = brandName.length >= 2 && slug.length >= 2 && slugAvailable;
  const isLastStep = currentStep === STEPS.length - 1;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brandName,
          slug,
          description: description || null,
          website_url: websiteUrl || null,
          logo_url: logoUrl,
          first_brewery_id: breweryId,
        }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        onComplete(json.data);
      }
    } finally {
      setCreating(false);
    }
  }

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
              Create Brand
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Step {currentStep + 1} of {STEPS.length} · {STEPS[currentStep].label}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
            style={{ color: "var(--text-muted)" }}
            aria-label="Close brand creation wizard"
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
        <div className="px-5 overflow-hidden" style={{ minHeight: 280 }}>
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
                <BrandNameStep
                  brandName={brandName}
                  setBrandName={setBrandName}
                  slug={slug}
                  setSlug={setSlug}
                  slugAvailable={slugAvailable}
                  setSlugAvailable={setSlugAvailable}
                />
              )}
              {currentStep === 1 && (
                <BrandDetailsStep
                  userId={userId}
                  logoUrl={logoUrl}
                  setLogoUrl={setLogoUrl}
                  description={description}
                  setDescription={setDescription}
                  websiteUrl={websiteUrl}
                  setWebsiteUrl={setWebsiteUrl}
                />
              )}
              {currentStep === 2 && (
                <BrandConfirmStep
                  brandName={brandName}
                  slug={slug}
                  logoUrl={logoUrl}
                  description={description}
                  websiteUrl={websiteUrl}
                  breweryName={breweryName}
                  creating={creating}
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

          <button
            onClick={isLastStep ? handleCreate : goNext}
            disabled={(currentStep === 0 && !canProceedStep0) || creating}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
          >
            {isLastStep ? (
              <>
                {creating ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Check size={16} />
                  </motion.div>
                ) : (
                  <Check size={16} />
                )}
                {creating ? "Creating..." : "Create Brand"}
              </>
            ) : (
              <>
                Next
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
