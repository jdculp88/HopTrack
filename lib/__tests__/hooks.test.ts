import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

describe("useDebouncedValue", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "initial" } }
    );
    rerender({ value: "updated" });
    expect(result.current).toBe("initial");
  });

  it("updates after delay elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "initial" } }
    );
    rerender({ value: "updated" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("updated");
  });

  it("resets timer on rapid updates", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "b" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "c" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "d" });
    expect(result.current).toBe("a"); // Still original
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("d"); // Latest value after full delay
  });
});

describe("useOnlineStatus", () => {
  it("returns true by default (browser is online)", () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("updates to false on offline event", () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => { window.dispatchEvent(new Event("offline")); });
    expect(result.current).toBe(false);
  });

  it("updates back to true on online event", () => {
    const { result } = renderHook(() => useOnlineStatus());
    act(() => { window.dispatchEvent(new Event("offline")); });
    act(() => { window.dispatchEvent(new Event("online")); });
    expect(result.current).toBe(true);
  });
});
