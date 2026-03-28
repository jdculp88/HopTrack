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
