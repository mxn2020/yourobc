// src/features/boilerplate/supporting/virtual-lists/hooks/patterns/useVirtualSmoothScroll.ts

import { useRef, useCallback } from 'react'
import { elementScroll } from '@tanstack/react-virtual'
import type { VirtualizerOptions } from '@tanstack/react-virtual'
import type { SmoothScrollOptions } from '../../types'

/**
 * Default easing function - ease in out quint
 */
function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t
}

/**
 * useVirtualSmoothScroll - Hook for creating smooth scroll animations
 *
 * Provides a custom scrollToFn that can be used with TanStack Virtual
 * to implement smooth, animated scrolling.
 *
 * @example
 * ```tsx
 * const scrollToFn = useVirtualSmoothScroll({
 *   duration: 1000,
 *   easing: (t) => t * t // ease in quad
 * })
 *
 * const virtualizer = useVirtualizer({
 *   count: items.length,
 *   getScrollElement: () => scrollRef.current,
 *   estimateSize: () => 50,
 *   scrollToFn
 * })
 * ```
 */
export function useVirtualSmoothScroll(options: SmoothScrollOptions = {}) {
  const { duration = 1000, easing = easeInOutQuint } = options

  const scrollingRef = useRef<number | undefined>(undefined)

  const scrollToFn: VirtualizerOptions<any, any>['scrollToFn'] = useCallback(
    (offset, canSmooth, instance) => {
      const scrollElement = instance.scrollElement
      if (!scrollElement) return

      const start = scrollElement.scrollTop
      const startTime = (scrollingRef.current = Date.now())

      const run = () => {
        // Check if this animation is still active
        if (scrollingRef.current !== startTime) return

        const now = Date.now()
        const elapsed = now - startTime
        const progress = easing(Math.min(elapsed / duration, 1))
        const interpolated = start + (offset - start) * progress

        if (elapsed < duration) {
          elementScroll(interpolated, canSmooth, instance)
          requestAnimationFrame(run)
        } else {
          elementScroll(interpolated, canSmooth, instance)
        }
      }

      requestAnimationFrame(run)
    },
    [duration, easing]
  )

  return scrollToFn
}

/**
 * Common easing functions
 */
export const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
  easeInOutQuint: easeInOutQuint,
}
