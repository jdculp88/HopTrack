// PWA Install Prompt Hook — Sprint 145 (The Revenue Push)
// Owner: Alex (UI/UX Designer + Mobile Lead)
//
// Captures the beforeinstallprompt event and exposes it for the UI.
// Handles dismissal persistence (once per 7 days) and install tracking.

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const DISMISS_KEY = "ht-install-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user recently dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) return;
      localStorage.removeItem(DISMISS_KEY);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt.current = null;
      console.log("[pwa] App installed successfully");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;

    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    // Either way, the prompt can only be used once
    setCanInstall(false);
    deferredPrompt.current = null;
  }, []);

  const dismiss = useCallback(() => {
    setCanInstall(false);
    deferredPrompt.current = null;
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  return { canInstall, isInstalled, promptInstall, dismiss };
}
