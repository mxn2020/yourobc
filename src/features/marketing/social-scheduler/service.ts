// src/features/marketing/social-scheduler/service.ts

import { queryOptions } from '@tanstack/react-query'
import { api } from '@/convex/_generated/api'

export const socialSchedulerService = {
  getPostsQueryOptions: (options?: { limit?: number }) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.social_scheduler.queries.getSocialPosts, options],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getPostStatsQueryOptions: () =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.social_scheduler.queries.getSocialPostStats, {}],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),
}
