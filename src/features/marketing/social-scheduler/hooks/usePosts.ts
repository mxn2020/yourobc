// src/features/marketing/social-scheduler/hooks/usePosts.ts

import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { socialSchedulerService } from '../service'
import { toast } from 'react-hot-toast'

export function usePosts(options?: { limit?: number }) {
  return useSuspenseQuery(socialSchedulerService.getPostsQueryOptions(options))
}

export function usePostStats() {
  return useSuspenseQuery(socialSchedulerService.getPostStatsQueryOptions())
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useConvexMutation(api.lib.addons.marketing.social_scheduler.mutations.createSocialPost, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.social_scheduler.queries.getSocialPosts] })
      toast.success('Post created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create post')
    },
  })
}
