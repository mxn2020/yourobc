// convex/schema/marketing/landing_pages/types.ts
// Type extractions from validators for landing_pages module

import { Infer } from 'convex/values';
import { landingPagesValidators } from './validators';

// Extract types from validators
export type LandingPageStatus = Infer<typeof landingPagesValidators.status>;
export type LandingPageVisibility = Infer<typeof landingPagesValidators.visibility>;
export type LandingPageSectionType = Infer<typeof landingPagesValidators.sectionType>;
