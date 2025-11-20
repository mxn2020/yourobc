// src/features/system/supporting/virtual-lists/index.ts

/**
 * Virtual Lists Module - Hybrid Approach
 *
 * This module provides three ways to use virtualization:
 * 1. Pattern Components - Pre-built components for common patterns
 * 2. Composable Hooks - Flexible hooks for custom implementations
 * 3. Configuration Presets - Quick-start configurations
 *
 * @example
 * ```tsx
 * // Option 1: Use pattern components
 * import { VirtualGrid, VirtualMasonry } from '@/features/system/supporting'
 *
 * // Option 2: Use hooks
 * import { useVirtualSticky, useVirtualGrid } from '@/features/system/supporting'
 *
 * // Option 3: Use presets
 * import { virtualPresets } from '@/features/system/supporting'
 * const config = virtualPresets.auditLogs
 * ```
 */

// ============================================================================
// BASE COMPONENTS
// ============================================================================
export { VirtualList } from './components/VirtualList'
export { VirtualListDynamic } from './components/VirtualListDynamic'
export { VirtualTable } from './components/VirtualTable'

// ============================================================================
// PATTERN COMPONENTS
// ============================================================================
export { VirtualGrid } from './components/patterns/VirtualGrid'
export { VirtualMasonry } from './components/patterns/VirtualMasonry'
export { VirtualListSticky } from './components/patterns/VirtualListSticky'
export { VirtualWindowList } from './components/patterns/VirtualWindowList'
export { VirtualTableSortable } from './components/patterns/VirtualTableSortable'

// ============================================================================
// BASE HOOKS
// ============================================================================
export { useVirtualScroll } from './hooks/useVirtualScroll'
export { useInfiniteScroll, useInfiniteScrollElement } from './hooks/useInfiniteScroll'

// ============================================================================
// PATTERN HOOKS
// ============================================================================
export { useVirtualSticky } from './hooks/patterns/useVirtualSticky'
export { useVirtualMasonry } from './hooks/patterns/useVirtualMasonry'
export { useVirtualGrid } from './hooks/patterns/useVirtualGrid'
export { useVirtualSmoothScroll, easingFunctions } from './hooks/patterns/useVirtualSmoothScroll'

// ============================================================================
// UTILITIES & PRESETS
// ============================================================================
export {
  calculateVirtualListMetrics,
  getEstimatedSize,
  getOptimalOverscan,
  formatPerformanceRatio,
  shouldUseVirtualization,
  calculateScrollPercentage,
} from './utils'

export {
  virtualPresets,
  getPreset,
  extendPreset,
  presetRecommendations,
  presetExamples,
} from './utils/presets'

// ============================================================================
// TYPES
// ============================================================================
export type {
  VirtualListProps,
  VirtualTableProps,
  VirtualTableColumn,
  VirtualGridProps,
  VirtualMasonryProps,
  VirtualListStickyProps,
  VirtualWindowListProps,
  VirtualListPreset,
  VirtualListPresetName,
  VirtualListMetrics,
  UseVirtualListReturn,
  UseInfiniteScrollOptions,
  UseVirtualStickyOptions,
  UseVirtualMasonryOptions,
  UseVirtualGridOptions,
  SmoothScrollOptions,
} from './types'

// ============================================================================
// EXAMPLES
// ============================================================================
// export { VirtualListExample, PatternShowcase } from './examples'

// ============================================================================
// RE-EXPORTS FROM TANSTACK VIRTUAL
// ============================================================================
export { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual'
export type { Virtualizer, VirtualItem } from '@tanstack/react-virtual'
