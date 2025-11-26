// src/features/marketing/social-scheduler/service.ts

import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'

export const socialSchedulerService = {
  getPostsQueryOptions: (options?: { limit?: number }) =>
    convexQuery(api.lib.marketing.social_scheduler.queries.getSocialPosts, { options }),

  getPostStatsQueryOptions: () =>
    convexQuery(api.lib.marketing.social_scheduler.queries.getSocialPostStats, {}),
}
