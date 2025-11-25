import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { inquirySourcesValidators } from './validators';
import { inquirySourcesTable } from './tables';

export type InquirySource = Doc<'inquirySources'>;
export type InquirySourceId = Id<'inquirySources'>;
export type InquirySourceSchema = Infer<typeof inquirySourcesTable.validator>;
export type InquirySourceType = Infer<typeof inquirySourcesValidators.sourceType>;
