// convex/schema/marketing/social_scheduler/types.ts
// Type extractions from validators for social_scheduler module

import { Infer } from 'convex/values';
import { socialSchedulerValidators } from './validators';

// Extract types from validators
export type SocialPlatform = Infer<typeof socialSchedulerValidators.platform>;
export type SocialPostStatus = Infer<typeof socialSchedulerValidators.postStatus>;
export type SocialPostVisibility = Infer<typeof socialSchedulerValidators.visibility>;
export type SocialMediaType = Infer<typeof socialSchedulerValidators.mediaType>;
