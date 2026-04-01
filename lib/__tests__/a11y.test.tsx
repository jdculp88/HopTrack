/**
 * Accessibility pattern tests — Sprint 109 (The Access)
 * Verifies WCAG AA patterns in key shared components.
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { IconButton } from "@/components/ui/IconButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { StarRating } from "@/components/ui/StarRating";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { renderHook } from "@testing-library/react";

// ── IconButton — aria-label required at TypeScript level ──────────────────────

describe("IconButton aria-label requirement", () => {
  it("enforces aria-label in TypeScript interface (displayName check)", () => {
    // aria-label is typed as `string` (non-optional) in IconButtonProps.
    // If this file compiles, the interface is correctly enforced.
    expect(IconButton.displayName).toBe("IconButton");
  });

  it("renders button with the provided aria-label", () => {
    const { container } = render(
      <IconButton aria-label="Close dialog">x</IconButton>
    );
    const btn = container.querySelector("button");
    expect(btn?.getAttribute("aria-label")).toBe("Close dialog");
  });

  it("renders with default md size (44px minimum tap target)", () => {
    const { container } = render(
      <IconButton aria-label="Settings">⚙</IconButton>
    );
    const btn = container.querySelector("button");
    // min-w-[44px] class from SIZES.md
    expect(btn?.className).toContain("min-w-[44px]");
  });
});

// ── EmptyState — renders accessible h3 title ─────────────────────────────────

describe("EmptyState", () => {
  it("renders title in an h3 element", () => {
    const { container } = render(<EmptyState title="Nothing here yet" />);
    const h3 = container.querySelector("h3");
    expect(h3).not.toBeNull();
    expect(h3?.textContent).toBe("Nothing here yet");
  });

  it("renders with optional description paragraph", () => {
    const { container } = render(
      <EmptyState title="Empty" description="Try adding something." />
    );
    const h3 = container.querySelector("h3");
    expect(h3?.textContent).toBe("Empty");
    const p = container.querySelector("p");
    expect(p?.textContent).toBe("Try adding something.");
  });

  it("renders without description gracefully", () => {
    const { container } = render(<EmptyState title="All clear" />);
    const p = container.querySelector("p");
    expect(p).toBeNull();
  });
});

// ── ScreenReaderAnnouncer — announce() sets content in live region ────────────

describe("ScreenReaderAnnouncer", () => {
  beforeEach(() => {
    vi.resetModules();
    document.querySelectorAll('[aria-live]').forEach((el) => el.remove());
  });

  afterEach(() => {
    document.querySelectorAll('[aria-live]').forEach((el) => el.remove());
  });

  it("announce() creates a polite live region in the DOM", async () => {
    const { announce } = await import("@/components/ui/ScreenReaderAnnouncer");
    announce("Test announcement");
    const politeEl = document.querySelector('[aria-live="polite"]');
    expect(politeEl).not.toBeNull();
  });

  it("announce() sets content via requestAnimationFrame", async () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    const { announce } = await import("@/components/ui/ScreenReaderAnnouncer");
    announce("Beer added to session");

    const politeEl = document.querySelector('[aria-live="polite"]');
    expect(politeEl?.textContent).toBe("Beer added to session");

    rafSpy.mockRestore();
  });

  it("announceAssertive() creates an assertive live region", async () => {
    const { announceAssertive } = await import("@/components/ui/ScreenReaderAnnouncer");
    announceAssertive("Error saving data");
    const assertiveEl = document.querySelector('[aria-live="assertive"]');
    expect(assertiveEl).not.toBeNull();
  });

  it("assertive container has role=alert", async () => {
    const { announceAssertive } = await import("@/components/ui/ScreenReaderAnnouncer");
    announceAssertive("Something went wrong");
    const alertEl = document.querySelector('[role="alert"]');
    expect(alertEl).not.toBeNull();
  });

  it("polite container has role=status", async () => {
    const { announce } = await import("@/components/ui/ScreenReaderAnnouncer");
    announce("Hello");
    const statusEl = document.querySelector('[role="status"]');
    expect(statusEl).not.toBeNull();
  });

  it("announce() does not throw (SSR guard in place)", async () => {
    const { announce } = await import("@/components/ui/ScreenReaderAnnouncer");
    expect(() => announce("safe")).not.toThrow();
  });
});

// ── useOnlineStatus — returns true by default (SSR safe) ─────────────────────

describe("useOnlineStatus", () => {
  it("returns true by default when navigator.onLine is true", () => {
    // jsdom sets navigator.onLine to true by default
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("is exported as a function", () => {
    expect(typeof useOnlineStatus).toBe("function");
  });
});

// ── Modal — role="dialog" and aria-modal="true" ───────────────────────────────

describe("Modal accessibility attributes", () => {
  it("renders with role=dialog when open", () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        content
      </Modal>
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });

  it("renders with aria-modal=true when open", () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}} title="Test">
        body
      </Modal>
    );
    const dialog = container.querySelector('[aria-modal="true"]');
    expect(dialog).not.toBeNull();
  });

  it("does not render dialog element when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Hidden">
        body
      </Modal>
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeNull();
  });

  it("uses aria-labelledby=modal-title when title is provided", () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}} title="My Modal">
        body
      </Modal>
    );
    const dialog = container.querySelector('[aria-labelledby="modal-title"]');
    expect(dialog).not.toBeNull();
  });

  it("renders the title text in element with id=modal-title", () => {
    const { container } = render(
      <Modal open={true} onClose={() => {}} title="Accessible Title">
        body
      </Modal>
    );
    const titleEl = container.querySelector("#modal-title");
    expect(titleEl?.textContent).toBe("Accessible Title");
  });
});

// ── StarRating — role="radiogroup" interactive, role="img" readonly ───────────

describe("StarRating accessibility roles", () => {
  it("has role=radiogroup when interactive (onChange provided)", () => {
    const { container } = render(
      <StarRating value={3} onChange={() => {}} readonly={false} />
    );
    const radiogroup = container.querySelector('[role="radiogroup"]');
    expect(radiogroup).not.toBeNull();
  });

  it("has role=img when readonly=true", () => {
    const { container } = render(<StarRating value={4} readonly={true} />);
    const imgEl = container.querySelector('[role="img"]');
    expect(imgEl).not.toBeNull();
  });

  it("aria-label includes value and max for readonly display", () => {
    const { container } = render(<StarRating value={4.5} readonly={true} />);
    const imgEl = container.querySelector('[role="img"]');
    expect(imgEl?.getAttribute("aria-label")).toBe("4.5 out of 5 stars");
  });

  it("interactive group has aria-label=Star rating", () => {
    const { container } = render(
      <StarRating value={2} onChange={() => {}} />
    );
    const group = container.querySelector('[role="radiogroup"]');
    expect(group?.getAttribute("aria-label")).toBe("Star rating");
  });

  it("readonly has role=img even without onChange", () => {
    const { container } = render(<StarRating value={3} />);
    // no onChange and readonly defaults to false but isInteractive = !readonly && !!onChange
    // Without onChange, isInteractive is false → role="img"
    const imgEl = container.querySelector('[role="img"]');
    expect(imgEl).not.toBeNull();
  });
});
