# Tables Feature

A comprehensive table system built on TanStack Table (formerly React Table) for building powerful, flexible, and type-safe data tables.

## Overview

This module provides a complete set of table components and utilities for displaying and interacting with tabular data. It offers **three approaches** to building tables:

1. **Pattern Components** - Pre-built components for common use cases
2. **DataTable Component** - Fully featured, configurable table
3. **Configuration Presets** - Quick-start configurations

## Features

### Base Components
- **BasicTable** - Simple table with minimal features
- **DataTable** - Full-featured table with all capabilities

### Pattern Components
- **SortableTable** - Table with column sorting
- **FilterableTable** - Table with filtering and search
- **PaginatedTable** - Table with pagination controls

### Core Features
- ✅ **Sorting** - Single and multi-column sorting
- ✅ **Filtering** - Column filters and global search
- ✅ **Pagination** - Client-side and server-side pagination
- ✅ **Row Selection** - Single and multi-row selection
- ✅ **Column Visibility** - Show/hide columns dynamically
- ✅ **Row Expansion** - Expandable row details
- ✅ **Sticky Headers** - Fixed headers while scrolling
- ✅ **TypeScript** - Full type safety
- ✅ **Customizable** - Flexible styling and behavior

## Installation

The package is already installed as part of the boilerplate:

```bash
pnpm install @tanstack/react-table
```

## Quick Start

### BasicTable

Simple table for displaying data:

```tsx
import { BasicTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
]

function UserList() {
  return (
    <BasicTable
      data={users}
      columns={columns}
      enableRowHover
      striped
    />
  )
}
```

### DataTable (Full Featured)

Table with all features:

```tsx
import { DataTable } from '@/features/boilerplate/supporting'
import type { ColumnDef } from '@tanstack/react-table'

interface User {
  id: number
  name: string
  email: string
  role: string
}

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
]

function UserTable() {
  return (
    <DataTable
      data={users}
      columns={columns}
      enableSorting
      enableFiltering
      enablePagination
      enableRowSelection
      initialPagination={{ pageIndex: 0, pageSize: 25 }}
    />
  )
}
```

## Components

### BasicTable

A simple table component with minimal features. Perfect for straightforward data display.

**Props:**
- `data` - Array of data items
- `columns` - Column definitions
- `enableRowHover` - Enable hover effect on rows (default: true)
- `striped` - Enable zebra striping (default: false)
- `bordered` - Enable cell borders (default: false)
- `stickyHeader` - Enable sticky header (default: false)
- `onRowClick` - Callback when row is clicked
- `isLoading` - Loading state
- `emptyComponent` - Custom empty state component

```tsx
<BasicTable
  data={items}
  columns={columns}
  enableRowHover
  striped
  onRowClick={(row) => console.log('Clicked:', row)}
/>
```

### DataTable

Full-featured table with all capabilities enabled through props.

**Props:**

**Sorting:**
- `enableSorting` - Enable column sorting
- `initialSorting` - Initial sort state
- `sorting` - Controlled sort state
- `onSortingChange` - Sort change handler
- `manualSorting` - Enable server-side sorting

**Filtering:**
- `enableFiltering` - Enable column filters
- `initialFilters` - Initial filter state
- `columnFilters` - Controlled filter state
- `onColumnFiltersChange` - Filter change handler
- `manualFiltering` - Enable server-side filtering

**Pagination:**
- `enablePagination` - Enable pagination
- `initialPagination` - Initial pagination state
- `pagination` - Controlled pagination state
- `onPaginationChange` - Pagination change handler
- `rowCount` - Total row count (for server-side)
- `manualPagination` - Enable server-side pagination

**Row Selection:**
- `enableRowSelection` - Enable row selection
- `initialRowSelection` - Initial selection state
- `rowSelection` - Controlled selection state
- `onRowSelectionChange` - Selection change handler

**Expanding:**
- `enableExpanding` - Enable expandable rows
- `renderExpandedRow` - Function to render expanded content

```tsx
<DataTable
  data={users}
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
  enableRowSelection
  initialPagination={{ pageIndex: 0, pageSize: 10 }}
  onRowSelectionChange={(selection) => console.log('Selected:', selection)}
/>
```

## Pattern Components

### SortableTable

Pre-configured table with sorting enabled.

```tsx
import { SortableTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'date', header: 'Date', enableSorting: true },
  { accessorKey: 'status', header: 'Status' },
]

<SortableTable
  data={data}
  columns={columns}
  enableMultiSort
  initialSorting={[{ id: 'name', desc: false }]}
/>
```

**Props:**
- `enableMultiSort` - Enable multi-column sorting (default: false)
- `initialSorting` - Initial sort state
- `onSortingChange` - Sort change handler
- `manualSorting` - Enable server-side sorting

### FilterableTable

Pre-configured table with filtering and search.

```tsx
import { FilterableTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
  { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
  { accessorKey: 'role', header: 'Role' },
]

<FilterableTable
  data={data}
  columns={columns}
  enableGlobalFilter
  globalFilterPlaceholder="Search users..."
/>
```

