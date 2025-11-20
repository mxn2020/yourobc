// src/features/marketing/newsletters/hooks/useNewsletters.ts

import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { newslettersService } from '../service'
import { toast } from 'react-hot-toast'

export function useNewsletters(options?: { limit?: number }) {
  return useSuspenseQuery(newslettersService.getNewslettersQueryOptions(options))
}

export function useNewsletterStats() {
  return useSuspenseQuery(newslettersService.getNewsletterStatsQueryOptions())
}

export function useCreateNewsletter() {
  const queryClient = useQueryClient()
  return useConvexMutation(api.lib.addons.marketing.newsletters.mutations.createNewsletter, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.newsletters.queries.getNewsletters] })
      toast.success('Newsletter created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create newsletter')
    },
  })
}
