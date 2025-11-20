// src/features/boilerplate/supporting/tables/components/patterns/FilterableTable.tsx

import React, { useState } from 'react'
import type { FilterableTableProps } from '../../types'
import { DataTable } from '../DataTable'

/**
 * FilterableTable - Table with column filters and global search
 *
 * Pre-configured table component with filtering enabled.
 * Includes optional global search bar.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
 *   { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
 *   { accessorKey: 'role', header: 'Role' },
 * ]
 *
 * <FilterableTable
 *   data={data}
 *   columns={columns}
 *   enableGlobalFilter
 *   globalFilterPlaceholder="Search all columns..."
 * />
 * ```
 */
export function FilterableTable<TData>({
  data,
  columns,
  enableGlobalFilter = false,
  globalFilterPlaceholder = 'Search...',
  initialFilters = [],
  onFiltersChange,
  manualFiltering = false,
  ...rest
}: FilterableTableProps<TData>) {
  const [columnFilters, setColumnFilters] = useState(initialFilters)
  const [globalFilter, setGlobalFilter] = useState('')

  return (
    <div className="space-y-4">
      {/* Global Search */}
      {enableGlobalFilter && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={globalFilterPlaceholder}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-md"
          />
        </div>
      )}

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        enableFiltering
        columnFilters={columnFilters}
        onColumnFiltersChange={onFiltersChange || setColumnFilters}
        manualFiltering={manualFiltering}
        tableOptions={{
          state: {
            globalFilter,
          },
          onGlobalFilterChange: setGlobalFilter,
        }}
        {...rest}
      />
    </div>
  )
}
