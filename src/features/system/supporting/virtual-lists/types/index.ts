// src/features/boilerplate/supporting/virtual-lists/types/index.ts

import type { VirtualizerOptions } from '@tanstack/react-virtual'

/**
 * Configuration for virtual list items
 */
export interface VirtualListItemConfig {
  /** Estimated size of each item in pixels */
  estimateSize: number
  /** Whether to enable smooth scrolling */
  smoothScroll?: boolean
  /** Enable overscan for better performance */
  overscan?: number
}

/**
 * Props for VirtualList component
 */
export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of the list container in pixels */
  height: number | string
  /** Estimated size of each item in pixels */
  estimateSize?: number
  /** Enable overscan (number of items to render outside viewport) */
  overscan?: number
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Optional className for the container */
  className?: string
  /** Optional className for each item wrapper */
  itemClassName?: string
  /** Callback when scrolling */
  onScroll?: (offset: number) => void
  /** Gap between items in pixels */
  gap?: number
  /** Enable smooth scrolling */
  smoothScroll?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Loading component */
  loadingComponent?: React.ReactNode
  /** Empty state component */
  emptyComponent?: React.ReactNode
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean
  /** Callback when reaching bottom (for infinite scroll) */
  onLoadMore?: () => void
  /** Threshold in pixels to trigger load more */
  loadMoreThreshold?: number
  /** Custom scroll element ref */
  scrollElementRef?: React.RefObject<HTMLElement>
}

/**
 * Props for VirtualTable component
 */
export interface VirtualTableProps<T> {
  /** Array of data items */
  data: T[]
  /** Column definitions */
  columns: VirtualTableColumn<T>[]
  /** Height of the table container */
  height: number | string
  /** Estimated row height in pixels */
  estimateRowHeight?: number
  /** Estimated header height in pixels */
  estimateHeaderHeight?: number
  /** Enable overscan */
  overscan?: number
  /** Optional className for the container */
  className?: string
  /** Optional className for rows */
  rowClassName?: string | ((item: T, index: number) => string)
  /** Optional className for header */
  headerClassName?: string
  /** Loading state */
  isLoading?: boolean
  /** Empty state component */
  emptyComponent?: React.ReactNode
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean
  /** Callback when reaching bottom */
  onLoadMore?: () => void
  /** Sticky header */
  stickyHeader?: boolean
  /** Enable row hover */
  enableRowHover?: boolean
}

/**
 * Column definition for VirtualTable
 */
export interface VirtualTableColumn<T> {
  /** Column key (must be unique) */
  key: string
  /** Column header label */
  label: string
  /** Render function for cell content */
  render: (item: T, index: number) => React.ReactNode
  /** Column width (CSS value) */
  width?: string
  /** Column alignment */
  align?: 'left' | 'center' | 'right'
  /** Header alignment */
  headerAlign?: 'left' | 'center' | 'right'
  /** Optional className for cells */
  className?: string
  /** Optional className for header */
  headerClassName?: string
  /** Whether column is sortable */
  sortable?: boolean
  /** Sort direction if active */
  sortDirection?: 'asc' | 'desc'
  /** Callback when column header is clicked */
  onHeaderClick?: () => void
}

/**
 * Props for VirtualGrid component
 */
export interface VirtualGridProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of the grid container */
  height: number | string
  /** Number of columns */
  columns: number
  /** Estimated item height in pixels */
  estimateItemHeight?: number
  /** Enable overscan */
  overscan?: number
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Optional className for the container */
  className?: string
  /** Optional className for each item wrapper */
  itemClassName?: string
  /** Gap between items in pixels */
  gap?: number
  /** Loading state */
  isLoading?: boolean
  /** Empty state component */
  emptyComponent?: React.ReactNode
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean
  /** Callback when reaching bottom */
  onLoadMore?: () => void
}

/**
 * Return type for useVirtualList hook
 */
export interface UseVirtualListReturn {
  /** Total height of the virtualized list */
  totalSize: number
  /** Virtual items to render */
  virtualItems: Array<{
    key: string | number
    index: number
    start: number
    size: number
    end: number
  }>
  /** Scroll to specific index */
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; smooth?: boolean }) => void
  /** Scroll to specific offset */
  scrollToOffset: (offset: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; smooth?: boolean }) => void
  /** Measure an item */
  measureElement: (element: HTMLElement | null) => void
}

/**
 * Options for useInfiniteScroll hook
 */
export interface UseInfiniteScrollOptions {
  /** Whether infinite scroll is enabled */
  enabled?: boolean
  /** Threshold in pixels to trigger load more */
  threshold?: number
  /** Callback when load more is triggered */
  onLoadMore: () => void
  /** Whether currently loading more items */
  isLoading?: boolean
  /** Whether there are more items to load */
  hasMore?: boolean
}

/**
 * Performance metrics for virtual lists
 */
