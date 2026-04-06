/**
 * Global Vitest setup — Sprint 104 (The Audit)
 * Runs before every test file.
 */
import { beforeEach, afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

// Mock window.matchMedia for useHaptic and useReducedMotion (Sprint 169)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Suppress console.error noise in tests unless explicitly testing for errors
// Store originals so tests can restore if needed
const originalConsoleError = console.error;
const _originalConsoleWarn = console.warn;

beforeEach(() => {
  // Filter out React-specific noise that pollutes test output
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    const message = String(args[0]);
    // Allow through genuine errors, filter React internal noise
    if (
      message.includes("Warning: ReactDOM.render") ||
      message.includes("Warning: Each child in a list") ||
      message.includes("Warning: An update to") ||
      message.includes("act(") ||
      message.includes("Warning: validateDOMNesting")
    ) {
      return;
    }
    originalConsoleError(...args);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
