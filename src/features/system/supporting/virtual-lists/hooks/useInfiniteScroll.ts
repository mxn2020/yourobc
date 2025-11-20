// src/features/boilerplate/supporting/virtual-lists/hooks/useInfiniteScroll.ts

import { useEffect } from 'react'
import type { UseInfiniteScrollOptions } from '../types'

/**
 * Hook for implementing infinite scroll functionality
 */
export function useInfiniteScroll({
  enabled = true,
  threshold = 500,
  onLoadMore,
  isLoading = false,
  hasMore = true,
}: UseInfiniteScrollOptions) {
  useEffect(() => {
    if (!enabled || !hasMore || isLoading) return

    const handleScroll = () => {
      const scrollElement = document.scrollingElement
      if (!scrollElement) return

      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < threshold) {
        onLoadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enabled, threshold, onLoadMore, isLoading, hasMore])
}

/**
 * Hook for implementing infinite scroll on a specific element
 */
export function useInfiniteScrollElement(
  elementRef: React.RefObject<HTMLElement>,
  {
    enabled = true,
    threshold = 500,
    onLoadMore,
    isLoading = false,
    hasMore = true,
  }: UseInfiniteScrollOptions
) {
  useEffect(() => {
    if (!enabled || !hasMore || isLoading) return

    const element = elementRef.current
    if (!element) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < threshold) {
        onLoadMore()
      }
    }

    element.addEventListener('scroll', handleScroll)
    return () => element.removeEventListener('scroll', handleScroll)
  }, [elementRef, enabled, threshold, onLoadMore, isLoading, hasMore])
}
