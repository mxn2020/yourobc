// src/features/boilerplate/supporting/tables/components/patterns/SortableTable.tsx

import React, { useState } from 'react'
import type { SortableTableProps } from '../../types'
import { DataTable } from '../DataTable'

/**
 * SortableTable - Table with sortable columns
 *
 * Pre-configured table component with sorting enabled.
 * Click column headers to sort.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name', enableSorting: true },
 *   { accessorKey: 'date', header: 'Date', enableSorting: true },
 *   { accessorKey: 'status', header: 'Status' },
 * ]
 *
 * <SortableTable
 *   data={data}
 *   columns={columns}
 *   enableMultiSort
 * />
 * ```
 */
export function SortableTable<TData>({
  data,
  columns,
  initialSorting = [],
  onSortingChange,
  enableMultiSort = false,
  manualSorting = false,
  ...rest
}: SortableTableProps<TData>) {
  const [sorting, setSorting] = useState(initialSorting)

  return (
    <DataTable
      data={data}
      columns={columns}
      enableSorting
      sorting={sorting}
      onSortingChange={onSortingChange || setSorting}
      manualSorting={manualSorting}
      tableOptions={{
        enableMultiSort,
      }}
      {...rest}
    />
  )
}
