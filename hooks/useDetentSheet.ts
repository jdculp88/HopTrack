'use client'

// useDetentSheet — Sprint 170 (The Glass)
// iOS-style 3-detent bottom sheet: peek / half / full
// Manages snap points, drag constraints, velocity-based snapping, and haptic feedback.

import { useCallback, useEffect, useState } from 'react'
import { useMotionValue, animate, useReducedMotion } from 'motion/react'
import { useHaptic } from '@/hooks/useHaptic'
import { spring } from '@/lib/animation'

export type Detent = 'peek' | 'half' | 'full'

const PEEK_HEIGHT = 80     // px — minimized bar height
const HALF_RATIO = 0.45    // 45% of viewport
const FULL_RATIO = 0.95    // 95% of viewport
const FLING_THRESHOLD = 300 // px/s velocity for fling gesture

interface UseDetentSheetOptions {
  initialDetent?: Detent
  onDetentChange?: (detent: Detent) => void
}

function getSnapPoints() {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const sheetHeight = vh * FULL_RATIO
  const halfHeight = vh * HALF_RATIO
  // y = 0 → sheet at full height; y = sheetHeight - PEEK_HEIGHT → only peek visible
  return {
    full: 0,
    half: sheetHeight - halfHeight,
    peek: sheetHeight - PEEK_HEIGHT,
    sheetHeight,
  }
}

export function useDetentSheet(options: UseDetentSheetOptions = {}) {
  const { initialDetent = 'peek', onDetentChange } = options
  const [currentDetent, setCurrentDetent] = useState<Detent>(initialDetent)
  const { haptic } = useHaptic()
  const prefersReducedMotion = useReducedMotion()

  const y = useMotionValue(getSnapPoints()[initialDetent])

  const snapTo = useCallback((detent: Detent) => {
    const points = getSnapPoints()
    const target = points[detent]

    if (prefersReducedMotion) {
      y.set(target)
    } else {
      animate(y, target, spring.gentle)
    }

    setCurrentDetent(prev => {
      if (prev !== detent) {
        haptic('selection')
        onDetentChange?.(detent)
      }
      return detent
    })
  }, [y, prefersReducedMotion, haptic, onDetentChange])

  const handleDragEnd = useCallback((_: any, info: { velocity: { y: number } }) => {
    const points = getSnapPoints()
    const currentY = y.get()
    const velocity = info.velocity.y

    let target: Detent

    if (velocity > FLING_THRESHOLD) {
      // Flinging down → next lower detent
      if (currentDetent === 'full') target = 'half'
      else target = 'peek'
    } else if (velocity < -FLING_THRESHOLD) {
      // Flinging up → next higher detent
      if (currentDetent === 'peek') target = 'half'
      else target = 'full'
    } else {
      // Snap to nearest
      const distances: [Detent, number][] = [
        ['peek', Math.abs(currentY - points.peek)],
        ['half', Math.abs(currentY - points.half)],
        ['full', Math.abs(currentY - points.full)],
      ]
      target = distances.sort((a, b) => a[1] - b[1])[0][0]
    }

    snapTo(target)
  }, [y, currentDetent, snapTo])

  // Sync position when initialDetent changes (e.g. external navigation to 'full')
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync detent position on prop change
    snapTo(initialDetent)
  }, [initialDetent]) // eslint-disable-line react-hooks/exhaustive-deps

  const points = getSnapPoints()

  const dragProps = {
    drag: 'y' as const,
    dragConstraints: { top: 0, bottom: points.peek },
    dragElastic: { top: 0.05, bottom: 0.15 },
    onDragEnd: handleDragEnd,
    style: { y },
  }

  return {
    currentDetent,
    snapTo,
    dragProps,
    y,
    sheetHeight: points.sheetHeight,
  }
}
