// src/features/marketing/landing-pages/service.ts

import { queryOptions } from '@tanstack/react-query'
import { api } from '@/convex/_generated/api'
import type { LandingPageId } from './types'

export const landingPagesService = {
  getPagesQueryOptions: (options?: { limit?: number; offset?: number }) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPages, options],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getPageQueryOptions: (pageId: LandingPageId) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPage, { pageId }],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getPageStatsQueryOptions: () =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.landing_pages.queries.getLandingPageStats, {}],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),
}
