// convex/schema/boilerplate/autumn/autumn_customers/types.ts
// Type extractions from validators for autumn customers module

import { Infer } from 'convex/values';
import { autumnCustomersValidators } from './validators';

// Extract types from validators
export type AutumnSubscriptionStatus = Infer<typeof autumnCustomersValidators.subscriptionStatus>;
