// convex/schema/boilerplate/payments/payments/types.ts
// Type extractions from validators for payments module

import { Infer } from 'convex/values';
import { paymentsValidators } from './validators';

// Extract types from validators
export type SubscriptionStatus = Infer<typeof paymentsValidators.subscriptionStatus>;
export type PlanType = Infer<typeof paymentsValidators.planType>;
export type EventType = Infer<typeof paymentsValidators.eventType>;
export type EventSource = Infer<typeof paymentsValidators.eventSource>;
