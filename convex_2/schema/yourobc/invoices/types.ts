// convex/schema/yourobc/invoices/types.ts
// Type extractions from validators for invoices module

import { Infer } from 'convex/values';
import { invoicesValidators } from './validators';

// Extract types from validators
export type InvoiceStatus = Infer<typeof invoicesValidators.status>;
export type InvoiceType = Infer<typeof invoicesValidators.type>;

