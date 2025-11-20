// convex/lib/software/yourobc/invoices/utils.ts
// Utility functions for invoices module

import { INVOICE_CONSTANTS } from './constants';
import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  ProcessPaymentInput,
  AddCollectionAttemptInput,
} from './types';

// ============================================================================
// Validation Functions
// ============================================================================

export function validateCreateInvoiceData(data: CreateInvoiceInput): void {
  if (!data.invoiceNumber || data.invoiceNumber.trim().length === 0) {
    throw new Error('Invoice number is required');
  }

  if (data.invoiceNumber.length > INVOICE_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH) {
    throw new Error(
      `Invoice number must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH} characters`
    );
  }

  if (!data.description || data.description.trim().length === 0) {
    throw new Error('Invoice description is required');
  }

  if (data.description.length > INVOICE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    throw new Error(
      `Description must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
    );
  }

  if (!data.type || (data.type !== 'incoming' && data.type !== 'outgoing')) {
    throw new Error('Invalid invoice type. Must be "incoming" or "outgoing"');
  }

  if (!data.issueDate || data.issueDate <= 0) {
    throw new Error('Issue date is required');
  }

  if (!data.dueDate || data.dueDate <= 0) {
    throw new Error('Due date is required');
  }

  if (data.dueDate <= data.issueDate) {
    throw new Error('Due date must be after issue date');
  }

  if (!data.lineItems || data.lineItems.length === 0) {
    throw new Error('At least one line item is required');
  }

  if (data.lineItems.length > INVOICE_CONSTANTS.LIMITS.MAX_LINE_ITEMS) {
    throw new Error(
      `Cannot have more than ${INVOICE_CONSTANTS.LIMITS.MAX_LINE_ITEMS} line items`
    );
  }

  // Validate line items
  for (const item of data.lineItems) {
    if (!item.description || item.description.trim().length === 0) {
      throw new Error('Line item description is required');
    }
    if (item.quantity <= 0) {
      throw new Error('Line item quantity must be greater than 0');
    }
    if (item.unitPrice.amount < 0) {
      throw new Error('Line item unit price cannot be negative');
    }
    if (item.totalPrice.amount < 0) {
      throw new Error('Line item total price cannot be negative');
    }
  }

  if (!data.subtotal || data.subtotal.amount < 0) {
    throw new Error('Subtotal is required and cannot be negative');
  }

  if (!data.totalAmount || data.totalAmount.amount < 0) {
    throw new Error('Total amount is required and cannot be negative');
  }

  if (data.taxRate !== undefined) {
    if (data.taxRate < INVOICE_CONSTANTS.LIMITS.MIN_TAX_RATE) {
      throw new Error(`Tax rate cannot be less than ${INVOICE_CONSTANTS.LIMITS.MIN_TAX_RATE}`);
    }
    if (data.taxRate > INVOICE_CONSTANTS.LIMITS.MAX_TAX_RATE) {
      throw new Error(`Tax rate cannot be greater than ${INVOICE_CONSTANTS.LIMITS.MAX_TAX_RATE}`);
    }
  }

  if (data.paymentTerms !== undefined && data.paymentTerms > INVOICE_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS_DAYS) {
    throw new Error(
      `Payment terms cannot exceed ${INVOICE_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS_DAYS} days`
    );
  }

  if (data.notes && data.notes.length > INVOICE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    throw new Error(
      `Notes must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`
    );
  }
}

export function validateUpdateInvoiceData(data: UpdateInvoiceInput): void {
  if (data.invoiceNumber !== undefined) {
    if (!data.invoiceNumber || data.invoiceNumber.trim().length === 0) {
      throw new Error('Invoice number cannot be empty');
    }
    if (data.invoiceNumber.length > INVOICE_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH) {
      throw new Error(
        `Invoice number must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH} characters`
      );
    }
  }

  if (data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description cannot be empty');
    }
    if (data.description.length > INVOICE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `Description must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  if (data.lineItems !== undefined) {
    if (data.lineItems.length === 0) {
      throw new Error('At least one line item is required');
    }
    if (data.lineItems.length > INVOICE_CONSTANTS.LIMITS.MAX_LINE_ITEMS) {
      throw new Error(
        `Cannot have more than ${INVOICE_CONSTANTS.LIMITS.MAX_LINE_ITEMS} line items`
      );
    }
  }

  if (data.notes !== undefined && data.notes.length > INVOICE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    throw new Error(
      `Notes must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`
    );
  }

  if (data.dueDate !== undefined && data.issueDate !== undefined && data.dueDate <= data.issueDate) {
    throw new Error('Due date must be after issue date');
  }
}

export function validateProcessPaymentData(data: ProcessPaymentInput): void {
  if (!data.paymentMethod) {
    throw new Error('Payment method is required');
  }

  if (!data.paymentDate || data.paymentDate <= 0) {
    throw new Error('Payment date is required');
  }

  if (!data.paidAmount || data.paidAmount.amount < 0) {
    throw new Error('Paid amount is required and cannot be negative');
  }
}

export function validateCollectionAttemptData(data: AddCollectionAttemptInput): void {
  if (!data.method) {
    throw new Error('Collection method is required');
  }

  if (!data.result || data.result.trim().length === 0) {
    throw new Error('Collection result is required');
  }
}

// ============================================================================
// Business Logic Functions
// ============================================================================

/**
 * Generate invoice number based on type and counter
 */
export function generateInvoiceNumber(type: 'incoming' | 'outgoing', counter: number): string {
  const prefix = type === 'outgoing'
    ? INVOICE_CONSTANTS.BUSINESS_RULES.INVOICE_NUMBER_PREFIX.OUTGOING
    : INVOICE_CONSTANTS.BUSINESS_RULES.INVOICE_NUMBER_PREFIX.INCOMING;

  const year = new Date().getFullYear();
  const paddedCounter = counter.toString().padStart(6, '0');

  return `${prefix}-${year}-${paddedCounter}`;
}

/**
 * Calculate days overdue
 */
export function calculateDaysOverdue(dueDate: number): number {
  const now = Date.now();
  if (now <= dueDate) {
    return 0;
  }
  return Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(invoice: { dueDate: number; status: string }): boolean {
  return (
    invoice.status !== INVOICE_CONSTANTS.STATUS.PAID &&
    invoice.status !== INVOICE_CONSTANTS.STATUS.CANCELLED &&
    invoice.dueDate < Date.now()
  );
}

/**
 * Determine appropriate dunning level based on days overdue
 */
export function calculateDunningLevel(daysOverdue: number): number {
  if (daysOverdue < 0) {
    return INVOICE_CONSTANTS.DUNNING_LEVEL.NONE;
  }

  const { DUNNING_ESCALATION_DAYS } = INVOICE_CONSTANTS.BUSINESS_RULES;

  if (daysOverdue >= DUNNING_ESCALATION_DAYS.LEVEL_3) {
    return INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_3;
  } else if (daysOverdue >= DUNNING_ESCALATION_DAYS.LEVEL_2) {
    return INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_2;
  } else if (daysOverdue >= DUNNING_ESCALATION_DAYS.LEVEL_1) {
    return INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_1;
  }

  return INVOICE_CONSTANTS.DUNNING_LEVEL.NONE;
}

/**
 * Calculate dunning fee based on dunning level
 */
export function calculateDunningFee(dunningLevel: number): number {
  const { DUNNING_FEES } = INVOICE_CONSTANTS.BUSINESS_RULES;

  switch (dunningLevel) {
    case INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_1:
      return DUNNING_FEES.LEVEL_1;
    case INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_2:
      return DUNNING_FEES.LEVEL_1 + DUNNING_FEES.LEVEL_2;
    case INVOICE_CONSTANTS.DUNNING_LEVEL.LEVEL_3:
      return DUNNING_FEES.LEVEL_1 + DUNNING_FEES.LEVEL_2 + DUNNING_FEES.LEVEL_3;
    default:
      return 0;
  }
}

/**
 * Calculate total invoice amount including tax
 */
export function calculateTotalAmount(
  subtotal: number,
  taxRate: number = 0
): { totalAmount: number; taxAmount: number } {
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;

  return {
    taxAmount,
    totalAmount,
  };
}

/**
 * Check if payment is complete
 */
export function isPaymentComplete(
  totalAmount: number,
  paidAmount: number | undefined
): boolean {
  if (!paidAmount) return false;
  return paidAmount >= totalAmount;
}

/**
 * Format currency amount for display
 */
export function formatCurrencyAmount(amount: number, currency: 'EUR' | 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Calculate payment days (days between issue and payment)
 */
export function calculatePaymentDays(issueDate: number, paymentDate: number): number {
  return Math.floor((paymentDate - issueDate) / (1000 * 60 * 60 * 24));
}

/**
 * Generate searchable text from invoice data
 */
export function generateSearchableText(invoice: {
  invoiceNumber: string;
  description: string;
  externalInvoiceNumber?: string;
  purchaseOrderNumber?: string;
}): string {
  const parts = [
    invoice.invoiceNumber,
    invoice.description,
    invoice.externalInvoiceNumber,
    invoice.purchaseOrderNumber,
  ].filter(Boolean);

  return parts.join(' ').toLowerCase();
}
