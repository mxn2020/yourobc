// convex/schema/boilerplate/stripe_connect/stripe_connect/schemas.ts
// Schema exports for stripe_connect module

import {
  connectedAccountsTable,
  clientProductsTable,
  clientPaymentsTable,
  connectEventsTable,
} from './stripe_connect';

export const boilerplateStripeConnectSchemas = {
  connectedAccounts: connectedAccountsTable,
  clientProducts: clientProductsTable,
  clientPayments: clientPaymentsTable,
  connectEvents: connectEventsTable,
};
