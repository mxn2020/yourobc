// src/features/marketing/link-shortener/service.ts

import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { MarketingLinkId } from './types'

export const linkShortenerService = {
  getLinksQueryOptions: (options?: { limit?: number; offset?: number }) =>
    convexQuery(api.lib.marketing.link_shortener.queries.getMarketingLinks, { options }),

  getLinkQueryOptions: (linkId: MarketingLinkId) =>
    convexQuery(api.lib.marketing.link_shortener.queries.getMarketingLink, { linkId }),

  getLinkAnalyticsQueryOptions: (linkId: MarketingLinkId) =>
    convexQuery(api.lib.marketing.link_shortener.queries.getMarketingLinkAnalytics, { linkId }),

  getLinkStatsQueryOptions: () =>
    convexQuery(api.lib.marketing.link_shortener.queries.getMarketingLinkStats, {}),
}
