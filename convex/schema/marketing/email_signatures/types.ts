// convex/schema/marketing/email_signatures/types.ts
// Type extractions from validators for email_signatures module

import { Infer } from 'convex/values';
import { emailSignaturesValidators } from './validators';

// Extract types from validators
export type EmailSignatureStatus = Infer<typeof emailSignaturesValidators.status>;
export type EmailSignatureVisibility = Infer<typeof emailSignaturesValidators.visibility>;
export type EmailSignatureTemplateCategory = Infer<typeof emailSignaturesValidators.templateCategory>;
