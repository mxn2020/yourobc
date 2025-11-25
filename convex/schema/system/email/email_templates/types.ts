// convex/schema/system/email/email_templates/types.ts
// Type extractions for email templates module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { emailTemplatesFields, emailTemplatesValidators } from './validators';
import { emailTemplatesTable } from './tables';

export type EmailTemplate = Doc<'emailTemplates'>;
export type EmailTemplateId = Id<'emailTemplates'>;

export type EmailTemplateSchema = Infer<typeof emailTemplatesTable.validator>;

export type EmailProvider = Infer<typeof emailTemplatesValidators.provider>;
export type EmailStatus = Infer<typeof emailTemplatesValidators.status>;
export type EmailVariableType = Infer<typeof emailTemplatesValidators.variableType>;

export type EmailTemplateVariable = Infer<typeof emailTemplatesFields.templateVariable>;
export type EmailTemplateSettings = Infer<typeof emailTemplatesFields.templateSettings>;
export type EmailTemplateMetadata = Infer<typeof emailTemplatesFields.templateMetadata>;
export type EmailContentPreview = Infer<typeof emailTemplatesFields.contentPreview>;
