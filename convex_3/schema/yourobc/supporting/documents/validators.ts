// convex/schema/yourobc/supporting/documents/validators.ts
import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

export const documentsValidators = {
  documentType: baseValidators.documentType,
  documentStatus: baseValidators.documentStatus,
} as const;
