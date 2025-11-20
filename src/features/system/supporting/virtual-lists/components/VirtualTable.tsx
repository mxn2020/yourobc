// src/features/boilerplate/supporting/virtual-lists/components/VirtualTable.tsx

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { clsx } from 'clsx'
import type { VirtualTableProps } from '../types'

/**
 * VirtualTable - A performant virtualized table component
 *
 * Renders large tables efficiently by only rendering visible rows.
 * Perfect for tables with 1000+ rows.
 *
 * @example
 * ```tsx
 * <VirtualTable
 *   data={myData}
 *   columns={[
 *     { key: 'name', label: 'Name', render: (item) => item.name },
 *     { key: 'email', label: 'Email', render: (item) => item.email },
 *   ]}
 *   height={600}
 *   estimateRowHeight={50}
 * />
 * ```
 */
export function VirtualTable<T>({
  data,
  columns,
  height,
  estimateRowHeight = 50,
  estimateHeaderHeight = 50,
  overscan = 5,
  className = '',
  rowClassName,
  headerClassName = '',
  isLoading = false,
  emptyComponent,
  onRowClick,
  enableInfiniteScroll = false,
  onLoadMore,
  stickyHeader = true,
  enableRowHover = true,
}: VirtualTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Create virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  })

  // Handle infinite scroll
  React.useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore || isLoading) return

    const scrollElement = scrollRef.current
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
  if (data.length === 0 && emptyComponent) {
    return <div className={className}>{emptyComponent}</div>
  }

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div className={clsx('relative', className)}>
      {/* Header */}
      <div
        className={clsx(
          'grid border-b bg-gray-50 dark:bg-gray-800',
          stickyHeader && 'sticky top-0 z-10',
          headerClassName
        )}
        style={{
          gridTemplateColumns: columns.map((col) => col.width || '1fr').join(' '),
          height: `${estimateHeaderHeight}px`,
        }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={clsx(
              'flex items-center px-4 py-2 font-medium text-sm text-gray-700 dark:text-gray-300',
              column.headerAlign === 'center' && 'justify-center',
              column.headerAlign === 'right' && 'justify-end',
              column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
              column.headerClassName
            )}
            onClick={column.onHeaderClick}
          >
            <span>{column.label}</span>
            {column.sortable && column.sortDirection && (
              <span className="ml-2">
                {column.sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Scrollable body */}
      <div
        ref={scrollRef}
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
            const item = data[virtualRow.index]
            const isEven = virtualRow.index % 2 === 0

            const rowClasses = clsx(
              'grid border-b',
              isEven ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800',
              enableRowHover && 'hover:bg-gray-100 dark:hover:bg-gray-700',
              onRowClick && 'cursor-pointer',
              typeof rowClassName === 'function'
                ? rowClassName(item, virtualRow.index)
                : rowClassName
            )

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                className={rowClasses}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  gridTemplateColumns: columns.map((col) => col.width || '1fr').join(' '),
                }}
                onClick={() => onRowClick?.(item, virtualRow.index)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={clsx(
                      'flex items-center px-4 py-2 text-sm',
                      column.align === 'center' && 'justify-center',
                      column.align === 'right' && 'justify-end',
                      column.className
                    )}
                  >
                    {column.render(item, virtualRow.index)}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Loading indicator for infinite scroll */}
      {isLoading && enableInfiniteScroll && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-gray-500">Loading more...</div>
        </div>
      )}
    </div>
  )
}
