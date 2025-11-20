// src/features/boilerplate/supporting/virtual-lists/components/patterns/VirtualGrid.tsx

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { VirtualGridProps } from '../../types'

/**
 * VirtualGrid - A performant virtualized grid component
 *
 * Renders large grids efficiently by only rendering visible items in a 2D grid layout.
 * Perfect for image galleries, product catalogs, or any grid-based data.
 *
 * @example
 * ```tsx
 * <VirtualGrid
 *   items={products}
 *   height={600}
 *   width={800}
 *   columns={4}
 *   estimateItemHeight={200}
 *   renderItem={(product) => <ProductCard product={product} />}
 * />
 * ```
 */
export function VirtualGrid<T>({
  items,
  height,
  columns,
  estimateItemHeight = 200,
  overscan = 5,
  renderItem,
  className = '',
  itemClassName = '',
  gap = 0,
  isLoading = false,
  emptyComponent,
  enableInfiniteScroll = false,
  onLoadMore,
}: VirtualGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  // Calculate rows based on items and columns
  const rowCount = Math.ceil(items.length / columns)

  // Create virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateItemHeight,
    overscan,
  })

  // Handle infinite scroll
  React.useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore || isLoading) return

    const scrollElement = parentRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < 500) {
        onLoadMore()
      }
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [enableInfiniteScroll, onLoadMore, isLoading])

  // Empty state
  if (items.length === 0 && emptyComponent) {
    return <div className={className}>{emptyComponent}</div>
  }

  const virtualRows = rowVirtualizer.getVirtualItems()

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
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Only render visible rows */}
        {virtualRows.map((virtualRow) => {
          const startIndex = virtualRow.index * columns
          const endIndex = Math.min(startIndex + columns, items.length)
          const rowItems = items.slice(startIndex, endIndex)

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: `${gap}px`,
              }}
            >
              {rowItems.map((item, colIndex) => {
                const itemIndex = startIndex + colIndex
                return (
                  <div key={itemIndex} className={itemClassName}>
                    {renderItem(item, itemIndex)}
                  </div>
                )
              })}
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
