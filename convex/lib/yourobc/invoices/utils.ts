// convex/lib/yourobc/invoices/utils.ts
// Validation functions and utility helpers for invoices module

import { INVOICES_CONSTANTS } from './constants';
import type {
  CreateInvoiceData,
  UpdateInvoiceData,
  ProcessPaymentData,
  LineItem,
  CurrencyAmount,
  Invoice,
} from './types';

/**
 * Validate invoice data for creation/update
 */
export function validateInvoiceData(
  data: Partial<CreateInvoiceData | UpdateInvoiceData>
): string[] {
  const errors: string[] = [];

  // Validate invoice number
  if (data.invoiceNumber !== undefined) {
    const trimmed = data.invoiceNumber.trim();

    if (!trimmed) {
      errors.push('Invoice number is required');
    } else if (trimmed.length < INVOICES_CONSTANTS.LIMITS.MIN_INVOICE_NUMBER_LENGTH) {
      errors.push(
        `Invoice number must be at least ${INVOICES_CONSTANTS.LIMITS.MIN_INVOICE_NUMBER_LENGTH} characters`
      );
    } else if (trimmed.length > INVOICES_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH) {
      errors.push(
        `Invoice number cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH} characters`
      );
    } else if (!INVOICES_CONSTANTS.VALIDATION.INVOICE_NUMBER_PATTERN.test(trimmed)) {
      errors.push('Invoice number can only contain uppercase letters, numbers, and hyphens');
    }
  }

  // Validate description
  if (data.description !== undefined) {
    const trimmed = data.description.trim();
    if (!trimmed) {
      errors.push('Description is required');
    } else if (trimmed.length > INVOICES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > INVOICES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate line items
  if (data.lineItems !== undefined) {
    if (data.lineItems.length < INVOICES_CONSTANTS.LIMITS.MIN_LINE_ITEMS) {
      errors.push(`Invoice must have at least ${INVOICES_CONSTANTS.LIMITS.MIN_LINE_ITEMS} line item`);
    } else if (data.lineItems.length > INVOICES_CONSTANTS.LIMITS.MAX_LINE_ITEMS) {
      errors.push(`Invoice cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_LINE_ITEMS} line items`);
    }

    // Validate each line item
    data.lineItems.forEach((item, index) => {
      const lineErrors = validateLineItem(item);
      lineErrors.forEach((error) => errors.push(`Line item ${index + 1}: ${error}`));
    });
  }

  // Validate payment terms
  if (data.paymentTerms !== undefined) {
    if (data.paymentTerms < INVOICES_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS_DAYS) {
      errors.push(
        `Payment terms cannot be less than ${INVOICES_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS_DAYS} days`
      );
    } else if (data.paymentTerms > INVOICES_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS_DAYS) {
      errors.push(
        `Payment terms cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS_DAYS} days`
      );
    }
  }

  // Validate tax rate
  if (data.taxRate !== undefined) {
    if (data.taxRate < INVOICES_CONSTANTS.LIMITS.MIN_TAX_RATE) {
      errors.push(`Tax rate cannot be less than ${INVOICES_CONSTANTS.LIMITS.MIN_TAX_RATE}%`);
    } else if (data.taxRate > INVOICES_CONSTANTS.LIMITS.MAX_TAX_RATE) {
      errors.push(`Tax rate cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_TAX_RATE}%`);
    }
  }

  // Validate amounts
  if (data.subtotal !== undefined) {
    const amountErrors = validateCurrencyAmount(data.subtotal, 'Subtotal');
    errors.push(...amountErrors);
  }

  if (data.totalAmount !== undefined) {
    const amountErrors = validateCurrencyAmount(data.totalAmount, 'Total amount');
    errors.push(...amountErrors);
  }

  if (data.taxAmount !== undefined) {
    const amountErrors = validateCurrencyAmount(data.taxAmount, 'Tax amount');
    errors.push(...amountErrors);
  }

  // Validate dates
  if ('issueDate' in data && 'dueDate' in data) {
    if (data.issueDate && data.dueDate && data.dueDate < data.issueDate) {
      errors.push('Due date cannot be before issue date');
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    const emptyTags = data.tags.filter((tag) => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

/**
 * Validate line item
 */
export function validateLineItem(item: LineItem): string[] {
  const errors: string[] = [];

  if (!item.description || !item.description.trim()) {
    errors.push('Description is required');
  }

  if (item.quantity <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (item.unitPrice.amount < 0) {
    errors.push('Unit price cannot be negative');
  }

  if (item.totalPrice.amount < 0) {
    errors.push('Total price cannot be negative');
  }

  // Validate calculation
  const calculatedTotal = item.quantity * item.unitPrice.amount;
  if (Math.abs(calculatedTotal - item.totalPrice.amount) > 0.01) {
    errors.push('Total price does not match quantity × unit price');
  }

  return errors;
}

/**
 * Validate currency amount
 */
export function validateCurrencyAmount(amount: CurrencyAmount, fieldName: string): string[] {
  const errors: string[] = [];

  if (amount.amount < 0) {
    errors.push(`${fieldName} cannot be negative`);
  }

  if (!['EUR', 'USD'].includes(amount.currency)) {
    errors.push(`${fieldName} has invalid currency (must be EUR or USD)`);
  }

  if (amount.exchangeRate !== undefined && amount.exchangeRate <= 0) {
    errors.push(`${fieldName} exchange rate must be greater than 0`);
  }

  return errors;
}

/**
 * Validate payment data
 */
export function validatePaymentData(data: ProcessPaymentData): string[] {
  const errors: string[] = [];

  if (!data.paymentMethod) {
    errors.push('Payment method is required');
  }

  if (!data.paymentDate) {
    errors.push('Payment date is required');
  }

  if (!data.paidAmount) {
    errors.push('Paid amount is required');
  } else {
    const amountErrors = validateCurrencyAmount(data.paidAmount, 'Paid amount');
    errors.push(...amountErrors);

    if (data.paidAmount.amount === 0) {
      errors.push('Paid amount must be greater than 0');
    }
  }

  if (data.notes && data.notes.trim().length > INVOICES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Payment notes cannot exceed ${INVOICES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  return errors;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(data: {
  lineItems: LineItem[];
  taxRate?: number;
  currency: 'EUR' | 'USD';
}): {
  subtotal: CurrencyAmount;
  taxAmount: CurrencyAmount;
  totalAmount: CurrencyAmount;
} {
  const subtotalAmount = data.lineItems.reduce((sum, item) => sum + item.totalPrice.amount, 0);

  const taxRate = data.taxRate || 0;
  const taxAmountValue = (subtotalAmount * taxRate) / 100;
  const totalAmountValue = subtotalAmount + taxAmountValue;

  return {
    subtotal: {
      amount: Number(subtotalAmount.toFixed(2)),
      currency: data.currency,
    },
    taxAmount: {
      amount: Number(taxAmountValue.toFixed(2)),
      currency: data.currency,
    },
    totalAmount: {
      amount: Number(totalAmountValue.toFixed(2)),
      currency: data.currency,
    },
  };
}

/**
 * Format invoice display name
 */
export function formatInvoiceDisplayName(invoice: {
  invoiceNumber: string;
  status?: string;
  totalAmount?: CurrencyAmount;
}): string {
  const statusBadge = invoice.status ? ` [${invoice.status}]` : '';
  const amountBadge = invoice.totalAmount
    ? ` - ${invoice.totalAmount.currency} ${invoice.totalAmount.amount.toFixed(2)}`
    : '';
  return `${invoice.invoiceNumber}${statusBadge}${amountBadge}`;
}

/**
 * Check if invoice is editable
 */
export function isInvoiceEditable(invoice: { status: string; deletedAt?: number }): boolean {
  if (invoice.deletedAt) return false;
  return invoice.status !== INVOICES_CONSTANTS.STATUS.PAID && invoice.status !== INVOICES_CONSTANTS.STATUS.CANCELLED;
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(invoice: { dueDate: number; status: string }): boolean {
  const now = Date.now();
  return (
    invoice.dueDate < now &&
    invoice.status !== INVOICES_CONSTANTS.STATUS.PAID &&
    invoice.status !== INVOICES_CONSTANTS.STATUS.CANCELLED
  );
}

/**
 * Calculate days until due
 */
export function calculateDaysUntilDue(dueDate: number): number {
  const now = Date.now();
  const diff = dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days overdue
 */
export function calculateDaysOverdue(dueDate: number): number {
  const now = Date.now();
  const diff = now - dueDate;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Get dunning level label
 */
export function getDunningLevelLabel(level: number): string {
  return INVOICES_CONSTANTS.DUNNING.LEVEL_LABELS[level as keyof typeof INVOICES_CONSTANTS.DUNNING.LEVEL_LABELS] || 'Unknown';
}

/**
 * Calculate next dunning level
 */
export function getNextDunningLevel(currentLevel: number): number {
  return Math.min(currentLevel + 1, INVOICES_CONSTANTS.LIMITS.MAX_DUNNING_LEVEL);
}

/**
 * Get dunning fee for level
 */
export function getDunningFee(level: number): number {
  return INVOICES_CONSTANTS.DUNNING.DEFAULT_FEES[level as keyof typeof INVOICES_CONSTANTS.DUNNING.DEFAULT_FEES] || 0;
}

/**
 * Format currency amount
 */
export function formatCurrencyAmount(amount: CurrencyAmount): string {
  return `${amount.currency} ${amount.amount.toFixed(2)}`;
}

/**
 * Trim all string fields in invoice data
 */
export function trimInvoiceData<T extends Partial<CreateInvoiceData | UpdateInvoiceData>>(data: T): T {
  const trimmed = { ...data };

  if (trimmed.invoiceNumber) {
    trimmed.invoiceNumber = trimmed.invoiceNumber.trim();
  }
  if (trimmed.externalInvoiceNumber) {
    trimmed.externalInvoiceNumber = trimmed.externalInvoiceNumber.trim();
  }
  if (trimmed.description) {
    trimmed.description = trimmed.description.trim();
  }
  if (trimmed.notes) {
    trimmed.notes = trimmed.notes.trim();
  }
  if (trimmed.purchaseOrderNumber) {
    trimmed.purchaseOrderNumber = trimmed.purchaseOrderNumber.trim();
  }
  if (trimmed.tags) {
    trimmed.tags = trimmed.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  }
  if (trimmed.lineItems) {
    trimmed.lineItems = trimmed.lineItems.map((item) => ({
      ...item,
      description: item.description.trim(),
    }));
  }

  return trimmed;
}
