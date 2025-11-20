// src/features/boilerplate/supporting/virtual-lists/hooks/patterns/useVirtualGrid.ts

import { useVirtualizer } from '@tanstack/react-virtual'
import type { UseVirtualGridOptions } from '../../types'

/**
 * useVirtualGrid - Hook for creating virtualized grids
 *
 * Provides functionality for grid layouts with rows and columns.
 * Returns a row virtualizer - you'll render items in a grid within each row.
 *
 * @example
 * ```tsx
 * const rowVirtualizer = useVirtualGrid({
 *   count: items.length,
 *   columns: 4,
 *   estimateSize: 200,
 *   getScrollElement: () => scrollRef.current
 * })
 *
 * // In your render:
 * const rowCount = Math.ceil(items.length / columns)
 * virtualizer.setOptions({ count: rowCount })
 * ```
 */
export function useVirtualGrid(options: UseVirtualGridOptions) {
  const { count, columns, estimateSize, overscan = 5, getScrollElement } = options

  // Calculate number of rows based on items and columns
  const rowCount = Math.ceil(count / columns)

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement,
    estimateSize: () => estimateSize,
    overscan,
  })

  return {
    virtualizer,
    rowCount,
    columns,
    getItemsForRow: (rowIndex: number) => {
      const startIndex = rowIndex * columns
      const endIndex = Math.min(startIndex + columns, count)
      return { startIndex, endIndex, count: endIndex - startIndex }
    },
  }
}
