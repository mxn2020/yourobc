// src/features/marketing/email-signatures/hooks/useSignatures.ts

import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { emailSignaturesService } from '../service'
import { toast } from 'react-hot-toast'

export function useSignatures(options?: { limit?: number }) {
  return useSuspenseQuery(emailSignaturesService.getSignaturesQueryOptions(options))
}

export function useCreateSignature() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.email_signatures.mutations.createEmailSignature, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.email_signatures.queries.getEmailSignatures] })
      toast.success('Email signature created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create signature')
    },
  })
}

export function useUpdateSignature() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.email_signatures.mutations.updateEmailSignature, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.email_signatures.queries.getEmailSignatures] })
      toast.success('Email signature updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update signature')
    },
  })
}

export function useDeleteSignature() {
  const queryClient = useQueryClient()

  return useConvexMutation(api.lib.addons.marketing.email_signatures.mutations.deleteEmailSignature, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lib.addons.marketing.email_signatures.queries.getEmailSignatures] })
      toast.success('Email signature deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete signature')
    },
  })
}
