// src/features/boilerplate/supporting/virtual-lists/hooks/useVirtualScroll.ts

import { useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

/**
 * Custom hook for creating a virtualizer with common configurations
 */
export function useVirtualScroll<T>({
  items,
  estimateSize = 50,
  overscan = 5,
  gap = 0,
  enableMeasurement = false,
}: {
  items: T[]
  estimateSize?: number
  overscan?: number
  gap?: number
  enableMeasurement?: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan,
    gap,
    // Enable dynamic measurement if requested
    measureElement: enableMeasurement
      ? (element) => element?.getBoundingClientRect().height ?? estimateSize
      : undefined,
  })

  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto'; smooth?: boolean }) => {
      virtualizer.scrollToIndex(index, {
        align: options?.align || 'auto',
        behavior: options?.smooth ? 'smooth' : 'auto',
      })
    },
    [virtualizer]
  )

  const scrollToTop = useCallback(() => {
    virtualizer.scrollToOffset(0, { behavior: 'smooth' })
  }, [virtualizer])

  const scrollToBottom = useCallback(() => {
    const totalSize = virtualizer.getTotalSize()
    virtualizer.scrollToOffset(totalSize, { behavior: 'smooth' })
  }, [virtualizer])

  return {
    scrollRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
  }
}
