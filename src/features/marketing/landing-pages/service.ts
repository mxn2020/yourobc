// src/features/marketing/landing-pages/service.ts

import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { LandingPageId } from './types'

export const landingPagesService = {
  getPagesQueryOptions: (options?: { limit?: number; offset?: number }) =>
    convexQuery(api.lib.marketing.landing_pages.queries.getLandingPages, { options }),

  getPageQueryOptions: (pageId: LandingPageId) =>
    convexQuery(api.lib.marketing.landing_pages.queries.getLandingPage, { pageId }),

  getPageStatsQueryOptions: () =>
    convexQuery(api.lib.marketing.landing_pages.queries.getLandingPageStats, {}),
}
