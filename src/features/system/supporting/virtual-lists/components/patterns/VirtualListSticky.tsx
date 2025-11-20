// src/features/system/supporting/virtual-lists/components/patterns/VirtualListSticky.tsx

import React, { useRef, useMemo } from 'react'
import { useVirtualizer, defaultRangeExtractor } from '@tanstack/react-virtual'
import type { Range } from '@tanstack/react-virtual'
import type { VirtualListStickyProps } from '../../types'

/**
 * VirtualListSticky - A virtualized list with sticky items
 *
 * Renders lists where certain items (like headers) stick to the top while scrolling.
 * Perfect for alphabetically sorted lists, grouped data, or section headers.
 *
 * @example
 * ```tsx
 * <VirtualListSticky
 *   items={sortedNames}
 *   height={600}
 *   estimateSize={50}
 *   isStickyItem={(item, index) => item.isHeader}
 *   renderItem={(item) => (
 *     <div className={item.isHeader ? 'font-bold' : ''}>
 *       {item.name}
 *     </div>
 *   )}
 * />
 * ```
 */
export function VirtualListSticky<T>({
  items,
  height,
  estimateSize = 50,
  overscan = 5,
  renderItem,
  isStickyItem,
  className = '',
  itemClassName = '',
  stickyItemClassName = '',
  isLoading = false,
  emptyComponent,
}: VirtualListStickyProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const activeStickyIndexRef = useRef(0)

  // Get indices of all sticky items
  const stickyIndices = useMemo(
    () => items.map((item, index) => ({ item, index })).filter(({ item, index }) => isStickyItem(item, index)).map(({ index }) => index),
    [items, isStickyItem]
  )

  const isSticky = (index: number) => stickyIndices.includes(index)

  const isActiveSticky = (index: number) => activeStickyIndexRef.current === index

  // Create virtualizer with custom range extractor for sticky items
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    rangeExtractor: React.useCallback(
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

  // Empty state
  if (items.length === 0 && emptyComponent) {
    return <div className={className}>{emptyComponent}</div>
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'auto',
      }}
    >
      {/* Total height container */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Only render visible items */}
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index]
          const isItemSticky = isSticky(virtualItem.index)
          const isItemActiveSticky = isActiveSticky(virtualItem.index)

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              className={`${itemClassName} ${isItemSticky ? stickyItemClassName : ''}`}
              style={{
                ...(isItemSticky
                  ? {
                      background: '#fff',
                      borderBottom: '1px solid #e5e7eb',
                      zIndex: 1,
                    }
                  : {}),
                ...(isItemActiveSticky
                  ? {
                      position: 'sticky',
                    }
                  : {
                      position: 'absolute',
                      transform: `translateY(${virtualItem.start}px)`,
                    }),
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
