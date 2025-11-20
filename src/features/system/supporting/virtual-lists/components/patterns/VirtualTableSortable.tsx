// src/features/boilerplate/supporting/virtual-lists/components/patterns/VirtualTableSortable.tsx

import React, { useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { clsx } from 'clsx'
import type { VirtualTableProps } from '../../types'

/**
 * VirtualTableSortable - A virtualized table with sorting capabilities
 *
 * Extends VirtualTable with built-in sorting functionality.
 * Perfect for large datasets that need client-side sorting.
 *
 * @example
 * ```tsx
 * <VirtualTableSortable
 *   data={users}
 *   columns={[
 *     { key: 'name', label: 'Name', sortable: true, render: (u) => u.name },
 *     { key: 'email', label: 'Email', sortable: true, render: (u) => u.email },
 *   ]}
 *   height={600}
 * />
 * ```
 */
export function VirtualTableSortable<T>({
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
  stickyHeader = true,
  enableRowHover = true,
}: VirtualTableProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key)
      if (!column) return 0

      // Get values to compare (simplified - you may want more robust comparison)
      const aValue = String((a as any)[sortConfig.key] ?? '')
      const bValue = String((b as any)[sortConfig.key] ?? '')

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [data, sortConfig, columns])

  // Handle column header click for sorting
  const handleSort = (columnKey: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnKey) {
        // Toggle direction or clear sort
        if (prev.direction === 'asc') {
          return { key: columnKey, direction: 'desc' }
        }
        return null // Clear sort
      }
      // New sort
      return { key: columnKey, direction: 'asc' }
    })
  }

  // Create virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: sortedData.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  })

  // Empty state
  if (sortedData.length === 0 && emptyComponent) {
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
        {columns.map((column) => {
          const isSorted = sortConfig?.key === column.key
          const sortDirection = isSorted ? sortConfig.direction : undefined

          return (
            <div
              key={column.key}
              className={clsx(
                'flex items-center px-4 py-2 font-medium text-sm text-gray-700 dark:text-gray-300',
                column.headerAlign === 'center' && 'justify-center',
                column.headerAlign === 'right' && 'justify-end',
                column.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 select-none',
                column.headerClassName
              )}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <span>{column.label}</span>
              {column.sortable && (
                <span className="ml-2">
                  {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
                </span>
              )}
            </div>
          )
        })}
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
            const item = sortedData[virtualRow.index]
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

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
      )}
    </div>
  )
}
