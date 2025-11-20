// convex/schema/boilerplate/websites/websites/types.ts
// Type extractions from validators for websites module

import { Infer } from 'convex/values';
import { websitesValidators } from './validators';

// Extract types from validators
export type WebsiteStatus = Infer<typeof websitesValidators.status>;
export type WebsiteVisibility = Infer<typeof websitesValidators.visibility>;
export type WebsitePriority = Infer<typeof websitesValidators.priority>;
