// convex/schema/system/email/email_logs/types.ts
// Type extractions for email logs module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { emailLogsFields, emailLogsValidators } from './validators';
import { emailLogsTable } from './tables';

export type EmailLog = Doc<'emailLogs'>;
export type EmailLogId = Id<'emailLogs'>;

export type EmailLogSchema = Infer<typeof emailLogsTable.validator>;

export type EmailProvider = Infer<typeof emailLogsValidators.provider>;
export type EmailDeliveryStatus = Infer<typeof emailLogsValidators.deliveryStatus>;

export type EmailLogMetadata = Infer<typeof emailLogsFields.logMetadata>;
export type EmailContentPreview = Infer<typeof emailLogsFields.contentPreview>;
