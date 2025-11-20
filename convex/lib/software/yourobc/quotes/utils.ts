// convex/lib/software/yourobc/quotes/utils.ts
/**
 * Quote Utilities
 *
 * Validation functions and utility helpers for quote management.
 *
 * @module convex/lib/software/yourobc/quotes/utils
 */

import { QUOTES_CONSTANTS } from './constants'
import type { CreateQuoteData, UpdateQuoteData, Quote } from './types'

/**
 * Validate quote data for creation/update
 */
export function validateQuoteData(
  data: Partial<CreateQuoteData | UpdateQuoteData>
): string[] {
  const errors: string[] = []

  // Validate quote number
  if (data.quoteNumber !== undefined) {
    const trimmed = data.quoteNumber.trim()

    if (!trimmed) {
      errors.push('Quote number is required')
    } else if (trimmed.length < QUOTES_CONSTANTS.LIMITS.MIN_QUOTE_NUMBER_LENGTH) {
      errors.push(
        `Quote number must be at least ${QUOTES_CONSTANTS.LIMITS.MIN_QUOTE_NUMBER_LENGTH} characters`
      )
    } else if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_NUMBER_LENGTH) {
      errors.push(
        `Quote number cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_NUMBER_LENGTH} characters`
      )
    } else if (!QUOTES_CONSTANTS.VALIDATION.QUOTE_NUMBER_PATTERN.test(trimmed)) {
      errors.push('Quote number can only contain uppercase letters, numbers, and hyphens')
    }
  }

  // Validate customer reference
  if (data.customerReference !== undefined && data.customerReference.trim()) {
    const trimmed = data.customerReference.trim()
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH) {
      errors.push(
        `Customer reference cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH} characters`
      )
    }
  }

  // Validate description
  if (data.description !== undefined) {
    const trimmed = data.description.trim()
    if (!trimmed) {
      errors.push('Description is required')
    } else if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      )
    }
  }

  // Validate special instructions
  if (data.specialInstructions !== undefined && data.specialInstructions.trim()) {
    const trimmed = data.specialInstructions.trim()
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH) {
      errors.push(
        `Special instructions cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH} characters`
      )
    }
  }

  // Validate quote text
  if (data.quoteText !== undefined && data.quoteText.trim()) {
    const trimmed = data.quoteText.trim()
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_TEXT_LENGTH) {
      errors.push(
        `Quote text cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_QUOTE_TEXT_LENGTH} characters`
      )
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim()
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`)
    }
  }

  // Validate rejection reason
  if ('rejectionReason' in data && data.rejectionReason && data.rejectionReason.trim()) {
    const trimmed = data.rejectionReason.trim()
    if (trimmed.length > QUOTES_CONSTANTS.LIMITS.MAX_REJECTION_REASON_LENGTH) {
      errors.push(
        `Rejection reason cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_REJECTION_REASON_LENGTH} characters`
      )
    }
  }

  // Validate incoterms
  if (data.incoterms !== undefined && data.incoterms.trim()) {
    const trimmed = data.incoterms.trim()
    if (!QUOTES_CONSTANTS.VALIDATION.INCOTERMS_PATTERN.test(trimmed)) {
      errors.push('Incoterms must be a 3-letter uppercase code (e.g., FOB, CIF, EXW)')
    }
  }

  // Validate dimensions
  if (data.dimensions) {
    const { length, width, height, weight } = data.dimensions

    if (
      length < QUOTES_CONSTANTS.LIMITS.MIN_DIMENSION ||
      length > QUOTES_CONSTANTS.LIMITS.MAX_DIMENSION
    ) {
      errors.push(
        `Length must be between ${QUOTES_CONSTANTS.LIMITS.MIN_DIMENSION} and ${QUOTES_CONSTANTS.LIMITS.MAX_DIMENSION}`
      )
    }

    if (
      width < QUOTES_CONSTANTS.LIMITS.MIN_DIMENSION ||
      width > QUOTES_CONSTANTS.LIMITS.MAX_DIMENSION
    ) {
      errors.push(
        `Width must be between ${QUOTES_CONSTANTS.LIMITS.MIN_DIMENSION} and ${QUOTES_CONSTANTS.LIMITS.MAX_DIMENSION}`
      )
    }

    if (
      height < QUOTES_CONSTANTS.LIMITS.MIN_DIMENSION ||
      height > QUOTES_CONSTANTS.LIMITS.MAX_DIMENSION
    ) {
      errors.push(
        `Height must be between ${QUOTES_CONSTANTS.LIMITS.MIN_DIMENSION} and ${QUOTES_CONSTANTS.LIMITS.MAX_DIMENSION}`
      )
    }

    if (
      weight < QUOTES_CONSTANTS.LIMITS.MIN_WEIGHT ||
      weight > QUOTES_CONSTANTS.LIMITS.MAX_WEIGHT
    ) {
      errors.push(
        `Weight must be between ${QUOTES_CONSTANTS.LIMITS.MIN_WEIGHT} and ${QUOTES_CONSTANTS.LIMITS.MAX_WEIGHT}`
      )
    }
  }

  // Validate pricing
  if (data.baseCost) {
    if (
      data.baseCost.amount < QUOTES_CONSTANTS.LIMITS.MIN_PRICE ||
      data.baseCost.amount > QUOTES_CONSTANTS.LIMITS.MAX_PRICE
    ) {
      errors.push(
        `Base cost must be between ${QUOTES_CONSTANTS.LIMITS.MIN_PRICE} and ${QUOTES_CONSTANTS.LIMITS.MAX_PRICE}`
      )
    }
  }

  if (data.totalPrice) {
    if (
      data.totalPrice.amount < QUOTES_CONSTANTS.LIMITS.MIN_PRICE ||
      data.totalPrice.amount > QUOTES_CONSTANTS.LIMITS.MAX_PRICE
    ) {
      errors.push(
        `Total price must be between ${QUOTES_CONSTANTS.LIMITS.MIN_PRICE} and ${QUOTES_CONSTANTS.LIMITS.MAX_PRICE}`
      )
    }
  }

  if (data.markup !== undefined) {
    if (
      data.markup < QUOTES_CONSTANTS.LIMITS.MIN_MARKUP ||
      data.markup > QUOTES_CONSTANTS.LIMITS.MAX_MARKUP
    ) {
      errors.push(
        `Markup must be between ${QUOTES_CONSTANTS.LIMITS.MIN_MARKUP}% and ${QUOTES_CONSTANTS.LIMITS.MAX_MARKUP}%`
      )
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > QUOTES_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_TAGS} tags`)
    }

    const emptyTags = data.tags.filter((tag) => !tag.trim())
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty')
    }
  }

  // Validate partner quotes
  if ('partnerQuotes' in data && data.partnerQuotes) {
    if (data.partnerQuotes.length > QUOTES_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES) {
      errors.push(`Cannot exceed ${QUOTES_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES} partner quotes`)
    }
  }

  // Validate timeline
  if ('deadline' in data && 'validUntil' in data && data.deadline && data.validUntil) {
    if (data.validUntil <= data.deadline) {
      errors.push('Valid until date must be after the deadline')
    }
  }

  return errors
}