**Props:**
- `enableGlobalFilter` - Enable global search bar (default: false)
- `globalFilterPlaceholder` - Placeholder text for search
- `initialFilters` - Initial filter state
- `onFiltersChange` - Filter change handler

### PaginatedTable

Pre-configured table with pagination controls.

```tsx
import { PaginatedTable } from '@/features/boilerplate/supporting'

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Role' },
]

<PaginatedTable
  data={data}
  columns={columns}
  pageSize={25}
  pageSizeOptions={[10, 25, 50, 100]}
/>
```

**Props:**
- `pageSize` - Initial page size (default: 10)
- `pageSizeOptions` - Available page sizes
- `initialPageIndex` - Initial page index (default: 0)
- `rowCount` - Total row count (for server-side)
- `manualPagination` - Enable server-side pagination

## Hooks

### useTableState

Manages all table state in one place.

```tsx
import { useTableState } from '@/features/boilerplate/supporting'

function MyTable() {
  const tableState = useTableState({
    initialPagination: { pageIndex: 0, pageSize: 10 },
    initialSorting: [{ id: 'name', desc: false }],
  })

  return (
    <DataTable
      data={data}
      columns={columns}
      sorting={tableState.sorting}
      onSortingChange={tableState.setSorting}
      pagination={tableState.pagination}
      onPaginationChange={tableState.setPagination}
      columnFilters={tableState.columnFilters}
      onColumnFiltersChange={tableState.setColumnFilters}
    />
  )
}
```

**Returns:**
- `sorting` / `setSorting` - Sort state
- `columnFilters` / `setColumnFilters` - Filter state
- `pagination` / `setPagination` - Pagination state
- `rowSelection` / `setRowSelection` - Selection state
- `columnVisibility` / `setColumnVisibility` - Visibility state
- `expanded` / `setExpanded` - Expanded state
- `resetState()` - Reset all state to initial values

## Utilities

### Column Generation

Automatically generate columns from data:

```tsx
import { generateColumnsFromData } from '@/features/boilerplate/supporting'

const data = [
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' },
]

const columns = generateColumnsFromData(data, {
  exclude: ['id'], // Don't create column for 'id'
  overrides: {
    name: { header: 'Full Name', enableSorting: true },
    email: { header: 'Email Address' },
  },
})
```

### Column Helper

Better type inference for columns:

```tsx
import { createColumnHelper } from '@/features/boilerplate/supporting'

const columnHelper = createColumnHelper<User>()

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    enableColumnFilter: true,
  }),
]
```

### Data Export

Export table data to CSV:

```tsx
import { exportToCSV } from '@/features/boilerplate/supporting'

function ExportButton({ data }) {
  return (
    <button onClick={() => exportToCSV(data, 'users.csv')}>
      Export to CSV
    </button>
  )
}
```

### Pagination Utilities

```tsx
import {
  getPaginationInfo,
  getOptimalPageSize,
  shouldUsePagination,
  getPageSizeOptions,
} from '@/features/boilerplate/supporting'

// Check if pagination is needed
if (shouldUsePagination(data.length)) {
  // Use pagination
}

// Get optimal page size
const pageSize = getOptimalPageSize(data.length)

// Get page size options
const options = getPageSizeOptions(data.length) // [10, 25, 50, 100]

// Get pagination info
const info = getPaginationInfo(0, 10, 100)
// { startRow: 1, endRow: 10, totalPages: 10, currentPage: 1, ... }
```

## Configuration Presets

Pre-configured settings for common use cases.

### Available Presets

```tsx
import { tablePresets, getPreset, extendPreset } from '@/features/boilerplate/supporting'

// Use a preset directly
const config = tablePresets.auditLog

// Get preset by name
const config = getPreset('dataGrid')

// Extend a preset
const customConfig = extendPreset('auditLog', {
  pageSize: 100,
  striped: false,
})
```

### Preset List

| Preset | Features | Use Case |
|--------|----------|----------|
| `basic` | None | Simple data display |
| `sortable` | Sorting | Sortable lists |
| `filterable` | Filtering | Searchable data |
| `paginated` | Pagination | Large datasets |
| `fullFeatured` | All features | Complex tables |
| `compact` | Dense layout | Data grids |
| `auditLog` | Sort, filter, pagination | Activity logs |
| `dataGrid` | All + selection | Interactive data |

### Preset Recommendations

Get automatic recommendations:

```tsx
import { presetRecommendations } from '@/features/boilerplate/supporting'

const recommended = presetRecommendations.getRecommendation({
  rowCount: 1000,
  needsSorting: true,
  needsFiltering: true,
  needsSelection: false,
})
// Returns: 'auditLog'
```

### Usage Examples

Each preset includes example code:

```tsx
import { presetExamples } from '@/features/boilerplate/supporting'

console.log(presetExamples.dataGrid)
// Outputs complete component code
```

## Advanced Examples

### Server-Side Pagination

