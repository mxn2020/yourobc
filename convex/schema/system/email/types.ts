// convex/schema/system/email/types.ts
// Consolidated type extractions for all email module components

import { Infer } from 'convex/values';
import {
  emailValidators,
} from './validators';

// ============================================================================
// Email Types
// ============================================================================

export type EmailProvider = Infer<typeof emailValidators.provider>;
export type EmailTestStatus = Infer<typeof emailValidators.testStatus>;
export type EmailStatus = Infer<typeof emailValidators.status>;
export type EmailVariableType = Infer<typeof emailValidators.variableType>;

