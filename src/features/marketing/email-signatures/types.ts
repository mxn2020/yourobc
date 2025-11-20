// src/features/marketing/email-signatures/types.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

export type EmailSignature = Doc<'marketingEmailSignatures'>
export type EmailSignatureId = Id<'marketingEmailSignatures'>

export interface CreateSignatureData {
  title: string
  description?: string
  fullName: string
  jobTitle?: string
  company?: string
  email?: string
  phone?: string
  website?: string
  template?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  visibility?: 'private' | 'team' | 'public'
  tags?: string[]
}
