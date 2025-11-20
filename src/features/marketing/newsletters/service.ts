// src/features/marketing/newsletters/service.ts

import { queryOptions } from '@tanstack/react-query'
import { api } from '@/convex/_generated/api'

export const newslettersService = {
  getNewslettersQueryOptions: (options?: { limit?: number }) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.newsletters.queries.getNewsletters, options],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getNewsletterStatsQueryOptions: () =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.newsletters.queries.getNewsletterStats, {}],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),
}
