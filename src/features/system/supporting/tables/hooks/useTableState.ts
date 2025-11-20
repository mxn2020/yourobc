// src/features/system/supporting/tables/hooks/useTableState.ts

import { useState, useCallback } from 'react'
import type {
  SortingState,
  ColumnFiltersState,
  PaginationState,
  RowSelectionState,
  VisibilityState,
  ExpandedState,
} from '@tanstack/react-table'
import type { UseTableStateOptions, UseTableStateReturn } from '../types'

/**
 * Hook for managing all table state in one place
 *
 * @example
 * ```tsx
 * const tableState = useTableState({
 *   initialPagination: { pageIndex: 0, pageSize: 10 },
 *   initialSorting: [{ id: 'name', desc: false }],
 * })
 *
 * <DataTable
 *   data={data}
 *   columns={columns}
 *   sorting={tableState.sorting}
 *   onSortingChange={tableState.setSorting}
 *   pagination={tableState.pagination}
 *   onPaginationChange={tableState.setPagination}
 * />
 * ```
 */
export function useTableState<TData = any>(
  options: UseTableStateOptions<TData> = {}
): UseTableStateReturn {
  const {
    initialSorting = [],
    initialFilters = [],
    initialPagination = { pageIndex: 0, pageSize: 10 },
    initialRowSelection = {},
    initialColumnVisibility = {},
    initialExpanded = {},
  } = options

  // State management
  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters)
  const [pagination, setPagination] = useState<PaginationState>(initialPagination)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialRowSelection)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility)
  const [expanded, setExpanded] = useState<ExpandedState>(initialExpanded)

  // Reset all state to initial values
  const resetState = useCallback(() => {
    setSorting(initialSorting)
    setColumnFilters(initialFilters)
    setPagination(initialPagination)
    setRowSelection(initialRowSelection)
    setColumnVisibility(initialColumnVisibility)
    setExpanded(initialExpanded)
  }, [
    initialSorting,
    initialFilters,
    initialPagination,
    initialRowSelection,
    initialColumnVisibility,
    initialExpanded,
  ])

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    rowSelection,
    setRowSelection,
    columnVisibility,
    setColumnVisibility,
    expanded,
    setExpanded,
    resetState,
  }
}
