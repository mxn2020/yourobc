// src/features/system/supporting/tables/utils/index.ts

import type { ColumnDef } from '@tanstack/react-table'

/**
 * Generates default column definitions from data keys
 */
export function generateColumnsFromData<TData extends Record<string, any>>(
  data: TData[],
  options?: {
    /** Keys to exclude from columns */
    exclude?: (keyof TData)[]
    /** Custom column overrides */
    overrides?: Partial<Record<keyof TData, Partial<ColumnDef<TData>>>>
  }
): ColumnDef<TData>[] {
  if (data.length === 0) return []

  const keys = Object.keys(data[0]) as (keyof TData)[]
  const { exclude = [], overrides = {} } = options || {}

  return keys
    .filter((key) => !exclude.includes(key))
    .map((key) => {
      const override = (overrides as Record<keyof TData, Partial<ColumnDef<TData>>>)[key] || {}
      return {
        id: String(key),
        accessorKey: key,
        header: formatHeader(String(key)),
        cell: (info: any) => formatCellValue(info.getValue()),
        ...override,
      } as ColumnDef<TData>
    })
}

/**
 * Formats a header string (converts camelCase/snake_case to Title Case)
 */
export function formatHeader(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // camelCase to spaces
    .replace(/_/g, ' ') // snake_case to spaces
    .replace(/^./, (str) => str.toUpperCase()) // capitalize first letter
    .trim()
}

/**
 * Formats a cell value for display
 */
export function formatCellValue(value: any): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * Creates a column helper function for better type inference
 */
export function createColumnHelper<TData>() {
  return {
    accessor: <TAccessor extends keyof TData>(
      accessor: TAccessor,
      column: Omit<ColumnDef<TData, TData[TAccessor]>, 'accessorKey'>
    ): ColumnDef<TData, TData[TAccessor]> => ({
      ...column,
      accessorKey: accessor as string,
    }),
    display: (column: ColumnDef<TData, unknown>): ColumnDef<TData, unknown> => column,
  }
}

/**
 * Filters data based on a search term across all columns
 */
export function globalFilterFn<TData extends Record<string, any>>(
  row: TData,
  columnId: string,
  filterValue: string
): boolean {
  const search = filterValue.toLowerCase()

  return Object.values(row).some((value) => {
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(search)
  })
}

/**
 * Exports table data to CSV format
 */
export function exportToCSV<TData>(data: TData[], filename: string = 'table-export.csv'): void {
  if (data.length === 0) return

  const keys = Object.keys(data[0] as object)
  const csv = [
    keys.join(','), // header row
    ...data.map((row) =>
      keys
        .map((key) => {
          const value = (row as any)[key]
          const stringValue = formatCellValue(value)
          // Escape commas and quotes
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue
        })
        .join(',')
    ),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Calculates pagination info
 */
export function getPaginationInfo(pageIndex: number, pageSize: number, totalRows: number) {
  const startRow = pageIndex * pageSize + 1
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)
  const totalPages = Math.ceil(totalRows / pageSize)

  return {
    startRow,
    endRow,
    totalPages,
    currentPage: pageIndex + 1,
    hasNextPage: pageIndex < totalPages - 1,
    hasPreviousPage: pageIndex > 0,
  }
}

/**
 * Gets the optimal page size based on data count
 */
export function getOptimalPageSize(dataCount: number): number {
  if (dataCount < 10) return 10
  if (dataCount < 50) return 25
  if (dataCount < 100) return 50
  return 100
}

/**
 * Determines if a table should use pagination based on data size
 */
export function shouldUsePagination(dataCount: number): boolean {
  return dataCount > 50
}

/**
 * Generates page size options based on data count
 */
export function getPageSizeOptions(dataCount: number): number[] {
  const options: number[] = []

  if (dataCount > 10) options.push(10)
  if (dataCount > 25) options.push(25)
  if (dataCount > 50) options.push(50)
  if (dataCount > 100) options.push(100)
  if (dataCount > 500) options.push(500)

  return options.length > 0 ? options : [10, 25, 50]
}

/**
 * Sorts data by a key and direction
 */
export function sortData<TData>(
  data: TData[],
  key: keyof TData,
  direction: 'asc' | 'desc'
): TData[] {
  return [...data].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal === bVal) return 0

    const comparison = aVal > bVal ? 1 : -1
    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Filters data by multiple column filters
 */
export function filterData<TData extends Record<string, any>>(
  data: TData[],
  filters: Array<{ id: string; value: any }>
): TData[] {
  return data.filter((row) => {
    return filters.every((filter) => {
      const cellValue = row[filter.id]
      if (cellValue === null || cellValue === undefined) return false

      const filterValue = String(filter.value).toLowerCase()
      return String(cellValue).toLowerCase().includes(filterValue)
    })
  })
}

/**
 * Paginates data
 */
export function paginateData<TData>(data: TData[], pageIndex: number, pageSize: number): TData[] {
  const start = pageIndex * pageSize
  const end = start + pageSize
  return data.slice(start, end)
}

/**
 * Combines multiple class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
