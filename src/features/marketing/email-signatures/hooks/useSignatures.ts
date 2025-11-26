// src/features/marketing/email-signatures/hooks/useSignatures.ts

import { useSuspenseQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { emailSignaturesService } from '../service'
import { toast } from 'react-hot-toast'

export function useSignatures(options?: { limit?: number }) {
  return useSuspenseQuery(emailSignaturesService.getSignaturesQueryOptions(options))
}

export function useCreateSignature() {
  const queryClient = useQueryClient()
  const signaturesQueryKey = emailSignaturesService.getSignaturesQueryOptions().queryKey

  return useMutation({
    mutationFn: useConvexMutation(api.lib.marketing.email_signatures.mutations.createEmailSignature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signaturesQueryKey })
      toast.success('Email signature created successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create signature')
    },
  })
}

export function useUpdateSignature() {
  const queryClient = useQueryClient()
  const signaturesQueryKey = emailSignaturesService.getSignaturesQueryOptions().queryKey

  return useMutation({
    mutationFn: useConvexMutation(api.lib.marketing.email_signatures.mutations.updateEmailSignature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signaturesQueryKey })
      toast.success('Email signature updated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update signature')
    },
  })
}

export function useDeleteSignature() {
  const queryClient = useQueryClient()
  const signaturesQueryKey = emailSignaturesService.getSignaturesQueryOptions().queryKey

  return useMutation({
    mutationFn: useConvexMutation(api.lib.marketing.email_signatures.mutations.deleteEmailSignature),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signaturesQueryKey })
      toast.success('Email signature deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete signature')
    },
  })
}
