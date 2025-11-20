// src/features/system/supporting/tables/index.ts

/**
 * Tables Module - TanStack Table Integration
 *
 * This module provides a complete set of table components and utilities
 * built on TanStack Table (formerly React Table).
 *
 * Features:
 * - Sorting, filtering, pagination
 * - Row selection and expansion
 * - Column visibility control
 * - Flexible and customizable
 * - TypeScript-first design
 *
 * @example
 * ```tsx
 * // Option 1: Use pattern components
 * import { SortableTable, FilterableTable } from '@/features/system/supporting'
 *
 * // Option 2: Use full-featured DataTable
 * import { DataTable } from '@/features/system/supporting'
 *
 * // Option 3: Use presets
 * import { tablePresets } from '@/features/system/supporting'
 * const config = tablePresets.auditLog
 * ```
 */

// ============================================================================
// BASE COMPONENTS
// ============================================================================
export { BasicTable } from './components/BasicTable'
export { DataTable } from './components/DataTable'

// ============================================================================
// PATTERN COMPONENTS
// ============================================================================
export { SortableTable } from './components/patterns/SortableTable'
export { FilterableTable } from './components/patterns/FilterableTable'
export { PaginatedTable } from './components/patterns/PaginatedTable'

// ============================================================================
// HOOKS
// ============================================================================
export { useTableState } from './hooks/useTableState'

// ============================================================================
// UTILITIES & PRESETS
// ============================================================================
export {
  generateColumnsFromData,
  formatHeader,
  formatCellValue,
  createColumnHelper,
  globalFilterFn,
  exportToCSV,
  getPaginationInfo,
  getOptimalPageSize,
  shouldUsePagination,
  getPageSizeOptions,
  sortData,
  filterData,
  paginateData,
  cn,
} from './utils'

export {
  tablePresets,
  getPreset,
  extendPreset,
  presetRecommendations,
  presetExamples,
} from './utils/presets'

// ============================================================================
// TYPES
// ============================================================================
export type {
  BaseTableProps,
  BasicTableProps,
  DataTableProps,
  SortableTableProps,
  FilterableTableProps,
  PaginatedTableProps,
  ExpandableTableProps,
  SelectableTableProps,
  UseTableStateOptions,
  UseTableStateReturn,
  TablePreset,
  TablePresetName,
  // Re-exported TanStack Table types
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
  PaginationState,
  Table,
  Row,
  Column,
  Cell,
  Header,
  HeaderGroup,
} from './types'

// ============================================================================
// EXAMPLES
// ============================================================================
export { TableExample } from './examples'

// ============================================================================
// RE-EXPORTS FROM TANSTACK TABLE
// ============================================================================
export {
  useReactTable,
  createColumnHelper as createTanStackColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
} from '@tanstack/react-table'
