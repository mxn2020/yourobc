// convex/schema/yourobc/customers/schemas.ts
// Schema exports for customers module

import { v } from 'convex/values';
import { customersTable } from './customers';

export const customerIdSchema = v.id('yourobcCustomers')

export const yourobcCustomersSchemas = {
  yourobcCustomers: customersTable,
};
