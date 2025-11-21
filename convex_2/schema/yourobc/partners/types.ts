// convex/schema/yourobc/partners/types.ts
// Type extractions from validators for partners module

import { Infer } from 'convex/values';
import { partnersValidators } from './validators';

// Extract types from validators
export type PartnersStatus = Infer<typeof partnersValidators.status>;
