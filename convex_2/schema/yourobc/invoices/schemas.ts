// convex/schema/yourobc/invoices/schemas.ts
// Schema exports for invoices module

import { v } from 'convex/values';
import { invoicesTable } from './invoices';

export const invoiceIdSchema = v.id('yourobcInvoices')

export const yourobcInvoicesSchemas = {
  yourobcInvoices: invoicesTable,
};
