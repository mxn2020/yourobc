// convex/schema/software/yourobc/invoices/types.ts
// Type extractions from validators for invoices module

import { Infer } from 'convex/values';
import { invoicesValidators } from './validators';

// Re-export types from base schema
export type {
  InvoiceStatus,
  InvoiceType,
  PaymentMethod,
  CollectionMethod,
} from '../../../../yourobc/base';

// Extract types from validators
export type InvoicePublicId = Infer<typeof invoicesValidators.publicId>;
export type InvoiceNumber = Infer<typeof invoicesValidators.invoiceNumber>;
export type InvoiceDescription = Infer<typeof invoicesValidators.description>;
export type LineItems = Infer<typeof invoicesValidators.lineItems>;
export type BillingAddress = Infer<typeof invoicesValidators.billingAddress>;
export type CurrencyAmount = Infer<typeof invoicesValidators.subtotal>;
export type CollectionAttempts = Infer<typeof invoicesValidators.collectionAttempts>;
