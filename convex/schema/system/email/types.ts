// convex/schema/system/email/types.ts
// Consolidated type extractions for all email module components

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import {
  emailValidators,
  emailFields,
} from './validators';
import { emailConfigsTable } from './configs/tables';
import { emailTemplatesTable } from './email_templates/tables';
import { emailLogsTable } from './email_logs/tables';

// ============================================================================
// Document Types
// ============================================================================

export type EmailConfig = Doc<'configs'>;
export type EmailConfigId = Id<'configs'>;

export type EmailTemplate = Doc<'templates'>;
export type EmailTemplateId = Id<'templates'>;

export type EmailLog = Doc<'logs'>;
export type EmailLogId = Id<'logs'>;

// ============================================================================
// Schema Types (from table validators)
// ============================================================================

export type EmailConfigSchema = Infer<typeof emailConfigsTable.validator>;
export type EmailTemplateSchema = Infer<typeof emailTemplatesTable.validator>;
export type EmailLogSchema = Infer<typeof emailLogsTable.validator>;

// ============================================================================
// Validator Types (Simple Unions)
// ============================================================================

export type EmailProvider = Infer<typeof emailValidators.provider>;
export type EmailTestStatus = Infer<typeof emailValidators.testStatus>;
export type EmailStatus = Infer<typeof emailValidators.status>;
export type EmailDeliveryStatus = Infer<typeof emailValidators.deliveryStatus>;
export type EmailVariableType = Infer<typeof emailValidators.variableType>;

// ============================================================================
// Field Types (Complex Objects)
// ============================================================================

export type EmailContentPreview = Infer<typeof emailFields.contentPreview>;
export type EmailTemplateVariable = Infer<typeof emailFields.templateVariable>;
export type EmailProviderConfig = Infer<typeof emailFields.providerConfig>;
export type EmailTemplateSettings = Infer<typeof emailFields.templateSettings>;
export type EmailConfigSettings = Infer<typeof emailFields.configSettings>;
export type EmailConfigMetadata = Infer<typeof emailFields.configMetadata>;
export type EmailTemplateMetadata = Infer<typeof emailFields.templateMetadata>;
export type EmailLogMetadata = Infer<typeof emailFields.logMetadata>;
