// convex/schema/system/supporting/documents/validators.ts
// Grouped validators for documents module

import { v } from 'convex/values';

export const documentValidators = {
  type: v.union(
    v.literal('file'),
    v.literal('image'),
    v.literal('video'),
    v.literal('audio'),
    v.literal('document'),
    v.literal('spreadsheet'),
    v.literal('presentation'),
    v.literal('pdf'),
    v.literal('other')
  ),
  status: v.union(
    v.literal('uploaded'),
    v.literal('processing'),
    v.literal('ready'),
    v.literal('failed'),
    v.literal('archived')
  ),
} as const;
