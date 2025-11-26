// src/features/marketing/newsletters/service.ts

import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'

export const newslettersService = {
  getNewslettersQueryOptions: (options?: { limit?: number }) =>
    convexQuery(api.lib.marketing.newsletters.queries.getNewsletters, { options }),

  getNewsletterStatsQueryOptions: () =>
    convexQuery(api.lib.marketing.newsletters.queries.getNewsletterStats, {}),
}
