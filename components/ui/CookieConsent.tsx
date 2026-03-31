"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { spring, variants } from "@/lib/animation";
import Link from "next/link";

const STORAGE_KEY = "hoptrack-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          {...variants.slideUp}
          transition={spring.gentle}
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-lg rounded-2xl border p-4 shadow-xl backdrop-blur-md sm:bottom-6 sm:left-auto sm:right-6"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
          role="dialog"
          aria-label="Cookie consent"
        >
          <p
            className="mb-3 text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            We use essential cookies to keep you logged in and remember your
            preferences. No tracking, no ads.{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2"
              style={{ color: "var(--accent-gold)" }}
            >
              Privacy Policy
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={accept}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--accent-gold)",
                color: "#0F0E0C",
              }}
            >
              Got it
            </button>
            <button
              onClick={decline}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: "var(--surface-2)",
                color: "var(--text-secondary)",
              }}
            >
              Decline non-essential
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
