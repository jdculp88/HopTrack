"use client";

import { useState, useCallback, useRef } from "react";

interface CheersAnimationState {
  isAnimating: boolean;
  particles: Array<{ id: number; x: number; y: number; angle: number }>;
}

/**
 * Hook for managing cheers animation state.
 * Returns trigger function and animation state.
 */
export function useCheersAnimation() {
  const [state, setState] = useState<CheersAnimationState>({
    isAnimating: false,
    particles: [],
  });
  const nextId = useRef(0);

  const trigger = useCallback((originX: number, originY: number) => {
    // Haptic feedback on mobile
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(30);
    }

    // Generate particles
    const particles = Array.from({ length: 8 }, (_, i) => ({
      id: nextId.current++,
      x: originX,
      y: originY,
      angle: (i / 8) * 360 + Math.random() * 30 - 15,
    }));

    setState({ isAnimating: true, particles });

    // Auto-clear after animation duration
    setTimeout(() => {
      setState({ isAnimating: false, particles: [] });
    }, 600);
  }, []);

  return { ...state, trigger };
}
