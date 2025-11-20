// src/features/boilerplate/supporting/virtual-lists/examples/PatternShowcase.tsx

import React, { useState } from 'react'
import {
  VirtualList,
  VirtualListDynamic,
  VirtualTable,
  VirtualGrid,
  VirtualMasonry,
  VirtualListSticky,
  VirtualWindowList,
  VirtualTableSortable,
} from '../components'
import { virtualPresets } from '../utils'
import type { VirtualTableColumn } from '../types'

/**
 * PatternShowcase - Interactive demonstration of all virtual list patterns
 *
 * This component showcases all available virtualization patterns with
 * interactive examples and real data.
 *
 * @example
 * ```tsx
 * import { PatternShowcase } from '@/features/boilerplate/supporting/virtual-lists'
 *
 * function App() {
 *   return <PatternShowcase />
 * }
 * ```
 */
export function PatternShowcase() {
  const [activePattern, setActivePattern] = useState<string>('fixed')

  const patterns = [
    { id: 'fixed', name: 'Fixed Size List', preset: 'notifications' },
    { id: 'dynamic', name: 'Dynamic Size List', preset: 'aiLogs' },
    { id: 'grid', name: 'Grid Layout', preset: 'productGrid' },
    { id: 'masonry', name: 'Masonry Layout', preset: 'imageGallery' },
    { id: 'sticky', name: 'Sticky Headers', preset: 'commentList' },
    { id: 'table', name: 'Sortable Table', preset: 'dataTable' },
    { id: 'window', name: 'Window Scroller', preset: 'infiniteFeed' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Virtual Lists Pattern Showcase
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore all available virtualization patterns with interactive examples
          </p>
        </div>

        {/* Pattern Selector */}
        <div className="mb-8 flex flex-wrap gap-2">
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => setActivePattern(pattern.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activePattern === pattern.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {pattern.name}
            </button>
          ))}
        </div>

        {/* Pattern Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {activePattern === 'fixed' && <FixedSizeExample />}
          {activePattern === 'dynamic' && <DynamicSizeExample />}
          {activePattern === 'grid' && <GridExample />}
          {activePattern === 'masonry' && <MasonryExample />}
          {activePattern === 'sticky' && <StickyExample />}
          {activePattern === 'table' && <TableExample />}
          {activePattern === 'window' && <WindowExample />}
        </div>

        {/* Pattern Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            About This Pattern
          </h3>
          <p className="text-blue-800 dark:text-blue-200">
            {getPatternDescription(activePattern)}
          </p>
        </div>
      </div>
    </div>
  )
}

// Example Components for each pattern

function FixedSizeExample() {
  const items = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    title: `Notification ${i + 1}`,
    message: 'You have a new notification',
    timestamp: new Date(Date.now() - i * 60000).toLocaleTimeString(),
  }))

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Fixed Size List (10,000 items)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        All items have the same height. Best for uniform content like notifications or simple lists.
      </p>
      <VirtualList
        items={items}
        height={600}
        estimateSize={virtualPresets.notifications.estimateSize}
        overscan={virtualPresets.notifications.overscan}
        renderItem={(item) => (
          <div className="p-4 border-b hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.message}</p>
              </div>
              <span className="text-xs text-gray-500">{item.timestamp}</span>
            </div>
          </div>
        )}
      />
    </div>
  )
}

function DynamicSizeExample() {
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    model: `GPT-${Math.random() > 0.5 ? '4' : '3.5'}`,
    prompt: `Sample prompt ${i + 1} `.repeat(Math.floor(Math.random() * 5) + 1),
    timestamp: new Date(Date.now() - i * 120000).toLocaleString(),
  }))

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dynamic Size List (1,000 items)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Items have variable heights that are measured dynamically. Perfect for chat logs or variable content.
      </p>
      <VirtualListDynamic
        items={items}
        height={600}
        estimateSize={virtualPresets.aiLogs.estimateSize}
        overscan={virtualPresets.aiLogs.overscan}
        gap={virtualPresets.aiLogs.gap}
        renderItem={(item) => (
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">{item.model}</span>
              <span className="text-xs text-gray-500">{item.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{item.prompt}</p>
          </div>
        )}
      />
    </div>
  )
}

function GridExample() {
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    name: `Product ${i + 1}`,
    price: `$${(Math.random() * 100).toFixed(2)}`,
    image: `https://picsum.photos/seed/${i}/200/200`,
  }))

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Grid Layout (1,000 items)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Items arranged in a grid with fixed columns. Perfect for product catalogs or card layouts.
      </p>
      <VirtualGrid
        items={items}
        height={600}
        columns={4}
        estimateItemHeight={virtualPresets.productGrid.estimateSize}
        overscan={virtualPresets.productGrid.overscan}
        gap={virtualPresets.productGrid.gap}
        renderItem={(item) => (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
            <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{item.price}</p>
          </div>
        )}
      />
    </div>
  )
}

function MasonryExample() {
  const items = Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    title: `Image ${i + 1}`,
    height: 150 + Math.random() * 200,
  }))

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Masonry Layout (1,000 items)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Pinterest-style layout with multiple lanes. Perfect for image galleries or variable-height cards.
      </p>
      <VirtualMasonry
        items={items}
        height={600}
        lanes={4}
        estimateSize={(index) => items[index].height}
        overscan={virtualPresets.imageGallery.overscan}
        gap={virtualPresets.imageGallery.gap}
        renderItem={(item) => (
          <div
            className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg p-4 text-white"
            style={{ height: '100%' }}
          >
            <p className="font-medium">{item.title}</p>
          </div>
        )}
      />
    </div>
  )
}

function StickyExample() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const items = alphabet.flatMap((letter) => [
    { id: `header-${letter}`, name: letter, isHeader: true },
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `${letter}-${i}`,
      name: `${letter}${letter.toLowerCase()}${i}`,
      isHeader: false,
    })),
  ])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sticky Headers (520 items)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Headers stick to the top while scrolling. Perfect for alphabetically sorted lists or grouped data.
      </p>
      <VirtualListSticky
        items={items}
        height={600}
        estimateSize={50}
        isStickyItem={(item) => item.isHeader}
        stickyItemClassName="font-bold bg-blue-100 dark:bg-blue-900"
        renderItem={(item) => (
          <div className={`p-4 ${item.isHeader ? 'text-lg' : 'pl-8'}`}>
            {item.name}
          </div>
        )}
      />
    </div>
  )
}

function TableExample() {
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['Admin', 'User', 'Editor'][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.5 ? 'Active' : 'Inactive',
  }))

  const columns: VirtualTableColumn<typeof data[0]>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (item) => <span className="font-medium">{item.name}</span>,
      width: '200px',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      render: (item) => item.email,
      width: '250px',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      render: (item) => item.role,
      width: '150px',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            item.status === 'Active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {item.status}
        </span>
      ),
      width: '120px',
      sortable: true,
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Sortable Table (10,000 rows)</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Table with sortable columns and sticky header. Click column headers to sort.
      </p>
      <VirtualTableSortable
        data={data}
        columns={columns}
        height={600}
        estimateRowHeight={virtualPresets.dataTable.estimateSize}
        overscan={virtualPresets.dataTable.overscan}
      />
    </div>
  )
}

function WindowExample() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Window Scroller</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Uses the browser window for scrolling. Scroll down to see it in action!
      </p>
      <div className="text-center py-8 text-gray-500">
        <p>This pattern is best demonstrated in a full-page context.</p>
        <p className="mt-2">Use VirtualWindowList component in your page-level components.</p>
      </div>
    </div>
  )
}

// Helper function for pattern descriptions
function getPatternDescription(patternId: string): string {
  const descriptions: Record<string, string> = {
    fixed: 'Fixed size lists render all items with the same height. This is the most performant option when all items are uniform.',
    dynamic: 'Dynamic size lists measure each item\'s height dynamically. Use when content has variable heights that can\'t be predetermined.',
    grid: 'Grid layout arranges items in rows and columns. Perfect for product catalogs, image galleries, or any uniform card-based layout.',
    masonry: 'Masonry layout (Pinterest-style) with multiple lanes. Items flow into the shortest column, creating a tight, efficient layout.',
    sticky: 'Sticky headers remain at the top of the list while scrolling through sections. Great for alphabetically sorted lists or grouped data.',
    table: 'Sortable table with virtualized rows and sticky headers. Handles large datasets with sorting, filtering, and row interactions.',
    window: 'Window scroller uses the browser window instead of a container element. Provides natural page scrolling for full-page lists.',
  }
  return descriptions[patternId] || ''
}

export default PatternShowcase
