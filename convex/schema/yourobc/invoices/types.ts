// convex/schema/yourobc/invoices/types.ts
// Type extractions from validators for invoices module

import { Infer } from 'convex/values';
import { invoicesValidators, invoicesFields } from './validators';
import { baseValidators } from '@/schema/base.validators';

// Extract types from validators (enums)
export type InvoiceStatus = Infer<typeof invoicesValidators.status>;
export type InvoiceType = Infer<typeof invoicesValidators.type>;
export type InvoiceCollectionMethod = Infer<typeof invoicesValidators.collectionMethod>;
export type InvoiceCurrency = Infer<typeof invoicesValidators.currency>;

// Import from base validators
export type PaymentMethod = Infer<typeof baseValidators.paymentMethod>;

// Extract types from fields (complex objects)
export type InvoiceCurrencyAmount = Infer<typeof invoicesFields.currencyAmount>;
export type InvoiceAddress = Infer<typeof invoicesFields.address>;
export type InvoiceLineItem = Infer<typeof invoicesFields.lineItem>;
export type InvoiceCollectionAttempt = Infer<typeof invoicesFields.collectionAttempt>;

