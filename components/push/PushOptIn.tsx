"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export function PushOptIn() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!VAPID_PUBLIC_KEY || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Check if already subscribed or denied
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (sub) return; // Already subscribed

      const permission = Notification.permission;
      if (permission === "denied") return; // User blocked
      if (permission === "default") {
        // Show our custom prompt after a delay (not on first page load)
        const dismissed = sessionStorage.getItem("hoptrack-push-dismissed");
        if (!dismissed) {
          setTimeout(() => setShowPrompt(true), 5000);
        }
      }
    });
  }, []);

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setShowPrompt(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: {
            endpoint: subJson.endpoint,
            keys: subJson.keys,
          },
        }),
      });

      setShowPrompt(false);
    } catch (err) {
      console.error("[push] Subscribe failed:", err);
    } finally {
      setSubscribing(false);
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    sessionStorage.setItem("hoptrack-push-dismissed", "1");
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[100] rounded-2xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "color-mix(in srgb, var(--accent-gold) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-gold) 20%, transparent)" }}>
                  <Bell size={16} style={{ color: "var(--accent-gold)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Stay in the loop</p>
                  <p className="text-xs text-[var(--text-muted)]">Get notified when friends start a session</p>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors text-[var(--text-secondary)] hover:bg-[var(--surface-2)]"
              >
                Not now
              </button>
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                style={{ background: "var(--accent-gold)", color: "var(--bg)" }}
              >
                {subscribing ? "Enabling..." : "Enable"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
