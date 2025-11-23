// convex/schema/yourobc/supporting/inquiry_sources/types.ts
// Type extractions from validators for inquiry sources module

import { Infer } from 'convex/values';
import { inquirySourcesValidators } from './validators';

export type InquirySourceType = Infer<typeof inquirySourcesValidators.inquirySourceType>;
