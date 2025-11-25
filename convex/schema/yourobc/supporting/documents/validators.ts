// convex/schema/yourobc/supporting/documents/validators.ts
// Validators for documents module

import { v } from 'convex/values';

export const documentsValidators = {
  documentType: v.union(
    v.literal('contract'),
    v.literal('invoice'),
    v.literal('receipt'),
    v.literal('report'),
    v.literal('presentation'),
    v.literal('spreadsheet'),
    v.literal('image'),
    v.literal('other')
  ),

  documentStatus: v.union(
    v.literal('draft'),
    v.literal('review'),
    v.literal('approved'),
    v.literal('archived')
  ),
} as const;

export const documentsFields = {} as const;
