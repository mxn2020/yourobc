// src/features/marketing/email-signatures/service.ts

import { convexQuery } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { EmailSignatureId } from './types'

export const emailSignaturesService = {
  getSignaturesQueryOptions: (options?: { limit?: number }) =>
    convexQuery(api.lib.marketing.email_signatures.queries.getEmailSignatures, { options }),

  getSignatureQueryOptions: (signatureId: EmailSignatureId) =>
    convexQuery(api.lib.marketing.email_signatures.queries.getEmailSignature, { signatureId }),
}
