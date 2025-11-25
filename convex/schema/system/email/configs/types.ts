// convex/schema/system/email/configs/types.ts
// Type extractions for email configs module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { emailConfigsFields, emailConfigsValidators } from './validators';
import { emailConfigsTable } from './tables';

export type EmailConfig = Doc<'emailConfigs'>;
export type EmailConfigId = Id<'emailConfigs'>;

export type EmailConfigSchema = Infer<typeof emailConfigsTable.validator>;

export type EmailProvider = Infer<typeof emailConfigsValidators.provider>;
export type EmailStatus = Infer<typeof emailConfigsValidators.status>;
export type EmailTestStatus = Infer<typeof emailConfigsValidators.testStatus>;

export type EmailProviderConfig = Infer<typeof emailConfigsFields.providerConfig>;
export type EmailConfigSettings = Infer<typeof emailConfigsFields.configSettings>;
export type EmailConfigMetadata = Infer<typeof emailConfigsFields.configMetadata>;
