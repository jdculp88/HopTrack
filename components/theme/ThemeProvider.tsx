"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // On mount: read saved preference or system preference
  useEffect(() => {
    const saved = localStorage.getItem("hoptrack-theme") as Theme | null;
    if (saved === "light" || saved === "dark") {
      apply(saved);
      setTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      apply("light");
      setTheme("light");
    }
  }, []);

  function apply(t: Theme) {
    document.documentElement.setAttribute("data-theme", t);
  }

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    apply(next);
    setTheme(next);
    localStorage.setItem("hoptrack-theme", next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
