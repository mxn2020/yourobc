// Schema exports for supporting/inquirySources
import { inquirySourcesTable } from './inquirySources';

export const supportingInquirySourcesSchemas = {
  inquirySources: inquirySourcesTable,
} as const;
