// convex/schema/boilerplate/stripe_connect/stripe_connect/types.ts
// Type extractions from validators for stripe_connect module

import { Infer } from 'convex/values';
import { stripeConnectValidators } from './validators';

// Extract types from validators
export type AccountStatus = Infer<typeof stripeConnectValidators.accountStatus>;
export type AccountType = Infer<typeof stripeConnectValidators.accountType>;
export type PaymentStatus = Infer<typeof stripeConnectValidators.paymentStatus>;
export type PaymentType = Infer<typeof stripeConnectValidators.paymentType>;
export type SubscriptionStatus = Infer<typeof stripeConnectValidators.subscriptionStatus>;
export type Interval = Infer<typeof stripeConnectValidators.interval>;
export type EventType = Infer<typeof stripeConnectValidators.eventType>;
export type EventSource = Infer<typeof stripeConnectValidators.eventSource>;
export type MemberRole = Infer<typeof stripeConnectValidators.memberRole>;
