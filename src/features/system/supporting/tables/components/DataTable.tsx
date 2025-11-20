// src/features/system/supporting/tables/components/DataTable.tsx

import React, { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table'
import type { DataTableProps } from '../types'
import { cn, getPaginationInfo } from '../utils'

/**
 * DataTable - A full-featured table component with sorting, filtering, pagination, and more
 *
 * This is the primary table component that supports all advanced features.
 * Features can be enabled/disabled as needed.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name', enableSorting: true },
 *   { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
 *   { accessorKey: 'role', header: 'Role' },
 * ]
 *
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   enableSorting
 *   enableFiltering
 *   enablePagination
 *   pageSize={25}
 * />
 * ```
 */
export function DataTable<TData>({
  data,
  columns,
  className = '',
  tableClassName = '',
  headerClassName = '',
  rowClassName = '',
  isLoading = false,
  loadingComponent,
  emptyComponent,
  stickyHeader = true,
  enableRowHover = true,
  onRowClick,

  // Sorting
  enableSorting = false,
  initialSorting,
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,

  // Filtering
  enableFiltering = false,
  initialFilters,
  columnFilters: controlledFilters,
  onColumnFiltersChange,
  manualFiltering = false,

  // Pagination
  enablePagination = false,
  initialPagination,
  pagination: controlledPagination,
  onPaginationChange,
  rowCount,
  manualPagination = false,

  // Row Selection
  enableRowSelection = false,
  initialRowSelection,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,

  // Column Visibility
  enableColumnVisibility = false,
  initialColumnVisibility,
  columnVisibility: controlledColumnVisibility,
  onColumnVisibilityChange,

  // Expanding
  enableExpanding = false,
  initialExpanded,
  expanded: controlledExpanded,
  onExpandedChange,
  renderExpandedRow,

  // Custom options
  tableOptions = {},
}: DataTableProps<TData>) {
  // Internal state (used when not controlled)
  const [sorting, setSorting] = useState(initialSorting || [])
  const [columnFilters, setColumnFilters] = useState(initialFilters || [])
  const [pagination, setPagination] = useState(initialPagination || { pageIndex: 0, pageSize: 10 })
  const [rowSelection, setRowSelection] = useState(initialRowSelection || {})
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility || {})
  const [expanded, setExpanded] = useState(initialExpanded || {})

  // Use controlled state if provided, otherwise use internal state
  const actualSorting = controlledSorting !== undefined ? controlledSorting : sorting
  const actualFilters = controlledFilters !== undefined ? controlledFilters : columnFilters
  const actualPagination = controlledPagination !== undefined ? controlledPagination : pagination
  const actualRowSelection = controlledRowSelection !== undefined ? controlledRowSelection : rowSelection
  const actualColumnVisibility = controlledColumnVisibility !== undefined ? controlledColumnVisibility : columnVisibility
  const actualExpanded = controlledExpanded !== undefined ? controlledExpanded : expanded

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    // Sorting
    ...(enableSorting && {
      enableSorting: true,
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: onSortingChange || setSorting,
      manualSorting,
    }),

    // Filtering
    ...(enableFiltering && {
      enableFilters: true,
      getFilteredRowModel: getFilteredRowModel(),
      onColumnFiltersChange: onColumnFiltersChange || setColumnFilters,
      manualFiltering,
    }),

    // Pagination
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      onPaginationChange: onPaginationChange || setPagination,
      manualPagination,
      ...(rowCount !== undefined && { rowCount }),
    }),

    // Row Selection
    ...(enableRowSelection && {
      enableRowSelection: true,
      onRowSelectionChange: onRowSelectionChange || setRowSelection,
    }),

    // Column Visibility
    ...(enableColumnVisibility && {
      onColumnVisibilityChange: onColumnVisibilityChange || setColumnVisibility,
    }),

    // Expanding
    ...(enableExpanding && {
      getExpandedRowModel: getExpandedRowModel(),
      onExpandedChange: onExpandedChange || setExpanded,
    }),

    // Merge all state into a single state object
    state: {
      ...tableOptions.state,
      ...(enableSorting && { sorting: actualSorting }),
      ...(enableFiltering && { columnFilters: actualFilters }),
      ...(enablePagination && { pagination: actualPagination }),
      ...(enableRowSelection && { rowSelection: actualRowSelection }),
      ...(enableColumnVisibility && { columnVisibility: actualColumnVisibility }),
      ...(enableExpanding && { expanded: actualExpanded }),
    },

    ...tableOptions,
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

  const paginationInfo = enablePagination
    ? getPaginationInfo(
        actualPagination.pageIndex,
        actualPagination.pageSize,
        rowCount || data.length
      )
    : null

  return (
    <div className={cn('space-y-4', className)}>
      {/* Table */}
      <div className="overflow-auto border border-gray-200 rounded-lg">
        <table className={cn('w-full border-collapse', tableClassName)}>
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
                      header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-100'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-gray-400">
                          {{
                            asc: '↑',
                            desc: '↓',
                          }[header.column.getIsSorted() as string] ?? '↕'}
                        </span>
                      )}
                    </div>
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
                <React.Fragment key={row.id}>
                  <tr
                    onClick={() => onRowClick?.(row.original, index)}
                    className={cn(
                      'transition-colors',
                      enableRowHover && 'hover:bg-gray-50',
                      onRowClick && 'cursor-pointer',
                      computedRowClassName
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {enableExpanding && row.getIsExpanded() && renderExpandedRow && (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-3 bg-gray-50">
                        {renderExpandedRow(row.original)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {enablePagination && paginationInfo && (
        <div className="flex items-center justify-between px-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{paginationInfo.startRow}</span> to{' '}
            <span className="font-medium">{paginationInfo.endRow}</span> of{' '}
            <span className="font-medium">{rowCount || data.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{paginationInfo.currentPage}</span> of{' '}
              <span className="font-medium">{paginationInfo.totalPages}</span>
            </span>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
