"use client";

import { useRef, useEffect } from "react";

const DARK_VARS: Record<string, string> = {
  "--bg": "#0F0E0C",
  "--surface": "#1C1A16",
  "--surface-2": "#252219",
  "--border": "#3A3628",
  "--text-primary": "#F5F0E8",
  "--text-secondary": "#A89F8C",
  "--text-muted": "#6B6456",
  "--accent-gold": "#D4A843",
  "--accent-amber": "#E8841A",
  "--danger": "#C44B3A",
  "--success": "#3D7A52",
  // Beer style colors (dark mode values)
  "--ipa-green": "#5a8a4a",
  "--ipa-green-light": "#1a2c14",
  "--ipa-green-soft": "#7aaa6a",
  "--stout-espresso": "#3d2b1f",
  "--stout-espresso-light": "#1e1510",
  "--stout-espresso-mid": "#6b5445",
  "--sour-berry": "#a8456a",
  "--sour-berry-light": "#2a1020",
  "--sour-berry-soft": "#c87090",
  "--porter-plum": "#5c3d5e",
  "--porter-plum-light": "#1e1220",
  "--porter-plum-soft": "#8a6a8c",
  "--lager-sky": "#4a7a8a",
  "--lager-sky-light": "#12262c",
  "--lager-sky-soft": "#6a9aaa",
  "--saison-peach": "#d48a50",
  "--saison-peach-light": "#2a1a08",
  "--streak-flame": "#e07830",
  "--xp-emerald": "#4a8a5c",
  "--live-green": "#48a058",
  "--badge-bronze": "#a07850",
  "--badge-silver": "#8a9098",
  "--badge-gold": "#c8943a",
};

export function DarkCardWrapper({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    for (const [key, value] of Object.entries(DARK_VARS)) {
      ref.current.style.setProperty(key, value);
    }
  }, []);

  return (
    <div
      ref={ref}
      className="w-full max-w-sm rounded-3xl p-8"
      style={{
        background: DARK_VARS["--bg"],
        border: `1px solid ${DARK_VARS["--border"]}`,
      }}
    >
      {children}
    </div>
  );
}
