// src/features/system/supporting/virtual-lists/examples/VirtualListExample.tsx

import React from 'react'
import { VirtualList, VirtualTable, VirtualListDynamic } from '../components'
import type { VirtualTableColumn } from '../types'

/**
 * Example: Basic VirtualList
 */
export function BasicVirtualListExample() {
  // Generate 10,000 items
  const items = React.useMemo(
    () => Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `This is item number ${i}`
    })),
    []
  )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Virtual List (10,000 items)</h2>
      <VirtualList
        items={items}
        height={400}
        estimateSize={60}
        renderItem={(item) => (
          <div className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {item.description}
            </div>
          </div>
        )}
        className="border rounded-lg overflow-hidden"
      />
    </div>
  )
}

/**
 * Example: VirtualTable
 */
export function VirtualTableExample() {
  // Generate 10,000 users
  const users = React.useMemo(
    () => Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      role: i % 3 === 0 ? 'Admin' : i % 2 === 0 ? 'Editor' : 'Viewer',
      status: i % 4 === 0 ? 'Active' : 'Inactive'
    })),
    []
  )

  const columns: VirtualTableColumn<typeof users[0]>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (user) => <span className="font-mono">#{user.id}</span>,
      width: '100px',
      align: 'center'
    },
    {
      key: 'name',
      label: 'Name',
      render: (user) => <span className="font-medium">{user.name}</span>,
      width: '200px'
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => <span className="text-sm">{user.email}</span>,
      width: '250px'
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <span className={`px-2 py-1 rounded text-xs ${
          user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
          user.role === 'Editor' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {user.role}
        </span>
      ),
      width: '120px'
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => (
        <span className={`px-2 py-1 rounded text-xs ${
          user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.status}
        </span>
      ),
      width: '120px'
    }
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Virtual Table (10,000 rows)</h2>
      <VirtualTable
        data={users}
        columns={columns}
        height={500}
        estimateRowHeight={50}
        stickyHeader
        enableRowHover
        onRowClick={(user) => console.log('Clicked:', user)}
        className="border rounded-lg overflow-hidden"
      />
    </div>
  )
}

/**
 * Example: Dynamic Height List
 */
export function DynamicHeightListExample() {
  // Generate items with varying content lengths
  const items = React.useMemo(
    () => Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Post ${i}`,
      content: `This is a post with ${i % 5 === 0 ? 'very long' : 'short'} content. `.repeat(
        i % 5 === 0 ? 5 : 1
      )
    })),
    []
  )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Dynamic Height List (1,000 items)</h2>
      <VirtualListDynamic
        items={items}
        height={400}
        estimateSize={100}
        renderItem={(item) => (
          <div className="p-4 border-b bg-white dark:bg-gray-900">
            <h3 className="font-bold mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.content}
            </p>
          </div>
        )}
        className="border rounded-lg overflow-hidden"
      />
    </div>
  )
}

/**
 * Combined Examples Page
 */
export function VirtualListExamples() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Virtual Lists Examples</h1>
        <p className="text-gray-600 dark:text-gray-400">
          High-performance virtualization for rendering large datasets
        </p>
      </div>

      <BasicVirtualListExample />
      <VirtualTableExample />
      <DynamicHeightListExample />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-bold mb-2">Performance Notes</h3>
        <ul className="text-sm space-y-1">
          <li>✓ Only visible items are rendered in the DOM</li>
          <li>✓ Smooth scrolling even with 10,000+ items</li>
          <li>✓ Memory efficient - no performance degradation</li>
          <li>✓ 10x-100x faster than non-virtualized lists</li>
        </ul>
      </div>
    </div>
  )
}
