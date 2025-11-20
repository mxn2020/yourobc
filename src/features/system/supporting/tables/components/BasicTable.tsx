// src/features/boilerplate/supporting/tables/components/BasicTable.tsx

import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table'
import type { BasicTableProps } from '../types'
import { cn } from '../utils'

/**
 * BasicTable - A simple table component with minimal features
 *
 * Perfect for displaying simple datasets without advanced features
 * like sorting, filtering, or pagination.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'email', header: 'Email' },
 *   { accessorKey: 'role', header: 'Role' },
 * ]
 *
 * <BasicTable
 *   data={users}
 *   columns={columns}
 *   enableRowHover
 *   striped
 * />
 * ```
 */
export function BasicTable<TData>({
  data,
  columns,
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  isLoading = false,
  loadingComponent,
  emptyComponent,
  stickyHeader = false,
  enableRowHover = true,
  onRowClick,
  striped = false,
  bordered = false,
}: BasicTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Loading state
  if (isLoading && loadingComponent) {
    return <div className={className}>{loadingComponent}</div>
  }

  // Empty state
  if (data.length === 0) {
    if (emptyComponent) {
      return <div className={className}>{emptyComponent}</div>
    }
    return (
      <div className={cn('p-8 text-center text-gray-500', className)}>
        No data available
      </div>
    )
  }

  return (
    <div className={cn('overflow-auto', className)}>
      <table
        className={cn(
          'w-full border-collapse',
          bordered && 'border border-gray-300',
          tableClassName
        )}
      >
        <thead
          className={cn(
            'bg-gray-50',
            stickyHeader && 'sticky top-0 z-10',
            headerClassName
          )}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-200">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider',
                    bordered && 'border-r border-gray-300 last:border-r-0'
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row, index) => {
            const computedRowClassName =
              typeof rowClassName === 'function'
                ? rowClassName(row.original, index)
                : rowClassName

            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original, index)}
                className={cn(
                  'transition-colors',
                  enableRowHover && 'hover:bg-gray-50',
                  striped && index % 2 === 1 && 'bg-gray-50',
                  onRowClick && 'cursor-pointer',
                  computedRowClassName
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      'px-4 py-3 text-sm text-gray-900',
                      bordered && 'border-r border-gray-300 last:border-r-0'
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
