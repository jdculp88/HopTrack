// Copyright 2026 HopTrack. All rights reserved.
// useLongPress hook tests — Sprint 161 (The Vibe)
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLongPress } from "../useLongPress";

// Mock useHaptic to avoid touching navigator.vibrate
vi.mock("../useHaptic", () => ({
  useHaptic: () => ({ haptic: vi.fn() }),
}));

function makePointerEvent(x: number, y: number, type: "touch" | "mouse" = "touch") {
  return {
    clientX: x,
    clientY: y,
    pointerType: type,
    button: 0,
  } as unknown as React.PointerEvent;
}

describe("useLongPress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns pointer event handlers", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress }));
    expect(result.current.onPointerDown).toBeDefined();
    expect(result.current.onPointerMove).toBeDefined();
    expect(result.current.onPointerUp).toBeDefined();
    expect(result.current.onPointerLeave).toBeDefined();
  });

  it("fires onLongPress after threshold elapses", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
    });

    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onLongPress).toHaveBeenCalledWith({ x: 100, y: 200 });
  });

  it("does not fire if pointer up before threshold", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(200);
      result.current.onPointerUp();
      vi.advanceTimersByTime(300);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("cancels on pointer move exceeding moveThreshold", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 400, moveThreshold: 10 })
    );

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(100);
      result.current.onPointerMove(makePointerEvent(120, 200)); // moved 20px > threshold
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("does NOT cancel on small pointer move within threshold", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() =>
      useLongPress({ onLongPress, threshold: 400, moveThreshold: 10 })
    );

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(100);
      result.current.onPointerMove(makePointerEvent(105, 202)); // moved ~5px < threshold
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("cancels on pointer leave", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(200);
      result.current.onPointerLeave();
      vi.advanceTimersByTime(300);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("ignores non-primary mouse buttons", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    const rightClickEvent = {
      clientX: 100,
      clientY: 200,
      pointerType: "mouse",
      button: 2, // right click
    } as unknown as React.PointerEvent;

    act(() => {
      result.current.onPointerDown(rightClickEvent);
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it("accepts primary mouse clicks", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200, "mouse"));
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("didFire returns true after successful long press", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(400);
    });

    expect(result.current.didFire()).toBe(true);
  });

  it("didFire returns false when gesture cancelled", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(200);
      result.current.onPointerUp();
    });

    expect(result.current.didFire()).toBe(false);
  });

  it("reset clears fired state", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(400);
    });

    expect(result.current.didFire()).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.didFire()).toBe(false);
  });

  it("onContextMenu prevents default after successful long press", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(400);
    });

    const preventDefault = vi.fn();
    const ctxEvent = { preventDefault } as unknown as React.MouseEvent;

    act(() => {
      result.current.onContextMenu(ctxEvent);
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it("onContextMenu does NOT prevent default if no long press fired", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    const preventDefault = vi.fn();
    const ctxEvent = { preventDefault } as unknown as React.MouseEvent;

    act(() => {
      result.current.onContextMenu(ctxEvent);
    });

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("uses custom threshold", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 800 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });

  it("cancels on pointer cancel", () => {
    const onLongPress = vi.fn();
    const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 400 }));

    act(() => {
      result.current.onPointerDown(makePointerEvent(100, 200));
      vi.advanceTimersByTime(200);
      result.current.onPointerCancel();
      vi.advanceTimersByTime(300);
    });

    expect(onLongPress).not.toHaveBeenCalled();
  });
});
