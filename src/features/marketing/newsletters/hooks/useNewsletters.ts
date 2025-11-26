// src/features/marketing/newsletters/hooks/useNewsletters.ts

import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
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
  const newslettersQueryKey = newslettersService.getNewslettersQueryOptions().queryKey

  return useMutation({
    mutationFn: useConvexMutation(api.lib.marketing.newsletters.mutations.createNewsletter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: newslettersQueryKey })
      toast.success('Newsletter created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create newsletter')
    },
  })
}
