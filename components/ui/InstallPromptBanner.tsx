// PWA Install Prompt Banner — Sprint 145 (The Revenue Push)
// Owner: Alex (UI/UX Designer + Mobile Lead)
// Wireframe: Finley (Product Designer)
//
// Bottom sheet that prompts users to install HopTrack as a PWA.
// Shows after 30s in the app. Dismissable for 7 days.

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { spring, variants } from "@/lib/animation";

export function InstallPromptBanner() {
  const { canInstall, promptInstall, dismiss } = useInstallPrompt();
  const [visible, setVisible] = useState(false);

  // Delay showing the banner by 30 seconds so we don't ambush new users
  useEffect(() => {
    if (!canInstall) {
      // Use queueMicrotask to avoid synchronous setState in effect (React compiler)
      queueMicrotask(() => setVisible(false));
      return;
    }
    const timer = setTimeout(() => setVisible(true), 30_000);
    return () => clearTimeout(timer);
  }, [canInstall]);

  const handleInstall = async () => {
    await promptInstall();
    setVisible(false);
  };

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          {...variants.slideUp}
          transition={spring.default}
          className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm"
        >
          <div
            className="rounded-2xl border p-4 shadow-lg backdrop-blur-md"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-start gap-3">
              {/* App icon */}
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: "var(--accent-gold)" }}
              >
                <Download size={22} style={{ color: "#0F0E0C" }} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Add HopTrack to Home Screen
                </p>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Quick access, offline support, and the full app experience.
                </p>

                {/* Action buttons */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={handleInstall}
                    className="rounded-xl px-4 py-2 text-xs font-semibold transition-opacity hover:opacity-90"
                    style={{
                      background: "var(--accent-gold)",
                      color: "#0F0E0C",
                    }}
                  >
                    <motion.div whileTap={{ scale: 0.97 }}>
                      Install
                    </motion.div>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-xl px-3 py-2 text-xs transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Not now
                  </button>
                </div>
              </div>

              {/* Close X */}
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-lg p-1 transition-opacity hover:opacity-70"
                style={{ color: "var(--text-muted)" }}
                aria-label="Dismiss install prompt"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
