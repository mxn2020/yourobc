// src/features/system/supporting/virtual-lists/components/VirtualList.tsx

import React, { useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualListProps } from '../types'

/**
 * VirtualList - A performant virtualized list component
 *
 * Renders large lists efficiently by only rendering visible items.
 * Perfect for lists with 1000+ items.
 *
 * @example
 * ```tsx
 * <VirtualList
 *   items={myData}
 *   height={600}
 *   estimateSize={50}
 *   renderItem={(item, index) => <div>{item.name}</div>}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  height,
  estimateSize = 50,
  overscan = 5,
  renderItem,
  className = '',
  itemClassName = '',
  onScroll,
  gap = 0,
  isLoading = false,
  loadingComponent,
  emptyComponent,
  enableInfiniteScroll = false,
  onLoadMore,
  loadMoreThreshold = 500,
  scrollElementRef: externalScrollRef,
}: VirtualListProps<T>) {
  const internalScrollRef = useRef<HTMLDivElement>(null)
  const scrollRef = externalScrollRef || internalScrollRef

  // Create virtualizer
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
  })

  // Handle scroll events
  useEffect(() => {
    if (onScroll) {
      const scrollElement = scrollRef.current
      if (!scrollElement) return

      const handleScroll = () => {
        onScroll(scrollElement.scrollTop)
      }

      scrollElement.addEventListener('scroll', handleScroll)
      return () => scrollElement.removeEventListener('scroll', handleScroll)
    }
  }, [onScroll, scrollRef])

  // Handle infinite scroll
  useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore || isLoading) return

    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < loadMoreThreshold) {
        onLoadMore()
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [enableInfiniteScroll, onLoadMore, isLoading, loadMoreThreshold, scrollRef])

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
      ref={scrollRef as React.RefObject<HTMLDivElement>}
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
              className={itemClassName}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
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
