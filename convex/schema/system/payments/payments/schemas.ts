// convex/schema/boilerplate/payments/payments/schemas.ts
// Schema exports for payments module

import { subscriptionsTable, usageLogsTable, paymentEventsTable } from './payments';

export const boilerplatePaymentsPaymentsSchemas = {
  subscriptions: subscriptionsTable,
  usageLogs: usageLogsTable,
  paymentEvents: paymentEventsTable,
};
