// Copyright 2026 HopTrack. All rights reserved.
// Sprint 161 — The Vibe
// Long-press gesture hook: fires onLongPress after threshold + haptic feedback.
"use client";

import { useCallback, useRef } from "react";
import { useHaptic } from "./useHaptic";

interface UseLongPressOptions {
  /** Ms before onLongPress fires. Default: 400ms */
  threshold?: number;
  /** Max px the pointer can drift before the press is cancelled. Default: 10px */
  moveThreshold?: number;
  /** If true, skip preventDefault on contextmenu (for touch/pen) */
  allowContextMenu?: boolean;
}

interface LongPressResult {
  /** Fires with the pointer coords (viewport relative) on successful long press */
  onLongPress: (coords: { x: number; y: number }) => void;
}

export function useLongPress({
  onLongPress,
  threshold = 400,
  moveThreshold = 10,
  allowContextMenu = false,
}: UseLongPressOptions & LongPressResult) {
  const { haptic } = useHaptic();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startCoordsRef.current = null;
    firedRef.current = false;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only respond to primary (touch/pen/left-click)
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startCoordsRef.current = { x: e.clientX, y: e.clientY };
      firedRef.current = false;

      timerRef.current = setTimeout(() => {
        if (!startCoordsRef.current) return;
        firedRef.current = true;
        haptic("press");
        onLongPress({ x: startCoordsRef.current.x, y: startCoordsRef.current.y });
      }, threshold);
    },
    [onLongPress, threshold, haptic]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startCoordsRef.current || timerRef.current === null) return;
      const dx = Math.abs(e.clientX - startCoordsRef.current.x);
      const dy = Math.abs(e.clientY - startCoordsRef.current.y);
      if (dx > moveThreshold || dy > moveThreshold) {
        cancel();
      }
    },
    [moveThreshold, cancel]
  );

  const onPointerUp = useCallback(() => {
    cancel();
  }, [cancel]);

  const onPointerLeave = useCallback(() => {
    cancel();
  }, [cancel]);

  const onContextMenu = useCallback(
    (e: React.MouseEvent) => {
      // Suppress native context menu after long-press fires (mobile)
      if (firedRef.current && !allowContextMenu) {
        e.preventDefault();
      }
    },
    [allowContextMenu]
  );

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onPointerCancel: cancel,
    onContextMenu,
    /** True if the current gesture has already fired onLongPress — useful for swallowing click events */
    didFire: () => firedRef.current,
    /** Reset internal state (call after handling click to clear firedRef) */
    reset: cancel,
  };
}
