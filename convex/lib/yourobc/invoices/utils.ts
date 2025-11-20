// convex/lib/yourobc/invoices/utils.ts
// convex/yourobc/invoices/utils.ts

import { INVOICE_CONSTANTS, INVOICE_STATUS_COLORS, INVOICE_TYPE_COLORS, OVERDUE_THRESHOLDS } from './constants';
import type { Invoice, CreateInvoiceData, UpdateInvoiceData, LineItem, ProcessPaymentData } from './types';

import {
  isValidEmail,
  isPositiveNumber,
  isFutureDate,
  isPastDate,
  generateSequentialNumber,
  validateAddress,
  validateCurrencyAmount,
  CurrencyAmount,
} from '../shared';

export function validateInvoiceData(data: Partial<CreateInvoiceData | UpdateInvoiceData>): string[] {
  const errors: string[] = [];

  if (data.invoiceNumber && data.invoiceNumber.length > INVOICE_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH) {
    errors.push(`Invoice number must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_INVOICE_NUMBER_LENGTH} characters`);
  }

  if (data.description !== undefined && !data.description.trim()) {
    errors.push('Description is required');
  }

  if (data.description && data.description.length > INVOICE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.notes && data.notes.length > INVOICE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Notes must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  if (data.purchaseOrderNumber && data.purchaseOrderNumber.length > INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH) {
    errors.push(`Purchase order number must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH} characters`);
  }

  if (data.externalInvoiceNumber && data.externalInvoiceNumber.length > INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH) {
    errors.push(`External invoice number must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH} characters`);
  }

  if (data.issueDate !== undefined && !isPastDate(data.issueDate) && !isToday(data.issueDate)) {
    errors.push('Issue date cannot be in the future');
  }

  if (data.dueDate && data.issueDate && data.dueDate <= data.issueDate) {
    errors.push('Due date must be after issue date');
  }

  if (data.paymentTerms !== undefined && (!isPositiveNumber(data.paymentTerms) || data.paymentTerms > 365)) {
    errors.push('Payment terms must be between 1 and 365 days');
  }

  if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 100)) {
    errors.push('Tax rate must be between 0 and 100 percent');
  }

  if (data.subtotal) {
    const subtotalErrors = validateCurrencyAmount(data.subtotal, 'Subtotal');
    errors.push(...subtotalErrors);
  }

  if (data.totalAmount) {
    const totalErrors = validateCurrencyAmount(data.totalAmount, 'Total amount');
    errors.push(...totalErrors);
  }

  if (data.lineItems) {
    const lineItemErrors = validateLineItems(data.lineItems);
    errors.push(...lineItemErrors);
  }

  if (data.billingAddress) {
    const addressErrors = validateAddress(data.billingAddress);
    errors.push(...addressErrors);
  }

  return errors;
}

export function validateLineItems(lineItems: LineItem[]): string[] {
  const errors: string[] = [];

  if (lineItems.length === 0) {
    errors.push('At least one line item is required');
  }

  if (lineItems.length > INVOICE_CONSTANTS.LIMITS.MAX_LINE_ITEMS) {
    errors.push(`Maximum ${INVOICE_CONSTANTS.LIMITS.MAX_LINE_ITEMS} line items allowed`);
  }

  lineItems.forEach((item, index) => {
    if (!item.description.trim()) {
      errors.push(`Line item ${index + 1}: Description is required`);
    }

    if (item.quantity <= 0) {
      errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
    }

    const unitPriceErrors = validateCurrencyAmount(item.unitPrice, `Line item ${index + 1} unit price`);
    errors.push(...unitPriceErrors);

    const totalPriceErrors = validateCurrencyAmount(item.totalPrice, `Line item ${index + 1} total price`);
    errors.push(...totalPriceErrors);

    // Validate that total price matches unit price * quantity
    const expectedTotal = item.unitPrice.amount * item.quantity;
    if (Math.abs(item.totalPrice.amount - expectedTotal) > 0.01) {
      errors.push(`Line item ${index + 1}: Total price does not match unit price × quantity`);
    }

    if (item.unitPrice.currency !== item.totalPrice.currency) {
      errors.push(`Line item ${index + 1}: Unit price and total price must use the same currency`);
    }
  });

  return errors;
}

export function validatePaymentData(data: ProcessPaymentData): string[] {
  const errors: string[] = [];

  if (!isPastDate(data.paymentDate) && !isToday(data.paymentDate)) {
    errors.push('Payment date cannot be in the future');
  }

  const amountErrors = validateCurrencyAmount(data.paidAmount, 'Payment amount');
  errors.push(...amountErrors);

  if (data.paymentReference && data.paymentReference.length > INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH) {
    errors.push(`Payment reference must be less than ${INVOICE_CONSTANTS.LIMITS.MAX_REFERENCE_LENGTH} characters`);
  }

  return errors;
}

