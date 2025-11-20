// src/features/boilerplate/supporting/tables/types/index.ts

import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  ExpandedState,
  PaginationState,
  TableOptions,
  OnChangeFn,
} from '@tanstack/react-table'

/**
 * Base props for all table components
 */
export interface BaseTableProps<TData> {
  /** Array of data items */
  data: TData[]
  /** Column definitions */
  columns: ColumnDef<TData, any>[]
  /** Optional className for the container */
  className?: string
  /** Optional className for the table element */
  tableClassName?: string
  /** Optional className for header rows */
  headerClassName?: string
  /** Optional className for body rows */
  rowClassName?: string | ((row: TData, index: number) => string)
  /** Loading state */
  isLoading?: boolean
  /** Loading component */
  loadingComponent?: React.ReactNode
  /** Empty state component */
  emptyComponent?: React.ReactNode
  /** Enable sticky header */
  stickyHeader?: boolean
  /** Enable row hover effect */
  enableRowHover?: boolean
}

/**
 * Props for BasicTable component
 */
export interface BasicTableProps<TData> extends BaseTableProps<TData> {
  /** Row click handler */
  onRowClick?: (row: TData, index: number) => void
  /** Enable zebra striping */
  striped?: boolean
  /** Enable bordered cells */
  bordered?: boolean
}

/**
 * Props for DataTable component (with advanced features)
 */
export interface DataTableProps<TData> extends BaseTableProps<TData> {
  /** Enable sorting */
  enableSorting?: boolean
  /** Initial sorting state */
  initialSorting?: SortingState
  /** Sorting state (controlled) */
  sorting?: SortingState
  /** Sorting change handler (controlled) */
  onSortingChange?: OnChangeFn<SortingState>

  /** Enable filtering */
  enableFiltering?: boolean
  /** Initial column filters */
  initialFilters?: ColumnFiltersState
  /** Column filters (controlled) */
  columnFilters?: ColumnFiltersState
  /** Filter change handler (controlled) */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>

  /** Enable pagination */
  enablePagination?: boolean
  /** Initial pagination state */
  initialPagination?: PaginationState
  /** Pagination state (controlled) */
  pagination?: PaginationState
  /** Pagination change handler (controlled) */
  onPaginationChange?: OnChangeFn<PaginationState>
  /** Total row count (for server-side pagination) */
  rowCount?: number

  /** Enable row selection */
  enableRowSelection?: boolean
  /** Initial row selection */
  initialRowSelection?: RowSelectionState
  /** Row selection (controlled) */
  rowSelection?: RowSelectionState
  /** Row selection change handler (controlled) */
  onRowSelectionChange?: OnChangeFn<RowSelectionState>

  /** Enable column visibility */
  enableColumnVisibility?: boolean
  /** Initial column visibility */
  initialColumnVisibility?: VisibilityState
  /** Column visibility (controlled) */
  columnVisibility?: VisibilityState
  /** Column visibility change handler (controlled) */
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>

  /** Enable expandable rows */
  enableExpanding?: boolean
  /** Initial expanded state */
  initialExpanded?: ExpandedState
  /** Expanded state (controlled) */
  expanded?: ExpandedState
  /** Expanded change handler (controlled) */
  onExpandedChange?: OnChangeFn<ExpandedState>
  /** Render expanded row content */
  renderExpandedRow?: (row: TData) => React.ReactNode

  /** Row click handler */
  onRowClick?: (row: TData, index: number) => void

  /** Manual pagination (for server-side) */
  manualPagination?: boolean
  /** Manual sorting (for server-side) */
  manualSorting?: boolean
  /** Manual filtering (for server-side) */
  manualFiltering?: boolean

  /** Custom table options */
  tableOptions?: Partial<TableOptions<TData>>
}

/**
 * Props for SortableTable pattern
 */
export interface SortableTableProps<TData> extends BaseTableProps<TData> {
  /** Initial sorting state */
  initialSorting?: SortingState
  /** Sorting change handler */
  onSortingChange?: OnChangeFn<SortingState>
  /** Enable multi-sort */
  enableMultiSort?: boolean
  /** Manual sorting */
  manualSorting?: boolean
}

/**
 * Props for FilterableTable pattern
 */
