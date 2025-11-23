// convex/schema/system/email/types.ts
// Consolidated type extractions for all email module components

import { Infer } from 'convex/values';
import {
  emailValidators,
  emailFields,
} from './validators';

// ============================================================================
// Email Validator Types (Simple Unions)
// ============================================================================

export type EmailProvider = Infer<typeof emailValidators.provider>;
export type EmailTestStatus = Infer<typeof emailValidators.testStatus>;
export type EmailStatus = Infer<typeof emailValidators.status>;
export type EmailDeliveryStatus = Infer<typeof emailValidators.deliveryStatus>;
export type EmailVariableType = Infer<typeof emailValidators.variableType>;

// ============================================================================
// Email Field Types (Complex Objects)
// ============================================================================

export type EmailContentPreview = Infer<typeof emailFields.contentPreview>;
export type EmailTemplateVariable = Infer<typeof emailFields.templateVariable>;
export type EmailProviderConfig = Infer<typeof emailFields.providerConfig>;
export type EmailTemplateSettings = Infer<typeof emailFields.templateSettings>;
export type EmailConfigSettings = Infer<typeof emailFields.configSettings>;
export type EmailConfigMetadata = Infer<typeof emailFields.configMetadata>;
export type EmailTemplateMetadata = Infer<typeof emailFields.templateMetadata>;
export type EmailLogMetadata = Infer<typeof emailFields.logMetadata>;
