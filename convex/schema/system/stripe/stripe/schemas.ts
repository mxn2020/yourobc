// convex/schema/boilerplate/stripe/stripe/schemas.ts
// Schema exports for stripe module

import {
  stripeCustomersTable,
  stripeSubscriptionsTable,
  stripePaymentsTable,
  stripeWebhookEventsTable,
} from './stripe';

export const stripeSchemas = {
  stripeCustomers: stripeCustomersTable,
  stripeSubscriptions: stripeSubscriptionsTable,
  stripePayments: stripePaymentsTable,
  stripeWebhookEvents: stripeWebhookEventsTable,
};