export interface FilterableTableProps<TData> extends BaseTableProps<TData> {
  /** Enable global filter/search */
  enableGlobalFilter?: boolean
  /** Global filter placeholder */
  globalFilterPlaceholder?: string
  /** Initial column filters */
  initialFilters?: ColumnFiltersState
  /** Filter change handler */
  onFiltersChange?: OnChangeFn<ColumnFiltersState>
  /** Manual filtering */
  manualFiltering?: boolean
}

/**
 * Props for PaginatedTable pattern
 */
export interface PaginatedTableProps<TData> extends BaseTableProps<TData> {
  /** Page size */
  pageSize?: number
  /** Available page sizes */
  pageSizeOptions?: number[]
  /** Initial page index */
  initialPageIndex?: number
  /** Total row count (for server-side) */
  rowCount?: number
  /** Manual pagination */
  manualPagination?: boolean
  /** Page change handler */
  onPaginationChange?: OnChangeFn<PaginationState>
}

/**
 * Props for ExpandableTable pattern
 */
export interface ExpandableTableProps<TData> extends BaseTableProps<TData> {
  /** Render expanded row content */
  renderExpandedRow: (row: TData) => React.ReactNode
  /** Initial expanded state */
  initialExpanded?: ExpandedState
  /** Expanded change handler */
  onExpandedChange?: OnChangeFn<ExpandedState>
  /** Enable expand all */
  enableExpandAll?: boolean
}

/**
 * Props for SelectableTable pattern
 */
export interface SelectableTableProps<TData> extends BaseTableProps<TData> {
  /** Enable row selection */
  enableRowSelection?: boolean | ((row: TData) => boolean)
  /** Enable multi-row selection */
  enableMultiRowSelection?: boolean
  /** Initial row selection */
  initialRowSelection?: RowSelectionState
  /** Row selection change handler */
  onRowSelectionChange?: (selection: RowSelectionState, selectedRows: TData[]) => void
  /** Show select all checkbox */
  showSelectAll?: boolean
}

/**
 * Options for useTableState hook
 */
export interface UseTableStateOptions<TData> {
  /** Initial sorting state */
  initialSorting?: SortingState
  /** Initial column filters */
  initialFilters?: ColumnFiltersState
  /** Initial pagination state */
  initialPagination?: PaginationState
  /** Initial row selection */
  initialRowSelection?: RowSelectionState
  /** Initial column visibility */
  initialColumnVisibility?: VisibilityState
  /** Initial expanded state */
  initialExpanded?: ExpandedState
  /** Enable URL sync */
  syncWithUrl?: boolean
  /** URL param prefix */
  urlParamPrefix?: string
}

/**
 * Return type for useTableState hook
 */
export interface UseTableStateReturn {
  /** Sorting state */
  sorting: SortingState
  /** Set sorting state */
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>

  /** Column filters state */
  columnFilters: ColumnFiltersState
  /** Set column filters state */
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>

  /** Pagination state */
  pagination: PaginationState
  /** Set pagination state */
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>

  /** Row selection state */
  rowSelection: RowSelectionState
  /** Set row selection state */
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>

  /** Column visibility state */
  columnVisibility: VisibilityState
  /** Set column visibility state */
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>

  /** Expanded state */
  expanded: ExpandedState
  /** Set expanded state */
  setExpanded: React.Dispatch<React.SetStateAction<ExpandedState>>

  /** Reset all state */
  resetState: () => void
}

/**
 * Table preset configuration
 */
export interface TablePreset {
  /** Name of the preset */
  name: string
  /** Description */
  description: string
  /** Enable sorting */
  enableSorting?: boolean
  /** Enable filtering */
  enableFiltering?: boolean
  /** Enable pagination */
  enablePagination?: boolean
  /** Page size */
  pageSize?: number
  /** Enable row selection */
  enableRowSelection?: boolean
  /** Enable sticky header */
  stickyHeader?: boolean
  /** Enable row hover */
  enableRowHover?: boolean
  /** Enable striped rows */
  striped?: boolean
  /** Enable bordered cells */
  bordered?: boolean
}

/**
 * Preset name type
 */
export type TablePresetName =
  | 'basic'
  | 'sortable'
  | 'filterable'
  | 'paginated'
  | 'fullFeatured'
  | 'compact'
  | 'auditLog'
  | 'dataGrid'

// Re-export TanStack Table types
export type {
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
} from '@tanstack/react-table'