/**
 * Format quote display name
 */
export function formatQuoteDisplayName(quote: { quoteNumber: string; status?: string }): string {
  const statusBadge = quote.status ? ` [${quote.status}]` : ''
  return `${quote.quoteNumber}${statusBadge}`
}

/**
 * Check if quote is editable
 */
export function isQuoteEditable(quote: { status: string; deletedAt?: number }): boolean {
  if (quote.deletedAt) return false
  return (
    quote.status !== QUOTES_CONSTANTS.STATUS.ACCEPTED &&
    quote.status !== QUOTES_CONSTANTS.STATUS.REJECTED &&
    quote.status !== QUOTES_CONSTANTS.STATUS.EXPIRED
  )
}

/**
 * Check if quote is expired
 */
export function isQuoteExpired(quote: { validUntil: number; status: string }): boolean {
  const now = Date.now()
  return (
    quote.validUntil < now && quote.status !== QUOTES_CONSTANTS.STATUS.ACCEPTED
  )
}

/**
 * Check if quote is expiring soon
 */
export function isQuoteExpiringSoon(quote: { validUntil: number; status: string }): boolean {
  const now = Date.now()
  const warningThreshold = now + QUOTES_CONSTANTS.EXPIRATION_WARNING_MS
  return (
    quote.validUntil > now &&
    quote.validUntil <= warningThreshold &&
    quote.status !== QUOTES_CONSTANTS.STATUS.ACCEPTED &&
    quote.status !== QUOTES_CONSTANTS.STATUS.REJECTED
  )
}

/**
 * Calculate quote validity period
 */
export function calculateValidUntil(deadline: number, validityDays?: number): number {
  const days = validityDays || QUOTES_CONSTANTS.DEFAULT_VALIDITY_DAYS
  return deadline + days * 24 * 60 * 60 * 1000
}

/**
 * Calculate total price from base cost and markup
 */
export function calculateTotalPrice(
  baseCost: number,
  markup: number,
  currency: 'EUR' | 'USD'
): { amount: number; currency: 'EUR' | 'USD' } {
  const totalAmount = baseCost * (1 + markup / 100)
  return {
    amount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
    currency,
  }
}

/**
 * Format currency amount for display
 */
export function formatCurrencyAmount(amount: number, currency: 'EUR' | 'USD'): string {
  const symbol = currency === 'EUR' ? '€' : '$'
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Check if quote can be converted to shipment
 */
export function canConvertToShipment(quote: Quote): boolean {
  return (
    quote.status === QUOTES_CONSTANTS.STATUS.ACCEPTED &&
    !quote.deletedAt &&
    !quote.convertedToShipmentId
  )
}

/**
 * Check if quote can be sent
 */
export function canSendQuote(quote: Quote): boolean {
  return (
    (quote.status === QUOTES_CONSTANTS.STATUS.DRAFT ||
      quote.status === QUOTES_CONSTANTS.STATUS.PENDING) &&
    !quote.deletedAt &&
    !!quote.totalPrice
  )
}

/**
 * Check if quote can be accepted
 */
export function canAcceptQuote(quote: Quote): boolean {
  return (
    (quote.status === QUOTES_CONSTANTS.STATUS.SENT ||
      quote.status === QUOTES_CONSTANTS.STATUS.PENDING) &&
    !quote.deletedAt &&
    !isQuoteExpired(quote)
  )
}

/**
 * Check if quote can be rejected
 */
export function canRejectQuote(quote: Quote): boolean {
  return (
    (quote.status === QUOTES_CONSTANTS.STATUS.SENT ||
      quote.status === QUOTES_CONSTANTS.STATUS.PENDING) &&
    !quote.deletedAt
  )
}
