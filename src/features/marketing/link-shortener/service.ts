// src/features/marketing/link-shortener/service.ts

import { queryOptions } from '@tanstack/react-query'
import { api } from '@/generated/api'
import type { MarketingLinkId } from './types'

export const linkShortenerService = {
  getLinksQueryOptions: (options?: { limit?: number; offset?: number }) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinks, options],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getLinkQueryOptions: (linkId: MarketingLinkId) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLink, { linkId }],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getLinkAnalyticsQueryOptions: (linkId: MarketingLinkId) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinkAnalytics, { linkId }],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getLinkStatsQueryOptions: () =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.link_shortener.queries.getMarketingLinkStats, {}],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),
}
