// convex/schema/yourobc/supporting/inquiry_sources/types.ts
// Type definitions for inquiry sources module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { inquirySourcesValidators } from './validators';
import { inquirySourcesTable } from './tables';

// ============================================
// Document Types
// ============================================

export type InquirySource = Doc<'yourobcInquirySources'>;
export type InquirySourceId = Id<'yourobcInquirySources'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type InquirySourceSchema = Infer<typeof inquirySourcesTable.validator>;

// ============================================
// Validator Types
// ============================================

export type InquirySourceType = Infer<typeof inquirySourcesValidators.sourceType>;
