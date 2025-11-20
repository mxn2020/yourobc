// src/features/boilerplate/supporting/tables/utils/presets.ts

import type { TablePreset, TablePresetName } from '../types'

/**
 * Pre-configured table presets for common use cases
 */
export const tablePresets: Record<TablePresetName, TablePreset> = {
  /**
   * Basic table - Simple display with minimal features
   */
  basic: {
    name: 'Basic',
    description: 'Simple table with no advanced features',
    enableSorting: false,
    enableFiltering: false,
    enablePagination: false,
    enableRowSelection: false,
    stickyHeader: false,
    enableRowHover: true,
    striped: false,
    bordered: false,
  },

  /**
   * Sortable table - Table with column sorting
   */
  sortable: {
    name: 'Sortable',
    description: 'Table with sortable columns',
    enableSorting: true,
    enableFiltering: false,
    enablePagination: false,
    enableRowSelection: false,
    stickyHeader: true,
    enableRowHover: true,
    striped: false,
    bordered: false,
  },

  /**
   * Filterable table - Table with column filtering
   */
  filterable: {
    name: 'Filterable',
    description: 'Table with column filters and search',
    enableSorting: false,
    enableFiltering: true,
    enablePagination: false,
    enableRowSelection: false,
    stickyHeader: true,
    enableRowHover: true,
    striped: false,
    bordered: false,
  },

  /**
   * Paginated table - Table with pagination
   */
  paginated: {
    name: 'Paginated',
    description: 'Table with pagination controls',
    enableSorting: false,
    enableFiltering: false,
    enablePagination: true,
    pageSize: 10,
    enableRowSelection: false,
    stickyHeader: true,
    enableRowHover: true,
    striped: false,
    bordered: false,
  },

  /**
   * Full-featured table - All features enabled
   */
  fullFeatured: {
    name: 'Full Featured',
    description: 'Table with all features enabled',
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    pageSize: 25,
    enableRowSelection: true,
    stickyHeader: true,
    enableRowHover: true,
    striped: false,
    bordered: false,
  },

  /**
   * Compact table - Dense layout for data grids
   */
  compact: {
    name: 'Compact',
    description: 'Compact table with dense layout',
    enableSorting: true,
    enableFiltering: false,
    enablePagination: true,
    pageSize: 50,
    enableRowSelection: false,
    stickyHeader: true,
    enableRowHover: false,
    striped: true,
    bordered: true,
  },

  /**
   * Audit log preset - For activity logs and audit trails
   */
  auditLog: {
    name: 'Audit Log',
    description: 'Optimized for audit logs and activity trails',
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    pageSize: 50,
    enableRowSelection: false,
    stickyHeader: true,
    enableRowHover: true,
    striped: true,
    bordered: false,
  },

  /**
   * Data grid preset - For complex data tables
   */
  dataGrid: {
    name: 'Data Grid',
    description: 'Feature-rich data grid with all controls',
    enableSorting: true,
    enableFiltering: true,
    enablePagination: true,
    pageSize: 25,
    enableRowSelection: true,
    stickyHeader: true,
    enableRowHover: true,
    striped: false,
    bordered: true,
  },
}

/**
 * Get a preset by name
 */
export function getPreset(name: TablePresetName): TablePreset {
  return tablePresets[name]
}

/**
 * Extend a preset with custom options
 */
export function extendPreset(
  name: TablePresetName,
  overrides: Partial<TablePreset>
): TablePreset {
  return {
    ...tablePresets[name],
    ...overrides,
  }
}

/**
 * Preset recommendations based on data characteristics
 */
export const presetRecommendations = {
  /**
   * Get a recommended preset based on data characteristics
   */
  getRecommendation: (options: {
    rowCount: number
    needsSorting?: boolean
    needsFiltering?: boolean
    needsSelection?: boolean
  }): TablePresetName => {
    const { rowCount, needsSorting, needsFiltering, needsSelection } = options

    // Small dataset, no special needs
    if (rowCount < 20 && !needsSorting && !needsFiltering && !needsSelection) {
      return 'basic'
    }

    // Medium dataset with sorting only
    if (rowCount < 50 && needsSorting && !needsFiltering && !needsSelection) {
      return 'sortable'
    }

    // Needs filtering/search
    if (needsFiltering) {
      return 'filterable'
    }

    // Large dataset without special needs
    if (rowCount >= 50 && !needsSorting && !needsFiltering && !needsSelection) {
      return 'paginated'
    }

    // Compact layout for very large datasets
    if (rowCount >= 500) {
      return 'compact'
    }

    // Activity logs or audit trails
    if (needsSorting && needsFiltering && !needsSelection) {
      return 'auditLog'
    }

    // Complex data with selection
    if (needsSelection) {
      return 'dataGrid'
    }

    // Default to full-featured for everything else
    return 'fullFeatured'
  },
}

/**
 * Example code snippets for each preset
 */
export const presetExamples: Record<TablePresetName, string> = {
  basic: `
import { BasicTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
]

function MyTable() {
  return (
    <BasicTable
      data={data}
      columns={columns}
      enableRowHover
    />
  )
}
  `.trim(),

  sortable: `
import { SortableTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'date', header: 'Date', enableSorting: true },
]

function MyTable() {
  return (
    <SortableTable
      data={data}
      columns={columns}
      stickyHeader
      enableMultiSort
    />
  )
}
  `.trim(),

  filterable: `
import { FilterableTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
  { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
]

function MyTable() {
  return (
    <FilterableTable
      data={data}
      columns={columns}
      enableGlobalFilter
      globalFilterPlaceholder="Search all columns..."
    />
  )
}
  `.trim(),

  paginated: `
import { PaginatedTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
]

function MyTable() {
  return (
    <PaginatedTable
      data={data}
      columns={columns}
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
    />
  )
}
  `.trim(),

  fullFeatured: `
import { DataTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
]

function MyTable() {
  return (
    <DataTable
      data={data}
      columns={columns}
      enableSorting
      enableFiltering
      enablePagination
      enableRowSelection
      pageSize={25}
    />
  )
}
  `.trim(),

  compact: `
import { DataTable } from '@/features/boilerplate/supporting'
import { tablePresets } from '@/features/boilerplate/supporting'

const preset = tablePresets.compact

function MyTable() {
  return (
    <DataTable
      data={data}
      columns={columns}
      {...preset}
      striped
      bordered
      className="text-sm"
    />
  )
}
  `.trim(),

  auditLog: `
import { DataTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'timestamp', header: 'Timestamp', enableSorting: true },
  { accessorKey: 'user', header: 'User', enableColumnFilter: true },
  { accessorKey: 'action', header: 'Action', enableColumnFilter: true },
  { accessorKey: 'details', header: 'Details' },
]

function AuditLogTable() {
  return (
    <DataTable
      data={logs}
      columns={columns}
      enableSorting
      enableFiltering
      enablePagination
      pageSize={50}
      striped
      stickyHeader
    />
  )
}
  `.trim(),

  dataGrid: `
import { DataTable } from '@/features/boilerplate/supporting'

const columns = [
  { id: 'select', header: ({ table }) => <SelectAllCheckbox table={table} /> },
  { accessorKey: 'id', header: 'ID', enableSorting: true },
  { accessorKey: 'name', header: 'Name', enableSorting: true, enableColumnFilter: true },
  { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
]

function DataGridTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      enableSorting
      enableFiltering
      enablePagination
      enableRowSelection
      pageSize={25}
      bordered
      stickyHeader
    />
  )
}
  `.trim(),
}
