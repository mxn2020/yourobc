// convex/schema/boilerplate/stripe/stripe/types.ts
// Type exports for stripe schema

import { Doc } from '@/generated/dataModel';

export type StripeCustomer = Doc<'stripeCustomers'>;
export type StripeSubscription = Doc<'stripeSubscriptions'>;
export type StripePayment = Doc<'stripePayments'>;
export type StripeWebhookEvent = Doc<'stripeWebhookEvents'>;
