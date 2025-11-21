// convex/schema/yourobc/quotes/types.ts
// Type extractions from validators for quotes module

import { Infer } from 'convex/values';
import { quotesValidators } from './validators';
import { baseValidators } from '@/schema/base.validators';

// Extract types from validators
export type QuoteStatus = Infer<typeof quotesValidators.status>;
export type QuoteServiceType = Infer<typeof baseValidators.serviceType>;
export type QuotePriority = Infer<typeof quotesValidators.priority>;
