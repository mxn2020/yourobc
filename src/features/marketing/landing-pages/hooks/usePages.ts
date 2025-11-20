// src/features/marketing/landing-pages/hooks/usePages.ts

import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
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

  return useConvexMutation(api.lib.addons.marketing.landing_pages.mutations.createLandingPage, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPages] })
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPageStats] })
      toast.success('Landing page created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create page')
    },
  })
}

export function useUpdatePage() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.landing_pages.mutations.updateLandingPage, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPages] })
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPage] })
      toast.success('Landing page updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update page')
    },
  })
}

export function useDeletePage() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.landing_pages.mutations.deleteLandingPage, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPages] })
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPageStats] })
      toast.success('Landing page deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete page')
    },
  })
}
