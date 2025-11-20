// convex/schema/software/yourobc/partners/types.ts
// Type extractions from validators for partners module

import { Infer } from 'convex/values';
import { partnersValidators } from './validators';

// Extract types from validators
export type PartnerStatus = Infer<typeof partnersValidators.status>;
export type PartnerServiceType = Infer<typeof partnersValidators.serviceType>;
export type PartnerCurrency = Infer<typeof partnersValidators.currency>;
export type PartnerRanking = Infer<typeof partnersValidators.ranking>;
export type PartnerServiceCapabilities = Infer<typeof partnersValidators.serviceCapabilities>;
