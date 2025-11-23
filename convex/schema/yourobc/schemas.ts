// convex/schema/yourobc/schemas.ts

// Core yourobc table imports
import { yourobcAccountingSchemas } from './accounting/schemas';
import { yourobcCouriersSchemas } from './couriers/schemas';
import { yourobcCustomerMarginsSchemas } from './customerMargins/schemas';
import { yourobcCustomersSchemas } from './customers/schemas';
import { yourobcDashboardSchemas } from './dashboard/schemas';
import { yourobcEmployeesSchemas } from './employees/schemas';
import { yourobcInvoicesSchemas } from './invoices/schemas';
import { yourobcPartnersSchemas } from './partners/schemas';
import { yourobcQuotesSchemas } from './quotes/schemas';
import { yourobcShipmentsSchemas } from './shipments/schemas';
import { yourobcStatisticsSchemas } from './statistics/schemas';
import { yourobcSupportingSchemas } from './supporting/schemas';
import { yourobcTasksSchemas } from './tasks/schemas';
import { yourobcTrackingMessagesSchemas } from './trackingMessages/schemas';

export const yourobcSchemas = {
  // Accounting
  ...yourobcAccountingSchemas,

  // Couriers
  ...yourobcCouriersSchemas,

  // Customers
  ...yourobcCustomersSchemas,
  ...yourobcCustomerMarginsSchemas,

  // Dashboard
  ...yourobcDashboardSchemas,

  // Employees
  ...yourobcEmployeesSchemas,

  // Invoices
  ...yourobcInvoicesSchemas,

  // Partners
  ...yourobcPartnersSchemas,

  // Quotes
  ...yourobcQuotesSchemas,

  // Shipments
  ...yourobcShipmentsSchemas,

  // Statistics
  ...yourobcStatisticsSchemas,

  // Supporting
  ...yourobcSupportingSchemas,

  // Tasks
  ...yourobcTasksSchemas,

  // Tracking Messages
  ...yourobcTrackingMessagesSchemas,

}