```tsx
import { DataTable } from '@/features/boilerplate/supporting'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

function ServerSideTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const { data, isLoading } = useQuery({
    queryKey: ['users', pagination],
    queryFn: () => fetchUsers(pagination),
  })

  return (
    <DataTable
      data={data?.users || []}
      columns={columns}
      enablePagination
      manualPagination
      pagination={pagination}
      onPaginationChange={setPagination}
      rowCount={data?.totalCount}
      isLoading={isLoading}
    />
  )
}
```

### Custom Cell Rendering

```tsx
const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue() as string
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <button onClick={() => handleEdit(row.original)}>Edit</button>
        <button onClick={() => handleDelete(row.original)}>Delete</button>
      </div>
    ),
  },
]
```

### Row Selection

```tsx
import { DataTable } from '@/features/boilerplate/supporting'
import { useState } from 'react'

function SelectableTable() {
  const [rowSelection, setRowSelection] = useState({})

  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
    },
    // ... other columns
  ]

  return (
    <DataTable
      data={users}
      columns={columns}
      enableRowSelection
      rowSelection={rowSelection}
      onRowSelectionChange={setRowSelection}
    />
  )
}
```

### Expandable Rows

```tsx
<DataTable
  data={users}
  columns={columns}
  enableExpanding
  renderExpandedRow={(user) => (
    <div className="p-4">
      <h4 className="font-semibold mb-2">User Details</h4>
      <dl className="grid grid-cols-2 gap-2">
        <dt className="font-medium">Full Name:</dt>
        <dd>{user.name}</dd>
        <dt className="font-medium">Email:</dt>
        <dd>{user.email}</dd>
        <dt className="font-medium">Role:</dt>
        <dd>{user.role}</dd>
      </dl>
    </div>
  )}
/>
```

## TypeScript Usage

Full type safety with TypeScript:

```tsx
import { DataTable, type ColumnDef } from '@/features/boilerplate/supporting'

interface Product {
  id: number
  name: string
  price: number
  category: string
}

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Product Name',
    enableSorting: true,
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ getValue }) => {
      const price = getValue() as number
      return `$${price.toFixed(2)}`
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    enableColumnFilter: true,
  },
]

function ProductTable() {
  return (
    <DataTable<Product>
      data={products}
      columns={columns}
      enableSorting
      enableFiltering
    />
  )
}
```

## Best Practices

1. **Use memoization** - Wrap `columns` in `useMemo` to prevent infinite re-renders
2. **Stable data references** - Use `useMemo` or `useState` for data
3. **Type your data** - Use TypeScript interfaces for type safety
4. **Choose the right component** - Use BasicTable for simple displays, DataTable for complex needs
5. **Server-side for large datasets** - Use manual pagination/sorting for 10,000+ rows
6. **Memoize cell renderers** - Use `useCallback` for expensive cell render functions

## Common Patterns

### Audit Log Table

```tsx
import { DataTable } from '@/features/boilerplate/supporting'

const columns: ColumnDef<AuditLog>[] = [
  { accessorKey: 'timestamp', header: 'Timestamp', enableSorting: true },
  { accessorKey: 'user', header: 'User', enableColumnFilter: true },
  { accessorKey: 'action', header: 'Action', enableColumnFilter: true },
  { accessorKey: 'details', header: 'Details' },
]

<DataTable
  data={logs}
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
  initialPagination={{ pageIndex: 0, pageSize: 50 }}
  striped
  stickyHeader
/>
```

### User Management Table

```tsx
import { DataTable } from '@/features/boilerplate/supporting'

const columns: ColumnDef<User>[] = [
  { id: 'select', /* checkbox column */ },
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableColumnFilter: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
  { id: 'actions', /* action buttons */ },
]

<DataTable
  data={users}
  columns={columns}
  enableSorting
  enableFiltering
  enablePagination
  enableRowSelection
  bordered
  stickyHeader
/>
```

## Migration Guide

### From Basic HTML Table

**Before:**
```tsx
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    {users.map((user) => (
      <tr key={user.id}>
        <td>{user.name}</td>
        <td>{user.email}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**After:**
```tsx
<BasicTable
  data={users}
  columns={[
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
  ]}
/>
```

## Troubleshooting

### Infinite Re-render Loop

**Problem:** Table keeps re-rendering

**Solution:** Memoize columns and data

```tsx
const columns = useMemo(() => [...], [])
const data = useMemo(() => [...], [deps])
```

### Sorting Not Working

**Problem:** Clicking headers doesn't sort

**Solution:** Enable sorting on columns

```tsx
const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
]
```

### Empty Table Shows

**Problem:** Table shows as empty despite having data

**Solution:** Check data and column accessor keys match

```tsx
// Data: { userName: 'John' }
// Column: { accessorKey: 'name' } ❌
// Column: { accessorKey: 'userName' } ✅
```

## Related Documentation

- [TanStack Table Official Docs](https://tanstack.com/table/latest)
- [Component Library](../../../docs/components.md)
- [TypeScript Guide](../../../docs/typescript.md)

## Contributing

When adding new table components:
1. Follow the existing component patterns
2. Add TypeScript types
3. Include usage examples
4. Update this README
5. Add preset configurations if applicable
