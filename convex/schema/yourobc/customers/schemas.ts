// convex/schema/yourobc/customers/schemas.ts
// Schema exports for customers module

import { v } from 'convex/values';
import {
  contactLogTable,
  customerAnalyticsTable,
  customerDunningConfigTable,
  customerMarginsTable,
  customersTable,
} from './tables';

export const customerIdSchema = v.id('yourobcCustomers');
export const customerMarginIdSchema = v.id('yourobcCustomerMargins');
export const contactLogIdSchema = v.id('yourobcContactLog');
export const customerAnalyticsIdSchema = v.id('yourobcCustomerAnalytics');
export const customerDunningConfigIdSchema = v.id('yourobcCustomerDunningConfig');

export const yourobcCustomersSchemas = {
  yourobcCustomers: customersTable,
  yourobcCustomerMargins: customerMarginsTable,
  yourobcContactLog: contactLogTable,
  yourobcCustomerAnalytics: customerAnalyticsTable,
  yourobcCustomerDunningConfig: customerDunningConfigTable,
};
