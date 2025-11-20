// src/features/system/supporting/virtual-lists/hooks/patterns/useVirtualMasonry.ts

import { useVirtualizer } from '@tanstack/react-virtual'
import type { UseVirtualMasonryOptions } from '../../types'

/**
 * useVirtualMasonry - Hook for creating virtualized masonry layouts
 *
 * Provides functionality for Pinterest-style masonry layouts with multiple lanes.
 *
 * @example
 * ```tsx
 * const virtualizer = useVirtualMasonry({
 *   count: items.length,
 *   lanes: 4,
 *   estimateSize: (index) => itemHeights[index],
 *   getScrollElement: () => scrollRef.current
 * })
 * ```
 */
export function useVirtualMasonry(options: UseVirtualMasonryOptions) {
  const {
    count,
    lanes,
    estimateSize,
    overscan = 5,
    getScrollElement,
    horizontal = false,
  } = options

  const virtualizer = useVirtualizer({
    count,
    getScrollElement,
    estimateSize,
    overscan,
    lanes, // Enable masonry layout
    horizontal,
  })

  return virtualizer
}
