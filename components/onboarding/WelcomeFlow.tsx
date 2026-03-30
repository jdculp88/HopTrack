"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Beer, MapPin, Trophy, ChevronRight } from "lucide-react";
import { HopMark } from "@/components/ui/HopMark";
import Link from "next/link";

const STORAGE_KEY = "hoptrack-onboarding-complete";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

const screens = [
  {
    key: "welcome",
    icon: null, // uses HopMark
    title: "Welcome to HopTrack",
    tagline: "Track Every Pour",
    description:
      "Your craft beer companion. Check in at breweries, discover new beers, and share your journey with friends.",
  },
  {
    key: "session",
    icon: Beer,
    title: "Start a Session",
    tagline: "Visit. Pour. Earn.",
    description:
      "Walk into a brewery and start a session. Log every beer you try, rate your favorites, and earn XP as you go.",
  },
  {
    key: "explore",
    icon: MapPin,
    title: "Find Your Brewery",
    tagline: "Discover What's On Tap",
    description:
      "Explore breweries near you, check out their tap lists, and follow your favorites to stay in the loop.",
  },
] as const;

// Slide variants keyed by direction
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

interface WelcomeFlowProps {
  onComplete: () => void;
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState(1);

  const completeOnboarding = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage may be unavailable
    }
    onComplete();
  }, [onComplete]);

  function goNext() {
    if (currentScreen < screens.length - 1) {
      setDirection(1);
      setCurrentScreen((s) => s + 1);
    }
  }

  function goBack() {
    if (currentScreen > 0) {
      setDirection(-1);
      setCurrentScreen((s) => s - 1);
    }
  }

  const screen = screens[currentScreen];
  const isLast = currentScreen === screens.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Skip button */}
      <div className="w-full flex justify-end p-4">
        <button
          onClick={completeOnboarding}
          className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <motion.span
            whileHover={{ opacity: 0.8 }}
            transition={spring}
          >
            Skip
          </motion.span>
        </button>
      </div>

      {/* Screen content */}
      <div className="flex-1 flex items-center justify-center w-full max-w-md px-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={screen.key}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={spring}
            className="flex flex-col items-center text-center w-full"
          >
            {/* Icon area */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8"
              style={{
                background:
                  "color-mix(in srgb, var(--accent-gold) 12%, transparent)",
              }}
            >
              {screen.key === "welcome" ? (
                <HopMark variant="mark" theme="auto" height={56} />
              ) : screen.icon ? (
                <screen.icon
                  size={40}
                  strokeWidth={1.5}
                  style={{ color: "var(--accent-gold)" }}
                />
              ) : null}
            </div>

            {/* Title */}
            <h1
              className="font-display text-3xl sm:text-4xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {screen.title}
            </h1>

            {/* Tagline */}
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-6"
              style={{ color: "var(--accent-gold)" }}
            >
              {screen.tagline}
            </p>

            {/* Description */}
            <p
              className="text-base leading-relaxed max-w-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              {screen.description}
            </p>

            {/* Screen-specific extras */}
            {screen.key === "session" && (
              <div className="flex items-center gap-6 mt-8">
                {[
                  { icon: Beer, label: "Log Beers" },
                  { icon: Trophy, label: "Earn XP" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{
                        background:
                          "color-mix(in srgb, var(--accent-gold) 10%, transparent)",
                        border:
                          "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)",
                      }}
                    >
                      <item.icon
                        size={20}
                        style={{ color: "var(--accent-gold)" }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {screen.key === "explore" && (
              <div
                className="mt-8 w-full max-w-xs rounded-2xl p-4"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-xs font-medium mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Popular nearby
                </p>
                {[
                  "Local craft breweries",
                  "Tap rooms & taphouses",
                  "Brewery events",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 py-2"
                    style={{
                      borderBottom:
                        "1px solid color-mix(in srgb, var(--border) 50%, transparent)",
                    }}
                  >
                    <MapPin
                      size={14}
                      style={{ color: "var(--accent-gold)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="w-full max-w-md px-6 pb-10 pt-4 flex flex-col items-center gap-6">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {screens.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === currentScreen ? 24 : 8,
                height: 8,
                background:
                  i === currentScreen
                    ? "var(--accent-gold)"
                    : "color-mix(in srgb, var(--text-muted) 30%, transparent)",
              }}
              transition={spring}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full">
          {currentScreen > 0 && (
            <button
              onClick={goBack}
              className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <motion.span whileTap={{ scale: 0.97 }} transition={spring}>
                Back
              </motion.span>
            </button>
          )}

          {isLast ? (
            <Link
              href="/explore"
              onClick={completeOnboarding}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors"
              style={{
                background: "var(--accent-gold)",
                color: "var(--bg)",
              }}
            >
              <motion.span
                className="flex items-center gap-2"
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                Get Started
                <ChevronRight size={16} />
              </motion.span>
            </Link>
          ) : (
            <button
              onClick={goNext}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-colors"
              style={{
                background: "var(--accent-gold)",
                color: "var(--bg)",
              }}
            >
              <motion.span
                className="flex items-center gap-2"
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                Next
                <ChevronRight size={16} />
              </motion.span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Check if onboarding has been completed */
export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return true; // If localStorage is unavailable, skip onboarding
  }
}
