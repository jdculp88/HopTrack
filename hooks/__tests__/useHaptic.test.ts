// useHaptic hook tests — Sprint 154 (The Native Feel)
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHaptic } from "../useHaptic";

describe("useHaptic", () => {
  const mockVibrate = vi.fn();
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let listeners: Record<string, (...args: unknown[]) => void>;

  beforeEach(() => {
    listeners = {};
    matchMediaMock = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: (event: string, cb: (...args: unknown[]) => void) => { listeners[event] = cb; },
      removeEventListener: vi.fn(),
    });
    Object.defineProperty(window, "matchMedia", { value: matchMediaMock, writable: true });
    Object.defineProperty(navigator, "vibrate", { value: mockVibrate, writable: true, configurable: true });
    mockVibrate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a haptic function", () => {
    const { result } = renderHook(() => useHaptic());
    expect(typeof result.current.haptic).toBe("function");
  });

  it("calls navigator.vibrate with tap pattern by default", () => {
    const { result } = renderHook(() => useHaptic());
    act(() => { result.current.haptic(); });
    expect(mockVibrate).toHaveBeenCalledWith([10]);
  });

  it("supports named presets", () => {
    const { result } = renderHook(() => useHaptic());

    act(() => { result.current.haptic("tap"); });
    expect(mockVibrate).toHaveBeenCalledWith([10]);

    act(() => { result.current.haptic("press"); });
    expect(mockVibrate).toHaveBeenCalledWith([15]);

    act(() => { result.current.haptic("selection"); });
    expect(mockVibrate).toHaveBeenCalledWith([5]);

    act(() => { result.current.haptic("success"); });
    expect(mockVibrate).toHaveBeenCalledWith([10, 50, 20]);

    act(() => { result.current.haptic("error"); });
    expect(mockVibrate).toHaveBeenCalledWith([30, 30, 30]);

    act(() => { result.current.haptic("celebration"); });
    expect(mockVibrate).toHaveBeenCalledWith([10, 30, 15, 30, 25]);
  });

  it("does not vibrate when prefers-reduced-motion is active", () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const { result } = renderHook(() => useHaptic());
    act(() => { result.current.haptic("tap"); });
    expect(mockVibrate).not.toHaveBeenCalled();
  });

  it("does not throw when navigator.vibrate is unavailable", () => {
    Object.defineProperty(navigator, "vibrate", { value: undefined, writable: true, configurable: true });

    const { result } = renderHook(() => useHaptic());
    expect(() => {
      act(() => { result.current.haptic("tap"); });
    }).not.toThrow();
  });

  it("responds to reduced-motion changes at runtime", () => {
    const { result } = renderHook(() => useHaptic());

    // Initially not reduced — vibration works
    act(() => { result.current.haptic("tap"); });
    expect(mockVibrate).toHaveBeenCalledTimes(1);

    // Simulate reduced motion becoming active
    if (listeners["change"]) {
      act(() => { listeners["change"]({ matches: true }); });
    }

    mockVibrate.mockClear();
    act(() => { result.current.haptic("tap"); });
    expect(mockVibrate).not.toHaveBeenCalled();
  });
});
