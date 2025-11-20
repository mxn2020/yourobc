// src/features/system/supporting/tables/examples/TableExample.tsx

import React, { useMemo } from 'react'
import { BasicTable, DataTable, SortableTable, FilterableTable, PaginatedTable } from '../components'
import type { ColumnDef } from '@tanstack/react-table'

interface User {
  id: number
  name: string
  email: string
  role: string
  status: 'active' | 'inactive'
  joinDate: string
}

// Generate sample data
const generateSampleData = (count: number = 50): User[] => {
  const roles = ['Admin', 'Developer', 'Designer', 'Manager', 'User']
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive']

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: roles[Math.floor(Math.random() * roles.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
  }))
}

/**
 * TableExample - Demonstrates various table components
 */
export function TableExample() {
  const data = useMemo(() => generateSampleData(50), [])

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        enableColumnFilter: true,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        enableSorting: true,
        enableColumnFilter: true,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        enableSorting: true,
        cell: ({ getValue }) => {
          const status = getValue() as string
          return (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
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
        accessorKey: 'joinDate',
        header: 'Join Date',
        enableSorting: true,
      },
    ],
    []
  )

  return (
    <div className="space-y-12 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Table Examples</h1>
        <p className="text-gray-600">
          Demonstrations of various table components and patterns
        </p>
      </div>

      {/* Basic Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Basic Table</h2>
        <p className="text-gray-600 mb-4">
          Simple table with no advanced features
        </p>
        <BasicTable
          data={data.slice(0, 10)}
          columns={columns}
          enableRowHover
          striped
        />
      </section>

      {/* Sortable Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Sortable Table</h2>
        <p className="text-gray-600 mb-4">
          Click column headers to sort (name, role, status, join date are sortable)
        </p>
        <SortableTable
          data={data.slice(0, 15)}
          columns={columns}
          enableMultiSort
          stickyHeader
        />
      </section>

      {/* Filterable Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Filterable Table</h2>
        <p className="text-gray-600 mb-4">
          Search across all columns with global filter
        </p>
        <FilterableTable
          data={data.slice(0, 15)}
          columns={columns}
          enableGlobalFilter
          globalFilterPlaceholder="Search users..."
          stickyHeader
        />
      </section>

      {/* Paginated Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Paginated Table</h2>
        <p className="text-gray-600 mb-4">
          Navigate through large datasets with pagination
        </p>
        <PaginatedTable
          data={data}
          columns={columns}
          pageSize={10}
          pageSizeOptions={[5, 10, 25, 50]}
        />
      </section>

      {/* Full Featured Table */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Full Featured Table</h2>
        <p className="text-gray-600 mb-4">
          All features enabled: sorting, filtering, pagination, and row selection
        </p>
        <DataTable
          data={data}
          columns={columns}
          enableSorting
          enableFiltering
          enablePagination
          enableRowSelection
          initialPagination={{ pageIndex: 0, pageSize: 10 }}
          stickyHeader
          enableRowHover
        />
      </section>
    </div>
  )
}
