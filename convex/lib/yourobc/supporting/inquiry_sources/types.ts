// convex/lib/yourobc/supporting/inquiry_sources/types.ts
// convex/yourobc/supporting/inquirySources/types.ts
import type { Doc, Id } from '../../../../_generated/dataModel';

export type InquirySource = Doc<'yourobcInquirySources'>;
export type InquirySourceId = Id<'yourobcInquirySources'>;

export interface CreateInquirySourceData {
  name: string;
  code?: string;
  type: InquirySource['type'];
  description?: string;
}

