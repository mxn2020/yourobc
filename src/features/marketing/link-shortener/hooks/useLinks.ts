// src/features/marketing/link-shortener/hooks/useLinks.ts

import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { linkShortenerService } from '../service'
import type { CreateLinkData, UpdateLinkData, MarketingLinkId } from '../types'
import { toast } from 'react-hot-toast'

export function useLinks(options?: { limit?: number; offset?: number }) {
  return useSuspenseQuery(linkShortenerService.getLinksQueryOptions(options))
}

export function useLink(linkId: MarketingLinkId) {
  return useSuspenseQuery(linkShortenerService.getLinkQueryOptions(linkId))
}

export function useLinkAnalytics(linkId: MarketingLinkId) {
  return useSuspenseQuery(linkShortenerService.getLinkAnalyticsQueryOptions(linkId))
}

export function useLinkStats() {
  return useSuspenseQuery(linkShortenerService.getLinkStatsQueryOptions())
}

export function useCreateLink() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.link_shortener.mutations.createMarketingLink, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinks] })
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinkStats] })
      toast.success('Link created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create link')
    },
  })
}

export function useUpdateLink() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.link_shortener.mutations.updateMarketingLink, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinks] })
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLink] })
      toast.success('Link updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update link')
    },
  })
}

export function useDeleteLink() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.link_shortener.mutations.deleteMarketingLink, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinks] })
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinkStats] })
      toast.success('Link deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete link')
    },
  })
}
