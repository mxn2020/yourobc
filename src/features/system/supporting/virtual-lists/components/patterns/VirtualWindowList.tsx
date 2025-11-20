// src/features/system/supporting/virtual-lists/components/patterns/VirtualWindowList.tsx

import React, { useRef } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { VirtualWindowListProps } from '../../types'

/**
 * VirtualWindowList - A virtualized list using the window as scroll container
 *
 * Renders lists that use the browser window for scrolling instead of a container element.
 * Perfect for full-page lists, infinite feeds, or when you want natural page scrolling.
 *
 * @example
 * ```tsx
 * <VirtualWindowList
 *   items={posts}
 *   estimateSize={200}
 *   scrollMargin={64} // Height of fixed header
 *   renderItem={(post) => <PostCard post={post} />}
 * />
 * ```
 */
export function VirtualWindowList<T>({
  items,
  estimateSize = 50,
  overscan = 5,
  renderItem,
  className = '',
  itemClassName = '',
  gap = 0,
  scrollMargin = 0,
  isLoading = false,
  emptyComponent,
  enableInfiniteScroll = false,
  onLoadMore,
}: VirtualWindowListProps<T>) {
  const listRef = useRef<HTMLDivElement | null>(null)

  // Create window virtualizer
  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => estimateSize,
    overscan,
    scrollMargin,
    gap,
  })

  // Handle infinite scroll
  React.useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore || isLoading) return

    const handleScroll = () => {
      const { scrollY, innerHeight } = window
      const { scrollHeight } = document.documentElement

      const distanceFromBottom = scrollHeight - scrollY - innerHeight

      if (distanceFromBottom < 500) {
        onLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enableInfiniteScroll, onLoadMore, isLoading])

  // Empty state
  if (items.length === 0 && emptyComponent) {
    return <div className={className}>{emptyComponent}</div>
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div ref={listRef} className={className}>
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
                transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
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
