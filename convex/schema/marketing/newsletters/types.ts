// convex/schema/marketing/newsletters/types.ts
// Type extractions from validators for newsletters module

import { Infer } from 'convex/values';
import { newslettersValidators } from './validators';

// Extract types from validators
export type NewsletterStatus = Infer<typeof newslettersValidators.newsletterStatus>;
export type NewsletterCampaignStatus = Infer<typeof newslettersValidators.campaignStatus>;
export type NewsletterSubscriberStatus = Infer<typeof newslettersValidators.subscriberStatus>;
export type NewsletterVisibility = Infer<typeof newslettersValidators.visibility>;
export type NewsletterSubscriptionSource = Infer<typeof newslettersValidators.subscriptionSource>;
export type NewsletterTemplateCategory = Infer<typeof newslettersValidators.templateCategory>;
