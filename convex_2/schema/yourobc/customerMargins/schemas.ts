// convex/schema/yourobc/customerMargins/schemas.ts
// Schema exports for customerMargins module

import { v } from 'convex/values';
import { customerMarginsTable } from './customerMargins';
import { contactLogTable } from './contactLog';
import { customerAnalyticsTable } from './customerAnalytics';
import { customerDunningConfigTable } from './customerDunningConfig';

export const customerMarginIdSchema = v.id('yourobcCustomerMargins');
export const contactLogIdSchema = v.id('yourobcContactLog');
export const customerAnalyticsIdSchema = v.id('yourobcCustomerAnalytics');
export const customerDunningConfigIdSchema = v.id('yourobcCustomerDunningConfig');

export const yourobcCustomerMarginsSchemas = {
  yourobcCustomerMargins: customerMarginsTable,
  yourobcContactLog: contactLogTable,
  yourobcCustomerAnalytics: customerAnalyticsTable,
  yourobcCustomerDunningConfig: customerDunningConfigTable,
};
