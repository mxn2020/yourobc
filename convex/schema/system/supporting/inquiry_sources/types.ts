import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { inquirySourcesValidators } from './validators';
import { inquirySourcesTable } from './tables';

export type InquirySource = Doc<'systemSupportingInquirySources'>;
export type InquirySourceId = Id<'systemSupportingInquirySources'>;
export type InquirySourceSchema = Infer<typeof inquirySourcesTable.validator>;
export type InquirySourceType = Infer<typeof inquirySourcesValidators.sourceType>;
