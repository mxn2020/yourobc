// src/features/boilerplate/supporting/virtual-lists/utils/presets.ts

import type { VirtualListPreset, VirtualListPresetName } from '../types'

/**
 * Pre-configured presets for common virtual list use cases
 *
 * These presets provide optimized configurations for common scenarios,
 * making it easy to get started with virtual lists.
 *
 * @example
 * ```tsx
 * import { virtualPresets } from '@/features/boilerplate/supporting/virtual-lists'
 *
 * const config = virtualPresets.auditLogs
 * // Use config properties in your VirtualList component
 * ```
 */
export const virtualPresets: Record<VirtualListPresetName, VirtualListPreset> = {
  /**
   * Audit Logs - Fixed-height rows with sticky headers
   * Perfect for: Activity logs, audit trails, system logs
   */
  auditLogs: {
    pattern: 'fixed',
    estimateSize: 50,
    overscan: 10,
    gap: 0,
    stickyHeader: true,
    infiniteScroll: false,
  },

  /**
   * AI Logs - Dynamic-height cards with spacing
   * Perfect for: AI conversation logs, chat histories, variable content
   */
  aiLogs: {
    pattern: 'dynamic',
    estimateSize: 80,
    overscan: 5,
    gap: 8,
    stickyHeader: false,
    infiniteScroll: true,
  },

  /**
   * Notifications - Fixed-height list items
   * Perfect for: Notification feeds, alerts, messages
   */
  notifications: {
    pattern: 'fixed',
    estimateSize: 60,
    overscan: 10,
    gap: 0,
    stickyHeader: false,
    infiniteScroll: true,
  },

  /**
   * Data Table - Sortable table with sticky headers
   * Perfect for: User lists, data grids, reports
   */
  dataTable: {
    pattern: 'table',
    estimateSize: 50,
    overscan: 10,
    gap: 0,
    stickyHeader: true,
    sortable: true,
    enableRowHover: true,
    infiniteScroll: false,
  },

  /**
   * Image Gallery - Masonry layout with multiple lanes
   * Perfect for: Photo galleries, Pinterest-style layouts, media libraries
   */
  imageGallery: {
    pattern: 'masonry',
    estimateSize: 200,
    overscan: 5,
    gap: 16,
    lanes: 4,
    infiniteScroll: true,
  },

  /**
   * Comment List - Dynamic height with sticky separators
   * Perfect for: Comment threads, discussions, nested content
   */
  commentList: {
    pattern: 'sticky',
    estimateSize: 100,
    overscan: 5,
    gap: 8,
    stickyHeader: false,
    infiniteScroll: true,
  },

  /**
   * Product Grid - Fixed-size grid layout
   * Perfect for: E-commerce products, card layouts, uniform content
   */
  productGrid: {
    pattern: 'grid',
    estimateSize: 300,
    overscan: 5,
    gap: 16,
    columns: 4,
    infiniteScroll: true,
  },

  /**
   * Infinite Feed - Window-scrolled dynamic content
   * Perfect for: Social feeds, news feeds, timeline views
   */
  infiniteFeed: {
    pattern: 'dynamic',
    estimateSize: 150,
    overscan: 5,
    gap: 12,
    infiniteScroll: true,
  },
}

/**
 * Get a preset by name
 *
 * @example
 * ```tsx
 * const config = getPreset('auditLogs')
 * ```
 */
export function getPreset(name: VirtualListPresetName): VirtualListPreset {
  return virtualPresets[name]
}

/**
 * Create a custom preset by extending an existing one
 *
 * @example
 * ```tsx
 * const customPreset = extendPreset('dataTable', {
 *   estimateSize: 60,
 *   gap: 4
 * })
 * ```
 */
export function extendPreset(
  baseName: VirtualListPresetName,
  overrides: Partial<VirtualListPreset>
): VirtualListPreset {
  return {
    ...virtualPresets[baseName],
    ...overrides,
  }
}

/**
 * Preset recommendations based on data characteristics
 */
export const presetRecommendations = {
  /**
   * Get recommended preset based on data characteristics
   */
  getRecommendation: (characteristics: {
    hasVariableHeight?: boolean
    hasHeaders?: boolean
    needsSorting?: boolean
    isGrid?: boolean
    isMasonry?: boolean
    itemCount?: number
  }): VirtualListPresetName => {
    const { hasVariableHeight, hasHeaders, needsSorting, isGrid, isMasonry, itemCount } = characteristics

    // Masonry layout
    if (isMasonry) return 'imageGallery'

    // Grid layout
    if (isGrid) return 'productGrid'

    // Table with sorting
    if (needsSorting) return 'dataTable'

    // List with sticky headers
    if (hasHeaders) return 'commentList'

    // Variable height content
    if (hasVariableHeight) return 'aiLogs'

    // Large dataset
    if (itemCount && itemCount > 1000) return 'auditLogs'

    // Default to infinite feed
    return 'infiniteFeed'
  },
}

/**
 * Preset usage examples
 */
export const presetExamples = {
  auditLogs: `
<VirtualTable
  data={logs}
  columns={columns}
  height={600}
  estimateRowHeight={${virtualPresets.auditLogs.estimateSize}}
  overscan={${virtualPresets.auditLogs.overscan}}
  stickyHeader={${virtualPresets.auditLogs.stickyHeader}}
/>
  `,

  aiLogs: `
<VirtualListDynamic
  items={logs}
  height={600}
  estimateSize={${virtualPresets.aiLogs.estimateSize}}
  overscan={${virtualPresets.aiLogs.overscan}}
  gap={${virtualPresets.aiLogs.gap}}
  enableInfiniteScroll={${virtualPresets.aiLogs.infiniteScroll}}
  onLoadMore={fetchMore}
  renderItem={(log) => <AILogCard log={log} />}
/>
  `,

  imageGallery: `
<VirtualMasonry
  items={images}
  height={600}
  lanes={${virtualPresets.imageGallery.lanes}}
  estimateSize={${virtualPresets.imageGallery.estimateSize}}
  overscan={${virtualPresets.imageGallery.overscan}}
  gap={${virtualPresets.imageGallery.gap}}
  enableInfiniteScroll={${virtualPresets.imageGallery.infiniteScroll}}
  renderItem={(image) => <ImageCard image={image} />}
/>
  `,

  productGrid: `
<VirtualGrid
  items={products}
  height={600}
  columns={${virtualPresets.productGrid.columns}}
  estimateItemHeight={${virtualPresets.productGrid.estimateSize}}
  overscan={${virtualPresets.productGrid.overscan}}
  gap={${virtualPresets.productGrid.gap}}
  renderItem={(product) => <ProductCard product={product} />}
/>
  `,
}
