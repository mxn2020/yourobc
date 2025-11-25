// convex/schema/yourobc/invoices/schemas.ts
// Schema exports for invoices module

import { v } from 'convex/values';
import { invoicesTable } from './tables';

export const invoiceIdSchema = v.id('yourobcInvoices')

export const yourobcInvoicesSchemas = {
  yourobcInvoices: invoicesTable,
};
