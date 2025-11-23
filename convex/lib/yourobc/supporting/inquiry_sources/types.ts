// convex/lib/yourobc/supporting/inquiry_sources/types.ts
// TypeScript type definitions for inquiry sources module

import type { Doc, Id } from '@/generated/dataModel';
import type { InquirySourceType } from '@/schema/yourobc/supporting/inquiry_sources/types';

// Entity types
export type InquirySource = Doc<'yourobcInquirySources'>;
export type InquirySourceId = Id<'yourobcInquirySources'>;

// Create operation
export interface CreateInquirySourceData {
  name: string;
  code?: string;
  type: InquirySourceType;
  description?: string;
  isActive?: boolean;
}

// Update operation
export interface UpdateInquirySourceData {
  name?: string;
  code?: string;
  type?: InquirySourceType;
  description?: string;
  isActive?: boolean;
}

// List response
export interface InquirySourceListResponse {
  items: InquirySource[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface InquirySourceFilters {
  type?: InquirySourceType[];
  isActive?: boolean;
}
