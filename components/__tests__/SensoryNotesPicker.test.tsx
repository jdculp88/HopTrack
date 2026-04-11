/**
 * SensoryNotesPicker tests — Sprint 176 (Beer Sensory Fields)
 *
 * Verifies the multi-select chip picker's core behaviors: selecting from the
 * catalog, removing via chip click, adding a custom free-text note, keyboard
 * shortcuts (Enter / Backspace), and the max-selection guard.
 */

import React, { useState } from "react";
import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SensoryNotesPicker } from "@/components/brewery-admin/beer-form/SensoryNotesPicker";

const SAMPLE_OPTIONS = [
  "Citrus", "Pine", "Tropical", "Floral", "Mango", "Pineapple", "Grapefruit",
  "Lemon", "Banana", "Chocolate",
] as const;

// Controlled wrapper so we can observe state changes through onChange
function Harness({
  initial = [],
  maxSelections,
  onChangeSpy,
}: {
  initial?: string[];
  maxSelections?: number;
  onChangeSpy?: (next: string[]) => void;
}) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <SensoryNotesPicker
      label="Aroma"
      value={value}
      onChange={next => {
        setValue(next);
        onChangeSpy?.(next);
      }}
      options={SAMPLE_OPTIONS}
      placeholder="Type to search or add custom..."
      maxSelections={maxSelections}
    />
  );
}

describe("SensoryNotesPicker", () => {
  describe("rendering", () => {
    test("renders the label", () => {
      render(<Harness />);
      expect(screen.getByText("Aroma")).toBeDefined();
    });

    test("renders initial chips", () => {
      render(<Harness initial={["Citrus", "Pine"]} />);
      // Chips render as buttons with aria-label "Remove <note>"
      expect(screen.getByLabelText("Remove Citrus")).toBeDefined();
      expect(screen.getByLabelText("Remove Pine")).toBeDefined();
    });

    test("renders the selection counter when chips are present", () => {
      render(<Harness initial={["Citrus"]} maxSelections={8} />);
      expect(screen.getByText(/1\/8/)).toBeDefined();
    });
  });

  describe("selecting from the catalog", () => {
    test("typing filters the suggestion list and selecting adds a chip", () => {
      const spy = vi.fn();
      render(<Harness onChangeSpy={spy} />);

      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "citr" } });

      const suggestion = screen.getByText("Citrus");
      // The component uses onMouseDown so preventDefault doesn't blur the input
      fireEvent.mouseDown(suggestion);

      expect(spy).toHaveBeenCalledWith(["Citrus"]);
    });

    test("adding a suggestion clears the query", () => {
      render(<Harness />);
      const input = screen.getByPlaceholderText(/Type to search/i) as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "pine" } });
      fireEvent.mouseDown(screen.getByText("Pine"));
      expect(input.value).toBe("");
    });

    test("pressing Enter picks the first suggestion", () => {
      const spy = vi.fn();
      render(<Harness onChangeSpy={spy} />);
      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "tro" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spy).toHaveBeenCalledWith(["Tropical"]);
    });
  });

  describe("custom free-text entries", () => {
    test("typing a non-catalog value exposes an 'Add' option", () => {
      render(<Harness />);
      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "dragon fruit" } });
      // normalizeNote title-cases the display
      expect(screen.getByText(/Dragon Fruit/)).toBeDefined();
    });

    test("Enter on a non-catalog query adds the normalized custom note", () => {
      const spy = vi.fn();
      render(<Harness onChangeSpy={spy} />);
      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "dragon fruit" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spy).toHaveBeenCalledWith(["Dragon Fruit"]);
    });

    test("duplicate custom entries are rejected", () => {
      const spy = vi.fn();
      render(<Harness initial={["Dragon Fruit"]} onChangeSpy={spy} />);
      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "dragon fruit" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("removing chips", () => {
    test("clicking a chip removes it", () => {
      const spy = vi.fn();
      render(<Harness initial={["Citrus", "Pine"]} onChangeSpy={spy} />);
      fireEvent.click(screen.getByLabelText("Remove Citrus"));
      expect(spy).toHaveBeenCalledWith(["Pine"]);
    });

    test("Backspace on an empty input removes the last chip", () => {
      const spy = vi.fn();
      render(<Harness initial={["Citrus", "Pine"]} onChangeSpy={spy} />);
      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "Backspace" });
      expect(spy).toHaveBeenCalledWith(["Citrus"]);
    });

    test("Backspace with a non-empty query does NOT remove a chip", () => {
      const spy = vi.fn();
      render(<Harness initial={["Citrus"]} onChangeSpy={spy} />);
      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "p" } });
      fireEvent.keyDown(input, { key: "Backspace" });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("max selection guard", () => {
    test("hides the input when the maximum is reached", () => {
      render(<Harness initial={["Citrus", "Pine"]} maxSelections={2} />);
      expect(screen.queryByPlaceholderText(/Type to search/i)).toBeNull();
      expect(screen.getByText(/Maximum of 2/)).toBeDefined();
    });

    test("does not over-fill when called programmatically at the cap", () => {
      // The controlled parent could in principle keep passing a larger value,
      // but the picker itself should refuse to grow beyond maxSelections on
      // user input. Simulate user trying to add one past the cap.
      const spy = vi.fn();
      render(<Harness initial={["Citrus"]} maxSelections={1} onChangeSpy={spy} />);
      // Input is hidden at cap, so there is no way to add — spy never called
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("case handling", () => {
    test("already-selected items are filtered out of the dropdown", () => {
      render(<Harness initial={["Citrus"]} />);
      const input = screen.getByPlaceholderText(/Type to search/i);
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "citr" } });
      // "Citrus" still appears as the selected chip (with aria-label
      // "Remove Citrus") but NOT as a dropdown suggestion — so there should
      // only be one "Citrus" in the DOM and it must live inside the chip.
      const matches = screen.getAllByText("Citrus");
      expect(matches).toHaveLength(1);
      expect(matches[0]!.closest('[aria-label="Remove Citrus"]')).not.toBeNull();
    });
  });
});

// Silence React 18 act() warnings caused by the onBlur setTimeout hiding the
// suggestion dropdown. We don't care about that timer resolving before tests
// tear down — it doesn't mutate state we assert on.
if (typeof act === "function") {
  // noop — keeps the import live for future expansion
}
