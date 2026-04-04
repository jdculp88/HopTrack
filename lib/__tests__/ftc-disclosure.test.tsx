/**
 * FTC Rating Disclosure component tests — Reese, Sprint 156 (The Triple Shot)
 * Verifies the RatingDisclosure component renders correct text and structure.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RatingDisclosure } from "@/components/ui/RatingDisclosure";

describe("RatingDisclosure", () => {
  it("renders the XP disclosure text", () => {
    render(<RatingDisclosure />);
    expect(screen.getByText(/You earn XP for rating beers/)).toBeDefined();
  });

  it('contains "honest opinion" text', () => {
    render(<RatingDisclosure />);
    expect(screen.getByText(/honest opinion/)).toBeDefined();
  });

  it("renders as a paragraph element", () => {
    const { container } = render(<RatingDisclosure />);
    const p = container.querySelector("p");
    expect(p).not.toBeNull();
  });

  it("has text-xs class for small sizing", () => {
    const { container } = render(<RatingDisclosure />);
    const p = container.querySelector("p");
    expect(p?.className).toContain("text-xs");
  });

  it("uses --text-muted color via inline style", () => {
    const { container } = render(<RatingDisclosure />);
    const p = container.querySelector("p");
    expect(p?.style.color).toBe("var(--text-muted)");
  });
});
