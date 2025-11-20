// src/features/system/supporting/virtual-lists/components/VirtualListDynamic.tsx

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualListProps } from '../types'

/**
 * VirtualListDynamic - A virtualized list with dynamic item heights
 *
 * Uses ResizeObserver to measure actual item heights dynamically.
 * Best for lists where item heights vary significantly.
 *
 * @example
 * ```tsx
 * <VirtualListDynamic
 *   items={myData}
 *   height={600}
 *   estimateSize={100}
 *   renderItem={(item) => <div>{item.content}</div>}
 * />
 * ```
 */
export function VirtualListDynamic<T>({
  items,
  height,
  estimateSize = 50,
  overscan = 5,
  renderItem,
  className = '',
  itemClassName = '',
  gap = 0,
  isLoading = false,
  loadingComponent,
  emptyComponent,
}: VirtualListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Create virtualizer with dynamic measurement
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    // Enable dynamic measurement
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height ?? estimateSize
        : undefined,
  })

  // Loading state
  if (isLoading && loadingComponent) {
    return <div className={className}>{loadingComponent}</div>
  }

  // Empty state
  if (items.length === 0 && emptyComponent) {
    return <div className={className}>{emptyComponent}</div>
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div
      ref={scrollRef}
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

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
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
