// convex/lib/yourobc/quotes/utils.ts
// convex/yourobc/quotes/utils.ts

import { QUOTE_CONSTANTS, QUOTE_STATUS_COLORS, PRIORITY_COLORS, SERVICE_TYPE_LABELS, PRIORITY_LABELS } from './constants';
import type { Quote, CreateQuoteData, UpdateQuoteData, Dimensions, CurrencyAmount, PartnerQuote } from './types';

import {
  isValidEmail,
  isValidPhone,
  generateSequentialNumber,
  validateAddress,
  validateDimensions,
} from '../shared';

export function validateQuoteData(data: Partial<CreateQuoteData | UpdateQuoteData>): string[] {
  const errors: string[] = [];

  if (data.customerReference && data.customerReference.length > QUOTE_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH) {
    errors.push(`Customer reference must be less than ${QUOTE_CONSTANTS.LIMITS.MAX_CUSTOMER_REFERENCE_LENGTH} characters`);
  }

  if (data.description !== undefined && !data.description.trim()) {
    errors.push('Description is required');
  }

  if (data.description && data.description.length > QUOTE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${QUOTE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.specialInstructions && data.specialInstructions.length > QUOTE_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH) {
    errors.push(`Special instructions must be less than ${QUOTE_CONSTANTS.LIMITS.MAX_SPECIAL_INSTRUCTIONS_LENGTH} characters`);
  }

  if (data.quoteText && data.quoteText.length > QUOTE_CONSTANTS.LIMITS.MAX_QUOTE_TEXT_LENGTH) {
    errors.push(`Quote text must be less than ${QUOTE_CONSTANTS.LIMITS.MAX_QUOTE_TEXT_LENGTH} characters`);
  }

  if (data.notes && data.notes.length > QUOTE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Notes must be less than ${QUOTE_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  if (data.rejectionReason && data.rejectionReason.length > QUOTE_CONSTANTS.LIMITS.MAX_REJECTION_REASON_LENGTH) {
    errors.push(`Rejection reason must be less than ${QUOTE_CONSTANTS.LIMITS.MAX_REJECTION_REASON_LENGTH} characters`);
  }

  if (data.deadline !== undefined && data.deadline <= Date.now()) {
    errors.push('Deadline must be in the future');
  }

  if (data.validUntil !== undefined && data.validUntil <= Date.now()) {
    errors.push('Valid until date must be in the future');
  }

  if (data.dimensions) {
    const dimensionErrors = validateDimensions(data.dimensions);
    errors.push(...dimensionErrors);
  }

  if (data.origin) {
    const originErrors = validateAddress(data.origin, 'Origin');
    errors.push(...originErrors);
  }

  if (data.destination) {
    const destinationErrors = validateAddress(data.destination, 'Destination');
    errors.push(...destinationErrors);
  }

  if (data.baseCost) {
    const costErrors = validateCurrencyAmount(data.baseCost, 'Base cost');
    errors.push(...costErrors);
  }

  if (data.totalPrice) {
    const priceErrors = validateCurrencyAmount(data.totalPrice, 'Total price');
    errors.push(...priceErrors);
  }

  if (data.markup !== undefined) {
    if (data.markup < QUOTE_CONSTANTS.LIMITS.MIN_MARKUP || data.markup > QUOTE_CONSTANTS.LIMITS.MAX_MARKUP) {
      errors.push(`Markup must be between ${QUOTE_CONSTANTS.LIMITS.MIN_MARKUP}% and ${QUOTE_CONSTANTS.LIMITS.MAX_MARKUP}%`);
    }
  }

  if (data.partnerQuotes && data.partnerQuotes.length > QUOTE_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES) {
    errors.push(`Maximum ${QUOTE_CONSTANTS.LIMITS.MAX_PARTNER_QUOTES} partner quotes allowed`);
  }

  return errors;
}

export function validateCurrencyAmount(amount: Partial<CurrencyAmount>, fieldName: string): string[] {
  const errors: string[] = [];

  if (amount.amount !== undefined && (amount.amount < QUOTE_CONSTANTS.LIMITS.MIN_PRICE || amount.amount > QUOTE_CONSTANTS.LIMITS.MAX_PRICE)) {
    errors.push(`${fieldName} must be between ${QUOTE_CONSTANTS.LIMITS.MIN_PRICE} and ${QUOTE_CONSTANTS.LIMITS.MAX_PRICE}`);
  }

  return errors;
}

export function generateQuoteNumber(sequence: number): string {
  const year = new Date().getFullYear().toString().slice(-2);
  return generateSequentialNumber(`QT${year}`, sequence);
}

export function getQuoteStatusColor(status: Quote['status']): string {
  return QUOTE_STATUS_COLORS[status] || '#6b7280';
}

export function getPriorityColor(priority: Quote['priority']): string {
  return PRIORITY_COLORS[priority] || '#10b981';
}

export function getServiceTypeLabel(serviceType: Quote['serviceType']): string {
  return SERVICE_TYPE_LABELS[serviceType] || serviceType;
}

export function getPriorityLabel(priority: Quote['priority']): string {
  return PRIORITY_LABELS[priority] || priority;
}

export function calculateTotalPrice(baseCost: CurrencyAmount, markup: number): CurrencyAmount {
  const markupAmount = baseCost.amount * (markup / 100);
  const totalAmount = baseCost.amount + markupAmount;

  return {
    amount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
    currency: baseCost.currency,
    exchangeRate: baseCost.exchangeRate,
  };
}

export function calculateChargeableWeight(dimensions: Dimensions): number {
  const { length, width, height, weight, unit, weightUnit } = dimensions;
  
  // Convert dimensions to cm if needed
  const lengthCm = unit === 'inch' ? length * 2.54 : length;
  const widthCm = unit === 'inch' ? width * 2.54 : width;
  const heightCm = unit === 'inch' ? height * 2.54 : height;
  
  // Convert weight to kg if needed
  const weightKg = weightUnit === 'lb' ? weight * 0.453592 : weight;
  
  // Calculate volumetric weight (standard aviation formula: L×W×H / 6000)
  const volumetricWeight = (lengthCm * widthCm * heightCm) / 6000;
  
  // Chargeable weight is the higher of actual weight and volumetric weight
  return Math.max(weightKg, volumetricWeight);
}

export function isQuoteExpiring(quote: Quote, daysThreshold: number = 2): boolean {
  const now = Date.now();
  const thresholdTime = now + (daysThreshold * 24 * 60 * 60 * 1000);
  
  return quote.status === QUOTE_CONSTANTS.STATUS.SENT && 
         quote.validUntil <= thresholdTime && 
         quote.validUntil > now;
}

export function isQuoteExpired(quote: Quote): boolean {
  return quote.validUntil <= Date.now();
}

export function canConvertToShipment(quote: Quote): boolean {
  return quote.status === QUOTE_CONSTANTS.STATUS.ACCEPTED && 
         !quote.convertedToShipmentId &&
         quote.totalPrice !== undefined;
}

export function getQuoteRoute(quote: Quote): string {
  return `${quote.origin.city}, ${quote.origin.countryCode} → ${quote.destination.city}, ${quote.destination.countryCode}`;
}

export function getQuoteTimeRemaining(quote: Quote): {
  timeRemaining: number;
  status: 'valid' | 'expiring' | 'expired';
  label: string;
} {
  const now = Date.now();
  const timeRemaining = quote.validUntil - now;
  
  if (timeRemaining <= 0) {
    return {
      timeRemaining: 0,
      status: 'expired',
      label: 'Expired',
    };
  }
  
  const days = Math.floor(timeRemaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((timeRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  const status = days <= 2 ? 'expiring' : 'valid';
  const label = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  
  return {
    timeRemaining,
    status,
    label,
  };
}

export function getBestPartnerQuote(partnerQuotes: PartnerQuote[]): PartnerQuote | null {
  if (!partnerQuotes.length) return null;
  
  // Sort by price (ascending) and return the cheapest valid quote
  return partnerQuotes
    .filter(quote => !quote.validUntil || quote.validUntil > Date.now())
    .sort((a, b) => a.quotedPrice.amount - b.quotedPrice.amount)[0] || null;
}

export function formatQuoteDisplayName(quote: Quote): string {
  return `${quote.quoteNumber} - ${getQuoteRoute(quote)}`;
}

export function sanitizeQuoteForExport(quote: Quote, includePrivateData = false): Partial<Quote> {
  const publicData = {
    quoteNumber: quote.quoteNumber,
    customerReference: quote.customerReference,
    serviceType: quote.serviceType,
    priority: quote.priority,
    origin: quote.origin,
    destination: quote.destination,
    dimensions: quote.dimensions,
    description: quote.description,
    deadline: quote.deadline,
    status: quote.status,
    validUntil: quote.validUntil,
    sentAt: quote.sentAt,
    createdAt: quote.createdAt,
  };

  if (includePrivateData) {
    return {
      ...publicData,
      customerId: quote.customerId,
      inquirySourceId: quote.inquirySourceId,
      specialInstructions: quote.specialInstructions,
      baseCost: quote.baseCost,
      markup: quote.markup,
      totalPrice: quote.totalPrice,
      partnerQuotes: quote.partnerQuotes,
      selectedPartnerQuote: quote.selectedPartnerQuote,
      flightDetails: quote.flightDetails,
      assignedCourierId: quote.assignedCourierId,
      quoteText: quote.quoteText,
      notes: quote.notes,
      rejectionReason: quote.rejectionReason,
      convertedToShipmentId: quote.convertedToShipmentId,
    };
  }

  return publicData;
}

export function validateQuoteWorkflow(quote: Quote, targetStatus: Quote['status']): string[] {
  const errors: string[] = [];
  
  switch (targetStatus) {
    case QUOTE_CONSTANTS.STATUS.SENT:
      if (!quote.totalPrice) {
        errors.push('Total price is required to send quote');
      }
      if (!quote.quoteText) {
        errors.push('Quote text is required to send quote');
      }
      break;
      
    case QUOTE_CONSTANTS.STATUS.ACCEPTED:
      if (quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
        errors.push('Quote must be sent before it can be accepted');
      }
      if (isQuoteExpired(quote)) {
        errors.push('Cannot accept expired quote');
      }
      break;
      
    case QUOTE_CONSTANTS.STATUS.REJECTED:
      if (quote.status !== QUOTE_CONSTANTS.STATUS.SENT) {
        errors.push('Quote must be sent before it can be rejected');
      }
      break;
  }
  
  return errors;
}