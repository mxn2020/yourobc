// convex/schema/system/email/templates/types.ts
// Type extractions from validators for email templates module

import { Infer } from 'convex/values';
import { emailTemplatesValidators } from './validators';

// Extract types from validators
export type EmailTemplateStatus = Infer<typeof emailTemplatesValidators.status>;
export type EmailTemplateVariableType = Infer<typeof emailTemplatesValidators.variableType>;
