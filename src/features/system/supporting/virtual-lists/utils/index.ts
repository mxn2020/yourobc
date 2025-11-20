// src/features/system/supporting/virtual-lists/utils/index.ts

import type { VirtualListMetrics } from '../types'

/**
 * Calculate performance metrics for a virtualized list
 */
export function calculateVirtualListMetrics(
  totalItems: number,
  renderedItems: number,
  scrollOffset: number,
  totalSize: number
): VirtualListMetrics {
  const performanceRatio = totalItems > 0 ? totalItems / renderedItems : 1

  return {
    totalItems,
    renderedItems,
    scrollOffset,
    totalSize,
    performanceRatio,
  }
}

/**
 * Get estimated size based on content type
 */
export function getEstimatedSize(contentType: 'compact' | 'normal' | 'comfortable'): number {
  switch (contentType) {
    case 'compact':
      return 40
    case 'comfortable':
      return 60
    default:
      return 50
  }
}

/**
 * Calculate optimal overscan based on list size
 */
export function getOptimalOverscan(itemCount: number): number {
  if (itemCount < 100) return 3
  if (itemCount < 1000) return 5
  if (itemCount < 10000) return 10
  return 20
}

/**
 * Format performance improvement ratio
 */
export function formatPerformanceRatio(ratio: number): string {
  return `${Math.round(ratio * 10) / 10}x faster`
}

/**
 * Check if virtualization is recommended based on item count
 */
export function shouldUseVirtualization(itemCount: number, threshold = 50): boolean {
  return itemCount >= threshold
}

/**
 * Calculate scroll percentage
 */
export function calculateScrollPercentage(scrollOffset: number, totalSize: number, containerHeight: number): number {
  const maxScroll = totalSize - containerHeight
  if (maxScroll <= 0) return 0
  return Math.min(100, Math.max(0, (scrollOffset / maxScroll) * 100))
}

// Export presets
export * from './presets'
