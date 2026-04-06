"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "oled";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const THEME_CYCLE: Theme[] = ["dark", "light", "oled"];

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  function apply(t: Theme) {
    document.documentElement.setAttribute("data-theme", t);
  }

  // On mount: read saved preference or system preference
  useEffect(() => {
    const saved = localStorage.getItem("hoptrack-theme") as Theme | null;
    if (saved === "light" || saved === "dark" || saved === "oled") {
      apply(saved);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      apply("light");
      setThemeState("light");
    }
  }, []);

  function toggle() {
    const idx = THEME_CYCLE.indexOf(theme);
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    apply(next);
    setThemeState(next);
    localStorage.setItem("hoptrack-theme", next);
  }

  function setTheme(t: Theme) {
    apply(t);
    setThemeState(t);
    localStorage.setItem("hoptrack-theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
