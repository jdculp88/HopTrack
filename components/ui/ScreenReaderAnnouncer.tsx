"use client";

/**
 * Provides two invisible live regions that can be used to announce messages to
 * screen readers without visible UI changes.
 *
 * Usage:
 *   import { announce, announceAssertive } from "@/components/ui/ScreenReaderAnnouncer"
 *   announce("Beer added to session")          // polite — waits for silence
 *   announceAssertive("Error: could not save") // assertive — interrupts immediately
 */

import { useEffect, useRef } from "react";

let politeContainer: HTMLElement | null = null;
let assertiveContainer: HTMLElement | null = null;

function getContainer(type: "polite" | "assertive"): HTMLElement {
  if (type === "polite" && politeContainer) return politeContainer;
  if (type === "assertive" && assertiveContainer) return assertiveContainer;

  const el = document.createElement("div");
  el.setAttribute("role", type === "polite" ? "status" : "alert");
  el.setAttribute("aria-live", type);
  el.setAttribute("aria-atomic", "true");
  el.setAttribute(
    "style",
    "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden"
  );
  document.body.appendChild(el);

  if (type === "polite") politeContainer = el;
  else assertiveContainer = el;

  return el;
}

/** Announce a message to screen readers — polite (waits for silence) */
export function announce(message: string): void {
  if (typeof document === "undefined") return;
  const container = getContainer("polite");
  container.textContent = "";
  requestAnimationFrame(() => {
    container.textContent = message;
  });
}

/** Announce a message to screen readers — assertive (interrupts immediately) */
export function announceAssertive(message: string): void {
  if (typeof document === "undefined") return;
  const container = getContainer("assertive");
  container.textContent = "";
  requestAnimationFrame(() => {
    container.textContent = message;
  });
}

/**
 * Mount this once in your app root (e.g. AppShell).
 * It initializes the live regions lazily.
 */
export function ScreenReaderAnnouncer() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    // Pre-create the containers so they're ready before any announcements
    getContainer("polite");
    getContainer("assertive");
  }, []);

  return null; // Renders nothing — live regions are in the DOM outside React
}
