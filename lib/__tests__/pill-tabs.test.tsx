// PillTabs unit tests — Sprint 160 (The Flow)
// Covers: variants, keyboard navigation, ARIA, counts, disabled/hidden tabs, haptic.
// Owner: Dakota + Reese

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PillTabs, type PillTab } from "@/components/ui/PillTabs";

// Mock matchMedia (jsdom default doesn't implement it)
beforeEach(() => {
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
  Object.defineProperty(navigator, "vibrate", {
    writable: true,
    configurable: true,
    value: vi.fn(),
  });
});

type TabKey = "one" | "two" | "three";

const basicTabs: PillTab<TabKey>[] = [
  { key: "one", label: "One" },
  { key: "two", label: "Two" },
  { key: "three", label: "Three" },
];

describe("PillTabs", () => {
  describe("rendering", () => {
    it("renders all visible tabs", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      expect(screen.getAllByRole("tab")).toHaveLength(3);
      expect(screen.getByRole("tab", { name: /One/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Two/ })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /Three/ })).toBeInTheDocument();
    });

    it("skips hidden tabs", () => {
      const onChange = vi.fn();
      const tabs: PillTab<TabKey>[] = [
        { key: "one", label: "One" },
        { key: "two", label: "Two", hidden: true },
        { key: "three", label: "Three" },
      ];
      render(
        <PillTabs
          tabs={tabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      expect(screen.getAllByRole("tab")).toHaveLength(2);
      expect(screen.queryByRole("tab", { name: /Two/ })).not.toBeInTheDocument();
    });

    it("renders count badges when provided", () => {
      const onChange = vi.fn();
      const tabs: PillTab<TabKey>[] = [
        { key: "one", label: "One", count: 5 },
        { key: "two", label: "Two", count: 42 },
        { key: "three", label: "Three" },
      ];
      render(
        <PillTabs
          tabs={tabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("renders icons when provided", () => {
      const onChange = vi.fn();
      const tabs: PillTab<TabKey>[] = [
        { key: "one", label: "One", icon: <span data-testid="icon-1">🏠</span> },
        { key: "two", label: "Two" },
        { key: "three", label: "Three" },
      ];
      render(
        <PillTabs
          tabs={tabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      expect(screen.getByTestId("icon-1")).toBeInTheDocument();
    });
  });

  describe("ARIA", () => {
    it("sets role=tablist on container", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Profile sections"
        />
      );
      expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Profile sections");
    });

    it("sets aria-selected=true on active tab only", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="two"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      expect(screen.getByRole("tab", { name: /One/ })).toHaveAttribute("aria-selected", "false");
      expect(screen.getByRole("tab", { name: /Two/ })).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tab", { name: /Three/ })).toHaveAttribute("aria-selected", "false");
    });

    it("uses roving tabindex (active=0, inactive=-1)", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      expect(screen.getByRole("tab", { name: /One/ })).toHaveAttribute("tabindex", "0");
      expect(screen.getByRole("tab", { name: /Two/ })).toHaveAttribute("tabindex", "-1");
      expect(screen.getByRole("tab", { name: /Three/ })).toHaveAttribute("tabindex", "-1");
    });

    it("sets aria-controls on each tab with slugified prefix", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Profile Sections!"
        />
      );
      expect(screen.getByRole("tab", { name: /One/ })).toHaveAttribute(
        "aria-controls",
        "profile-sections-panel-one"
      );
    });
  });

  describe("onChange", () => {
    it("calls onChange with key when tab clicked", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.click(screen.getByRole("tab", { name: /Two/ }));
      expect(onChange).toHaveBeenCalledWith("two");
    });

    it("does not call onChange when clicking already-active tab", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.click(screen.getByRole("tab", { name: /One/ }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not call onChange on disabled tabs", () => {
      const onChange = vi.fn();
      const tabs: PillTab<TabKey>[] = [
        { key: "one", label: "One" },
        { key: "two", label: "Two", disabled: true },
        { key: "three", label: "Three" },
      ];
      render(
        <PillTabs
          tabs={tabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.click(screen.getByRole("tab", { name: /Two/ }));
      expect(onChange).not.toHaveBeenCalled();
    });

    it("fires haptic selection feedback on change", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.click(screen.getByRole("tab", { name: /Two/ }));
      expect(navigator.vibrate).toHaveBeenCalledWith([5]); // selection preset
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowRight cycles forward", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.keyDown(screen.getByRole("tab", { name: /One/ }), { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith("two");
    });

    it("ArrowLeft cycles backward with wrap", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.keyDown(screen.getByRole("tab", { name: /One/ }), { key: "ArrowLeft" });
      expect(onChange).toHaveBeenCalledWith("three");
    });

    it("ArrowRight wraps from last to first", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="three"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.keyDown(screen.getByRole("tab", { name: /Three/ }), { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith("one");
    });

    it("Home jumps to first tab", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="three"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.keyDown(screen.getByRole("tab", { name: /Three/ }), { key: "Home" });
      expect(onChange).toHaveBeenCalledWith("one");
    });

    it("End jumps to last tab", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.keyDown(screen.getByRole("tab", { name: /One/ }), { key: "End" });
      expect(onChange).toHaveBeenCalledWith("three");
    });

    it("arrow keys skip disabled tabs", () => {
      const onChange = vi.fn();
      const tabs: PillTab<TabKey>[] = [
        { key: "one", label: "One" },
        { key: "two", label: "Two", disabled: true },
        { key: "three", label: "Three" },
      ];
      render(
        <PillTabs
          tabs={tabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      fireEvent.keyDown(screen.getByRole("tab", { name: /One/ }), { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith("three");
    });
  });

  describe("variants", () => {
    it("renders underline variant by default", () => {
      const onChange = vi.fn();
      const { container } = render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
        />
      );
      // Underline variant has a baseline div
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    it("renders pill variant with rounded-full class", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
          variant="pill"
        />
      );
      const activeTab = screen.getByRole("tab", { name: /One/ });
      expect(activeTab.className).toContain("rounded-full");
    });

    it("renders segmented variant with rounded-lg class", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
          variant="segmented"
        />
      );
      const activeTab = screen.getByRole("tab", { name: /One/ });
      expect(activeTab.className).toContain("rounded-lg");
    });
  });

  describe("sticky", () => {
    it("applies sticky class when sticky prop provided", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
          sticky={{ top: 56 }}
        />
      );
      const tablist = screen.getByRole("tablist");
      expect(tablist.className).toContain("sticky");
      expect(tablist.style.top).toBe("56px");
    });

    it("does not apply sticky when false", () => {
      const onChange = vi.fn();
      render(
        <PillTabs
          tabs={basicTabs}
          value="one"
          onChange={onChange}
          ariaLabel="Test tabs"
          sticky={false}
        />
      );
      const tablist = screen.getByRole("tablist");
      expect(tablist.className).not.toContain("sticky");
    });
  });
});
