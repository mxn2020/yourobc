// convex/schema/boilerplate/email/configs/types.ts
// Type extractions from validators for email configs module

import { Infer } from 'convex/values';
import { emailConfigsValidators } from './validators';

// Extract types from validators
export type EmailProvider = Infer<typeof emailConfigsValidators.provider>;
export type EmailConfigTestStatus = Infer<typeof emailConfigsValidators.testStatus>;
export type EmailConfigStatus = Infer<typeof emailConfigsValidators.status>;
