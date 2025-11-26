// src/features/marketing/landing-pages/hooks/usePages.ts

import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { landingPagesService } from '../service'
import type { CreatePageData, UpdatePageData, LandingPageId } from '../types'
import { toast } from 'react-hot-toast'

export function usePages(options?: { limit?: number; offset?: number }) {
  return useSuspenseQuery(landingPagesService.getPagesQueryOptions(options))
}

export function usePage(pageId: LandingPageId) {
  return useSuspenseQuery(landingPagesService.getPageQueryOptions(pageId))
}

export function usePageStats() {
  return useSuspenseQuery(landingPagesService.getPageStatsQueryOptions())
}

export function useCreatePage() {
  const queryClient = useQueryClient()
  const pagesQueryKey = landingPagesService.getPagesQueryOptions().queryKey
  const statsQueryKey = landingPagesService.getPageStatsQueryOptions().queryKey

  return useMutation({
    mutationFn: useConvexMutation(api.lib.marketing.landing_pages.mutations.createLandingPage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagesQueryKey })
      queryClient.invalidateQueries({ queryKey: statsQueryKey })
      toast.success('Landing page created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create page')
    },
  })
}

export function useUpdatePage() {
  const queryClient = useQueryClient()
  const pagesQueryKey = landingPagesService.getPagesQueryOptions().queryKey
  const pageStatsQueryKey = landingPagesService.getPageStatsQueryOptions().queryKey

  return useMutation({
    mutationFn: useConvexMutation(api.lib.marketing.landing_pages.mutations.updateLandingPage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagesQueryKey })
      queryClient.invalidateQueries({ queryKey: pageStatsQueryKey })
      toast.success('Landing page updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update page')
    },
  })
}

export function useDeletePage() {
  const queryClient = useQueryClient()
  const pagesQueryKey = landingPagesService.getPagesQueryOptions().queryKey
  const statsQueryKey = landingPagesService.getPageStatsQueryOptions().queryKey

  return useMutation({
    mutationFn: useConvexMutation(api.lib.marketing.landing_pages.mutations.deleteLandingPage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pagesQueryKey })
      queryClient.invalidateQueries({ queryKey: statsQueryKey })
      toast.success('Landing page deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete page')
    },
  })
}
