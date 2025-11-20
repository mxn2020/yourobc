// src/features/system/supporting/virtual-lists/components/patterns/VirtualMasonry.tsx

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualMasonryProps } from '../../types'

/**
 * VirtualMasonry - A performant virtualized masonry layout component
 *
 * Renders items in a Pinterest-style masonry layout with multiple lanes.
 * Perfect for image galleries, Pinterest-like layouts, or any variable-height content.
 *
 * @example
 * ```tsx
 * <VirtualMasonry
 *   items={images}
 *   height={600}
 *   lanes={4}
 *   estimateSize={(index) => imageHeights[index]}
 *   renderItem={(image) => <img src={image.url} alt={image.title} />}
 * />
 * ```
 */
export function VirtualMasonry<T>({
  items,
  height,
  width,
  lanes,
  estimateSize,
  overscan = 5,
  renderItem,
  className = '',
  itemClassName = '',
  gap = 0,
  orientation = 'vertical',
  isLoading = false,
  emptyComponent,
  enableInfiniteScroll = false,
  onLoadMore,
}: VirtualMasonryProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Create virtualizer with lanes (masonry layout)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: typeof estimateSize === 'function' ? estimateSize : () => estimateSize,
    overscan,
    lanes, // Enable masonry layout
    horizontal: orientation === 'horizontal',
  })

  // Handle infinite scroll
  React.useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore || isLoading) return

    const scrollElement = parentRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = scrollElement

      if (orientation === 'vertical') {
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight
        if (distanceFromBottom < 500) {
          onLoadMore()
        }
      } else {
        const distanceFromEnd = scrollWidth - scrollLeft - clientWidth
        if (distanceFromEnd < 500) {
          onLoadMore()
        }
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [enableInfiniteScroll, onLoadMore, isLoading, orientation])

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
        height: orientation === 'vertical' ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
        width: orientation === 'horizontal' ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        overflow: 'auto',
      }}
    >
      {/* Total size container */}
      <div
        style={{
          height: orientation === 'vertical' ? `${virtualizer.getTotalSize()}px` : '100%',
          width: orientation === 'horizontal' ? `${virtualizer.getTotalSize()}px` : '100%',
          position: 'relative',
        }}
      >
        {/* Only render visible items */}
        {virtualItems.map((virtualItem) => {
          const item = items[virtualItem.index]

          // Calculate lane width percentage
          const laneWidth = 100 / lanes

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              className={itemClassName}
              style={{
                position: 'absolute',
                ...(orientation === 'vertical'
                  ? {
                      top: 0,
                      left: `${virtualItem.lane * laneWidth}%`,
                      width: `calc(${laneWidth}% - ${gap}px)`,
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }
                  : {
                      left: 0,
                      top: `${virtualItem.lane * laneWidth}%`,
                      height: `calc(${laneWidth}% - ${gap}px)`,
                      width: `${virtualItem.size}px`,
                      transform: `translateX(${virtualItem.start}px)`,
                    }),
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          )
        })}
      </div>

      {/* Loading indicator */}
      {isLoading && enableInfiniteScroll && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div>Loading more...</div>
        </div>
      )}
    </div>
  )
}