export interface VirtualListMetrics {
  /** Total number of items */
  totalItems: number
  /** Number of rendered items */
  renderedItems: number
  /** Current scroll offset */
  scrollOffset: number
  /** Total scrollable size */
  totalSize: number
  /** Performance improvement ratio */
  performanceRatio: number
}

/**
 * Props for VirtualMasonry component
 */
export interface VirtualMasonryProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of the masonry container */
  height: number | string
  /** Width of the masonry container */
  width?: number | string
  /** Number of lanes/columns */
  lanes: number
  /** Estimated item height in pixels */
  estimateSize: number | ((index: number) => number)
  /** Enable overscan */
  overscan?: number
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Optional className for the container */
  className?: string
  /** Optional className for each item wrapper */
  itemClassName?: string
  /** Gap between items in pixels */
  gap?: number
  /** Horizontal or vertical orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Loading state */
  isLoading?: boolean
  /** Empty state component */
  emptyComponent?: React.ReactNode
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean
  /** Callback when reaching bottom */
  onLoadMore?: () => void
}

/**
 * Props for VirtualListSticky component
 */
export interface VirtualListStickyProps<T> {
  /** Array of items to render */
  items: T[]
  /** Height of the list container */
  height: number | string
  /** Estimated size of each item in pixels */
  estimateSize: number
  /** Enable overscan */
  overscan?: number
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Function to determine if an item is sticky */
  isStickyItem: (item: T, index: number) => boolean
  /** Optional className for the container */
  className?: string
  /** Optional className for each item wrapper */
  itemClassName?: string
  /** Optional className for sticky items */
  stickyItemClassName?: string
  /** Loading state */
  isLoading?: boolean
  /** Empty state component */
  emptyComponent?: React.ReactNode
}

/**
 * Props for VirtualWindowList component
 */
export interface VirtualWindowListProps<T> {
  /** Array of items to render */
  items: T[]
  /** Estimated size of each item in pixels */
  estimateSize: number
  /** Enable overscan */
  overscan?: number
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Optional className for the container */
  className?: string
  /** Optional className for each item wrapper */
  itemClassName?: string
  /** Gap between items in pixels */
  gap?: number
  /** Scroll margin from top of page */
  scrollMargin?: number
  /** Loading state */
  isLoading?: boolean
  /** Empty state component */
  emptyComponent?: React.ReactNode
  /** Enable infinite scroll */
  enableInfiniteScroll?: boolean
  /** Callback when reaching bottom */
  onLoadMore?: () => void
}

/**
 * Options for smooth scroll
 */
export interface SmoothScrollOptions {
  /** Duration of scroll animation in milliseconds */
  duration?: number
  /** Easing function */
  easing?: (t: number) => number
}

/**
 * Options for useVirtualSticky hook
 */
export interface UseVirtualStickyOptions {
  /** Total number of items */
  count: number
  /** Indices of sticky items */
  stickyIndices: number[]
  /** Estimated size of each item */
  estimateSize: number
  /** Enable overscan */
  overscan?: number
  /** Scroll element getter */
  getScrollElement: () => HTMLElement | null
}

/**
 * Options for useVirtualMasonry hook
 */
export interface UseVirtualMasonryOptions {
  /** Total number of items */
  count: number
  /** Number of lanes/columns */
  lanes: number
  /** Estimated size function */
  estimateSize: (index: number) => number
  /** Enable overscan */
  overscan?: number
  /** Scroll element getter */
  getScrollElement: () => HTMLElement | null
  /** Horizontal or vertical orientation */
  horizontal?: boolean
}

/**
 * Options for useVirtualGrid hook
 */
export interface UseVirtualGridOptions {
  /** Total number of items */
  count: number
  /** Number of columns */
  columns: number
  /** Estimated row height */
  estimateSize: number
  /** Enable overscan */
  overscan?: number
  /** Scroll element getter */
  getScrollElement: () => HTMLElement | null
}

/**
 * Virtual list preset configuration
 */
export interface VirtualListPreset {
  /** Pattern type */
  pattern: 'fixed' | 'variable' | 'dynamic' | 'masonry' | 'grid' | 'sticky' | 'table'
  /** Estimated item size */
  estimateSize: number
  /** Enable overscan */
  overscan?: number
  /** Gap between items */
  gap?: number
  /** Enable sticky header */
  stickyHeader?: boolean
  /** Enable infinite scroll */
  infiniteScroll?: boolean
  /** Number of lanes for masonry */
  lanes?: number
  /** Number of columns for grid */
  columns?: number
  /** Enable sortable for tables */
  sortable?: boolean
  /** Enable row hover for tables */
  enableRowHover?: boolean
}

/**
 * Preset name type
 */
export type VirtualListPresetName =
  | 'auditLogs'
  | 'aiLogs'
  | 'notifications'
  | 'dataTable'
  | 'imageGallery'
  | 'commentList'
  | 'productGrid'
  | 'infiniteFeed'
