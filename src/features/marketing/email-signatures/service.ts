// src/features/marketing/email-signatures/service.ts

import { queryOptions } from '@tanstack/react-query'
import { api } from '@/generated/api'
import type { EmailSignatureId } from './types'

export const emailSignaturesService = {
  getSignaturesQueryOptions: (options?: { limit?: number }) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.email_signatures.queries.getEmailSignatures, options],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),

  getSignatureQueryOptions: (signatureId: EmailSignatureId) =>
    queryOptions({
      queryKey: [api.lib.addons.marketing.email_signatures.queries.getEmailSignature, { signatureId }],
      queryFn: async () => {
        throw new Error('Query function not implemented - handled by Convex')
      },
    }),
}
