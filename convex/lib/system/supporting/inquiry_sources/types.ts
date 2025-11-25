// convex/lib/system/supporting/inquiry_sources/types.ts
// Type definitions for system inquiry sources module

import type { Doc, Id } from '@/generated/dataModel';
import type { InquirySourceType } from '@/schema/system/supporting/inquiry_sources/types';

export type SystemInquirySource = Doc<'inquirySources'>;
export type SystemInquirySourceId = Id<'inquirySources'>;

export interface CreateSystemInquirySourceData {
  name: string;
  code: string;
  type: InquirySourceType;
  description?: string;
  isActive?: boolean;
}

export interface UpdateSystemInquirySourceData {
  name?: string;
  code?: string;
  type?: InquirySourceType;
  description?: string;
  isActive?: boolean;
}

export interface SystemInquirySourceFilters {
  type?: InquirySourceType;
  isActive?: boolean;
}

export interface SystemInquirySourceListResponse {
  items: SystemInquirySource[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}
