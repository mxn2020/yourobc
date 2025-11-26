// convex/lib/marketing/email_signatures/types.ts

import type { Doc, Id } from '@/generated/dataModel';

export type MarketingEmailSignature = Doc<'marketingEmailSignatures'>;
export type MarketingEmailSignatureId = Id<'marketingEmailSignatures'>;
export type MarketingSignatureTemplate = Doc<'marketingSignatureTemplates'>;

export interface CreateEmailSignatureData {
  name: string;
  fullName: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  template?: string;
  tags?: string[];
}

export interface UpdateEmailSignatureData {
  name?: string;
  fullName?: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  htmlContent?: string;
  tags?: string[];
}
