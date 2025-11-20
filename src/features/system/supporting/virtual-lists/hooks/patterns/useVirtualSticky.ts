// src/features/system/supporting/virtual-lists/hooks/patterns/useVirtualSticky.ts

import { useRef, useCallback } from 'react'
import { useVirtualizer, defaultRangeExtractor } from '@tanstack/react-virtual'
import type { Range } from '@tanstack/react-virtual'
import type { UseVirtualStickyOptions } from '../../types'

/**
 * useVirtualSticky - Hook for creating virtualized lists with sticky items
 *
 * Provides functionality for lists where certain items (like headers) stick to the top while scrolling.
 *
 * @example
 * ```tsx
 * const { virtualizer, isSticky, isActiveSticky } = useVirtualSticky({
 *   count: items.length,
 *   stickyIndices: [0, 10, 20],
 *   estimateSize: 50,
 *   getScrollElement: () => scrollRef.current
 * })
 * ```
 */
export function useVirtualSticky(options: UseVirtualStickyOptions) {
  const { count, stickyIndices, estimateSize, overscan = 5, getScrollElement } = options

  const activeStickyIndexRef = useRef(0)

  const isSticky = useCallback(
    (index: number) => stickyIndices.includes(index),
    [stickyIndices]
  )

  const isActiveSticky = useCallback(
    (index: number) => activeStickyIndexRef.current === index,
    []
  )

  const virtualizer = useVirtualizer({
    count,
    getScrollElement,
    estimateSize: () => estimateSize,
    overscan,
    rangeExtractor: useCallback(
      (range: Range) => {
        // Find the active sticky item (the one that should be stuck at top)
        activeStickyIndexRef.current =
          [...stickyIndices]
            .reverse()
            .find((index) => range.startIndex >= index) ?? 0

        // Include the active sticky item in the rendered range
        const next = new Set([activeStickyIndexRef.current, ...defaultRangeExtractor(range)])

        return [...next].sort((a, b) => a - b)
      },
      [stickyIndices]
    ),
  })

  return {
    virtualizer,
    isSticky,
    isActiveSticky,
    activeStickyIndex: activeStickyIndexRef.current,
  }
}
