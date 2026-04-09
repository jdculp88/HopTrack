/**
 * ThemeProvider + ThemeToggle OLED theme tests — Reese, Sprint 170 (The Glass)
 * Tests the 3-way theme cycle (dark -> light -> oled -> dark), OLED support,
 * data-theme attribute, localStorage persistence, and direct setTheme().
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeProvider, useTheme, type Theme } from "@/components/theme/ThemeProvider";

// ─── Test harness component ──────────────────────────────────────────────────

function ThemeConsumer() {
  const { theme, toggle, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-btn" onClick={toggle}>Toggle</button>
      <button data-testid="set-dark" onClick={() => setTheme("dark")}>Dark</button>
      <button data-testid="set-light" onClick={() => setTheme("light")}>Light</button>
      <button data-testid="set-oled" onClick={() => setTheme("oled")}>OLED</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  // Clear localStorage
  localStorage.clear();

  // Reset data-theme attribute
  document.documentElement.removeAttribute("data-theme");

  // Mock matchMedia (jsdom doesn't implement it)
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ThemeProvider", () => {
  describe("default state", () => {
    it("defaults to light theme when no localStorage value exists", () => {
      // Sprint 172 (Design System v2.0): theme default flipped from dark → light
      renderWithProvider();
      expect(screen.getByTestId("current-theme").textContent).toBe("light");
    });
  });

  describe("toggle cycles: light -> dark -> oled -> light", () => {
    it("cycles from light to dark on first toggle", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("toggle-btn"));
      expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    });

    it("cycles from dark to oled on second toggle", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("toggle-btn")); // light -> dark
      fireEvent.click(screen.getByTestId("toggle-btn")); // dark -> oled
      expect(screen.getByTestId("current-theme").textContent).toBe("oled");
    });

    it("cycles from oled back to light on third toggle", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("toggle-btn")); // light -> dark
      fireEvent.click(screen.getByTestId("toggle-btn")); // dark -> oled
      fireEvent.click(screen.getByTestId("toggle-btn")); // oled -> light
      expect(screen.getByTestId("current-theme").textContent).toBe("light");
    });

    it("completes full cycle back to same state after 3 toggles", () => {
      renderWithProvider();
      const initial = screen.getByTestId("current-theme").textContent;
      fireEvent.click(screen.getByTestId("toggle-btn"));
      fireEvent.click(screen.getByTestId("toggle-btn"));
      fireEvent.click(screen.getByTestId("toggle-btn"));
      expect(screen.getByTestId("current-theme").textContent).toBe(initial);
    });
  });

  describe("data-theme attribute", () => {
    it("sets data-theme to dark after first toggle from light", () => {
      // Sprint 172: light is the new default; first toggle advances to dark
      renderWithProvider();
      fireEvent.click(screen.getByTestId("toggle-btn")); // light -> dark
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("sets data-theme to oled when OLED theme is active", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-oled"));
      expect(document.documentElement.getAttribute("data-theme")).toBe("oled");
    });

    it("sets data-theme to dark when toggled back", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-light"));
      expect(document.documentElement.getAttribute("data-theme")).toBe("light");
      fireEvent.click(screen.getByTestId("set-dark"));
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });
  });

  describe("localStorage persistence", () => {
    it("saves theme to localStorage on toggle", () => {
      // Sprint 172: light → dark on first toggle
      renderWithProvider();
      fireEvent.click(screen.getByTestId("toggle-btn")); // light -> dark
      expect(localStorage.getItem("hoptrack-theme")).toBe("dark");
    });

    it("saves oled to localStorage", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-oled"));
      expect(localStorage.getItem("hoptrack-theme")).toBe("oled");
    });

    it("saves dark to localStorage", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-dark"));
      expect(localStorage.getItem("hoptrack-theme")).toBe("dark");
    });

    it("restores dark theme from localStorage on mount", () => {
      localStorage.setItem("hoptrack-theme", "dark");
      renderWithProvider();
      expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    });

    it("restores light theme from localStorage on mount", () => {
      localStorage.setItem("hoptrack-theme", "light");
      renderWithProvider();
      expect(screen.getByTestId("current-theme").textContent).toBe("light");
    });

    it("restores oled theme from localStorage on mount", () => {
      localStorage.setItem("hoptrack-theme", "oled");
      renderWithProvider();
      expect(screen.getByTestId("current-theme").textContent).toBe("oled");
    });

    it("ignores invalid localStorage values and defaults to light", () => {
      // Sprint 172: default flipped from dark → light
      localStorage.setItem("hoptrack-theme", "neon-pink");
      renderWithProvider();
      expect(screen.getByTestId("current-theme").textContent).toBe("light");
    });
  });

  describe("setTheme() direct setter", () => {
    it("sets theme to oled directly without cycling", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-oled"));
      expect(screen.getByTestId("current-theme").textContent).toBe("oled");
    });

    it("sets theme to light directly", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-light"));
      expect(screen.getByTestId("current-theme").textContent).toBe("light");
    });

    it("sets theme to dark directly from oled", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-oled"));
      expect(screen.getByTestId("current-theme").textContent).toBe("oled");
      fireEvent.click(screen.getByTestId("set-dark"));
      expect(screen.getByTestId("current-theme").textContent).toBe("dark");
    });

    it("setTheme updates both state and data-theme attribute", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-oled"));
      expect(screen.getByTestId("current-theme").textContent).toBe("oled");
      expect(document.documentElement.getAttribute("data-theme")).toBe("oled");
    });

    it("setTheme persists to localStorage", () => {
      renderWithProvider();
      fireEvent.click(screen.getByTestId("set-oled"));
      expect(localStorage.getItem("hoptrack-theme")).toBe("oled");
    });
  });
});
