// src/features/boilerplate/supporting/tables/components/patterns/PaginatedTable.tsx

import React, { useState } from 'react'
import type { PaginatedTableProps } from '../../types'
import { DataTable } from '../DataTable'
import { getPageSizeOptions } from '../../utils'

/**
 * PaginatedTable - Table with pagination controls
 *
 * Pre-configured table component with pagination enabled.
 * Includes page size selector and navigation controls.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'email', header: 'Email' },
 *   { accessorKey: 'role', header: 'Role' },
 * ]
 *
 * <PaginatedTable
 *   data={data}
 *   columns={columns}
 *   pageSize={25}
 *   pageSizeOptions={[10, 25, 50, 100]}
 * />
 * ```
 */
export function PaginatedTable<TData>({
  data,
  columns,
  pageSize = 10,
  pageSizeOptions,
  initialPageIndex = 0,
  rowCount,
  manualPagination = false,
  onPaginationChange,
  ...rest
}: PaginatedTableProps<TData>) {
  const [pagination, setPagination] = useState({
    pageIndex: initialPageIndex,
    pageSize,
  })

  const actualPageSizeOptions = pageSizeOptions || getPageSizeOptions(data.length)

  return (
    <div className="space-y-4">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-gray-700">
          Rows per page:
        </label>
        <select
          id="pageSize"
          value={pagination.pageSize}
          onChange={(e) => {
            setPagination((prev) => ({
              ...prev,
              pageSize: Number(e.target.value),
              pageIndex: 0, // Reset to first page
            }))
          }}
          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {actualPageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        enablePagination
        pagination={pagination}
        onPaginationChange={onPaginationChange || setPagination}
        rowCount={rowCount}
        manualPagination={manualPagination}
        {...rest}
      />
    </div>
  )
}