export function generateInvoiceNumber(type: 'incoming' | 'outgoing', sequence: number, year?: number): string {
  const prefix = type === 'incoming' ? 'RE' : 'INV'; // RE = Rechnung Eingang (Incoming Invoice)
  const currentYear = year || new Date().getFullYear();
  return `${prefix}${currentYear}${sequence.toString().padStart(4, '0')}`;
}

export function getInvoiceStatusColor(status: Invoice['status']): string {
  return INVOICE_STATUS_COLORS[status] || '#6b7280';
}

export function getInvoiceTypeColor(type: Invoice['type']): string {
  return INVOICE_TYPE_COLORS[type] || '#6b7280';
}

export function calculateDueDate(issueDate: number, paymentTerms: number): number {
  return issueDate + (paymentTerms * 24 * 60 * 60 * 1000);
}

export function calculateTaxAmount(subtotal: CurrencyAmount, taxRate: number): CurrencyAmount {
  return {
    amount: Math.round((subtotal.amount * taxRate / 100) * 100) / 100,
    currency: subtotal.currency,
    exchangeRate: subtotal.exchangeRate,
  };
}

export function calculateTotalAmount(subtotal: CurrencyAmount, taxAmount?: CurrencyAmount): CurrencyAmount {
  return {
    amount: Math.round((subtotal.amount + (taxAmount?.amount || 0)) * 100) / 100,
    currency: subtotal.currency,
    exchangeRate: subtotal.exchangeRate,
  };
}

export function calculateLineItemTotal(unitPrice: CurrencyAmount, quantity: number): CurrencyAmount {
  return {
    amount: Math.round((unitPrice.amount * quantity) * 100) / 100,
    currency: unitPrice.currency,
    exchangeRate: unitPrice.exchangeRate,
  };
}

export function getInvoiceOverdueStatus(invoice: Invoice): {
  isOverdue: boolean;
  daysOverdue: number;
  severity: 'warning' | 'critical' | 'severe' | null;
} {
  const now = Date.now();
  const daysUntilDue = Math.ceil((invoice.dueDate - now) / (1000 * 60 * 60 * 24));
  const daysOverdue = -daysUntilDue;

  let severity: 'warning' | 'critical' | 'severe' | null = null;
  
  if (daysUntilDue <= OVERDUE_THRESHOLDS.WARNING && daysUntilDue > OVERDUE_THRESHOLDS.CRITICAL) {
    severity = 'warning';
  } else if (daysOverdue >= OVERDUE_THRESHOLDS.CRITICAL && daysOverdue < OVERDUE_THRESHOLDS.SEVERELY_OVERDUE) {
    severity = 'critical';
  } else if (daysOverdue >= OVERDUE_THRESHOLDS.SEVERELY_OVERDUE) {
    severity = 'severe';
  }

  return {
    isOverdue: daysOverdue > 0,
    daysOverdue: Math.max(0, daysOverdue),
    severity,
  };
}

export function formatCurrencyAmount(amount: CurrencyAmount): string {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: amount.currency,
  });
  return formatter.format(amount.amount);
}

export function formatInvoiceDisplayName(invoice: Invoice): string {
  return invoice.invoiceNumber || `Invoice ${invoice._id}`;
}

export function sanitizeInvoiceForExport(invoice: Invoice, includeFinancialData = true): Partial<Invoice> {
  const publicData = {
    invoiceNumber: invoice.invoiceNumber,
    externalInvoiceNumber: invoice.externalInvoiceNumber,
    type: invoice.type,
    status: invoice.status,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    description: invoice.description,
    createdAt: invoice.createdAt,
  };

  if (includeFinancialData) {
    return {
      ...publicData,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      taxRate: invoice.taxRate,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      paymentDate: invoice.paymentDate,
      paymentMethod: invoice.paymentMethod,
      lineItems: invoice.lineItems,
    };
  }

  return publicData;
}

export function getNextCollectionAction(attempts: { method: string; date: number }[]): string {
  if (attempts.length === 0) return 'Send email reminder';
  
  const lastAttempt = attempts[attempts.length - 1];
  const daysSinceLastAttempt = Math.floor((Date.now() - lastAttempt.date) / (1000 * 60 * 60 * 24));
  
  if (lastAttempt.method === 'email' && daysSinceLastAttempt >= 7) {
    return 'Make phone call';
  } else if (lastAttempt.method === 'phone' && daysSinceLastAttempt >= 14) {
    return 'Send formal letter';
  } else if (lastAttempt.method === 'letter' && daysSinceLastAttempt >= 14) {
    return 'Send legal notice';
  } else if (lastAttempt.method === 'legal_notice' && daysSinceLastAttempt >= 14) {
    return 'Transfer to debt collection';
  }
  
  return 'Wait before next action';
}

function isToday(timestamp: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return today.getTime() === date.getTime();
}