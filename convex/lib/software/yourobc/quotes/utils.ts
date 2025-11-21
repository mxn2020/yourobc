// convex/lib/software/yourobc/quotes/utils.ts
// Validation functions and utility helpers for quotes module

import { QUOTES_CONSTANTS } from './constants';
import type { CreateQuoteData, UpdateQuoteData, Quote } from './types';

/**
 * Validate quote data for creation/update
 */
export function validateQuoteData(
  data: Partial<CreateQuoteData | UpdateQuoteData>
): string[] {
  const errors: string[] = [];

  // Validate quote number (main display field - required for creation)
  if ('quoteNumber' in data && data.quoteNumber !== undefined) {
    const trimmed = data.quoteNumber.trim();

    if (!trimmed) {
      errors.push('Quote number is required');
    } else if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_NUMBER_LENGTH) {
      errors.push(`Quote number cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_NUMBER_LENGTH} characters`);
    } else if (!QUOTES_CONSTANTS.VALIDATION.QUOTE_NUMBER_PATTERN.test(trimmed)) {
      errors.push('Quote number can only contain uppercase letters, numbers, and hyphens');
    }
  }

  // Validate customer reference
  if (data.customerReference !== undefined && data.customerReference.trim()) {
    const trimmed = data.customerReference.trim();
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH) {
      errors.push(`Customer reference cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined) {
    const trimmed = data.description.trim();
    if (!trimmed && 'description' in data) {
      errors.push('Description is required');
    } else if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate special instructions
  if (data.specialInstructions !== undefined && data.specialInstructions.trim()) {
    const trimmed = data.specialInstructions.trim();
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH) {
      errors.push(`Special instructions cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH} characters`);
    }
  }

  // Validate quote text
  if (data.quoteText !== undefined && data.quoteText.trim()) {
    const trimmed = data.quoteText.trim();
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_TEXT_LENGTH) {
      errors.push(`Quote text cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_TEXT_LENGTH} characters`);
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate rejection reason
  if (data.rejectionReason !== undefined && data.rejectionReason.trim()) {
    const trimmed = data.rejectionReason.trim();
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_REJECTION_REASON_LENGTH) {
      errors.push(`Rejection reason cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_REJECTION_REASON_LENGTH} characters`);
    }
  }

  // Validate incoterms
  if (data.incoterms !== undefined && data.incoterms.trim()) {
    const trimmed = data.incoterms.trim();
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_INCOTERMS_LENGTH) {
      errors.push(`Incoterms cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_INCOTERMS_LENGTH} characters`);
    }
    if (!QUOTES_CONSTANTS.VALIDATION.INCOTERMS_PATTERN.test(trimmed)) {
      errors.push('Incoterms must be exactly 3 uppercase letters (e.g., FOB, CIF, EXW)');
    }
  }

  // Validate validity period
  if (data.deadline !== undefined && data.validUntil !== undefined) {
    const validityPeriodDays = Math.floor((data.validUntil - data.deadline) / (1000 * 60 * 60 * 24));
    if (validityPeriodDays < QUOTES_CONSTANTS.LIMITS.MIN_VALIDITY_PERIOD_DAYS) {
      errors.push(`Validity period must be at least ${QUOTES_CONSTANTS.LIMITS.MIN_VALIDITY_PERIOD_DAYS} day(s)`);
    }
    if (validityPeriodDays > QUOTES_CONSTANTS.LIMITS.MAX_VALIDITY_PERIOD_DAYS) {
      errors.push(`Validity period cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_VALIDITY_PERIOD_DAYS} days`);
    }
  }

  // Validate markup percentage
  if (data.markup !== undefined) {
    if (data.markup < QUOTES_CONSTANTS.LIMITS.MIN_MARKUP_PERCENTAGE) {
      errors.push(`Markup percentage cannot be less than ${QUOTES_CONSTANTS.LIMITS.MIN_MARKUP_PERCENTAGE}%`);
    }
    if (data.markup > QUOTES_CONSTANTS.LIMITS.MAX_MARKUP_PERCENTAGE) {
      errors.push(`Markup percentage cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_MARKUP_PERCENTAGE}%`);
    }
  }

  // Validate partner quotes
  if ('partnerQuotes' in data && data.partnerQuotes) {
    if (data.partnerQuotes.length > QUOTES_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES) {
      errors.push(`Cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES} partner quotes`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > QUOTES_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  // Validate dimensions
  if ('dimensions' in data && data.dimensions) {
    if (data.dimensions.length <= 0 || data.dimensions.width <= 0 || data.dimensions.height <= 0) {
      errors.push('Dimensions must be positive values');
    }
    if (data.dimensions.weight <= 0) {
      errors.push('Weight must be a positive value');
    }
  }

  // Validate pricing consistency
  if (data.baseCost && data.totalPrice && data.markup !== undefined) {
    const expectedTotal = data.baseCost.amount * (1 + data.markup / 100);
    const actualTotal = data.totalPrice.amount;
    const tolerance = 0.01; // 1 cent tolerance for rounding
    if (Math.abs(expectedTotal - actualTotal) > tolerance) {
      errors.push('Total price does not match base cost and markup calculation');
    }
  }

  return errors;
}

/**
 * Format quote display name
 */
export function formatQuoteDisplayName(quote: { quoteNumber: string; status?: string }): string {
  const statusBadge = quote.status ? ` [${quote.status.toUpperCase()}]` : '';
  return `${quote.quoteNumber}${statusBadge}`;
}

/**
 * Calculate total price from base cost and markup
 */
export function calculateTotalPrice(baseCost: number, markup: number): number {
  return baseCost * (1 + markup / 100);
}

/**
 * Calculate validity period in days
 */
export function calculateValidityPeriodDays(deadline: number, validUntil: number): number {
  return Math.floor((validUntil - deadline) / (1000 * 60 * 60 * 24));
}

/**
 * Check if quote is editable
 */
export function isQuoteEditable(quote: { status: string; deletedAt?: number }): boolean {
  if (quote.deletedAt) return false;
  return quote.status === 'draft' || quote.status === 'sent';
}

/**
 * Check if quote is expired
 */
export function isQuoteExpired(quote: { validUntil: number; status: string }): boolean {
  if (quote.status === 'accepted' || quote.status === 'rejected' || quote.status === 'expired') {
    return false; // Already finalized
  }
  return Date.now() > quote.validUntil;
}

/**
 * Check if quote can be sent
 */
export function canSendQuote(quote: Quote): boolean {
  if (quote.deletedAt) return false;
  if (quote.status !== 'draft') return false;
  if (!quote.totalPrice || quote.totalPrice.amount <= 0) return false;
  return true;
}

/**
 * Check if quote can be accepted
 */
export function canAcceptQuote(quote: Quote): boolean {
  if (quote.deletedAt) return false;
  if (quote.status !== 'sent' && quote.status !== 'pending') return false;
  if (isQuoteExpired(quote)) return false;
  return true;
}

/**
 * Check if quote can be rejected
 */
export function canRejectQuote(quote: Quote): boolean {
  if (quote.deletedAt) return false;
  if (quote.status !== 'sent' && quote.status !== 'pending') return false;
  return true;
}

/**
 * Check if quote can be converted to shipment
 */
export function canConvertToShipment(quote: Quote): boolean {
  if (quote.deletedAt) return false;
  if (quote.status !== 'accepted') return false;
  if (quote.convertedToShipmentId) return false;
  return true;
}

/**
 * Trim all string fields in quote data
 */
export function trimQuoteData<T extends Partial<CreateQuoteData | UpdateQuoteData>>(data: T): T {
  const trimmed = { ...data };

  if (trimmed.quoteNumber) trimmed.quoteNumber = trimmed.quoteNumber.trim();
  if (trimmed.customerReference) trimmed.customerReference = trimmed.customerReference.trim();
  if (trimmed.description) trimmed.description = trimmed.description.trim();
  if (trimmed.specialInstructions) trimmed.specialInstructions = trimmed.specialInstructions.trim();
  if (trimmed.quoteText) trimmed.quoteText = trimmed.quoteText.trim();
  if (trimmed.notes) trimmed.notes = trimmed.notes.trim();
  if (trimmed.rejectionReason) trimmed.rejectionReason = trimmed.rejectionReason.trim();
  if (trimmed.incoterms) trimmed.incoterms = trimmed.incoterms.trim().toUpperCase();
  if (trimmed.tags) trimmed.tags = trimmed.tags.map(tag => tag.trim());

  return trimmed;
}
