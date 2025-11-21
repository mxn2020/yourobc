// convex/schema/yourobc/quotes/types.ts
// Type extractions from validators for quotes module

import { Infer } from 'convex/values';
import { quotesValidators } from './validators';

// Extract types from validators
export type QuoteStatus = Infer<typeof quotesValidators.status>;
export type QuoteServiceType = Infer<typeof quotesValidators.serviceType>;
export type QuotePriority = Infer<typeof quotesValidators.priority>;
