// convex/lib/yourobc/customers/utils.ts
// convex/yourobc/customers/utils.ts

import { CUSTOMER_CONSTANTS, CUSTOMER_STATUS_COLORS } from './constants';
import type { Customer, CreateCustomerData, UpdateCustomerData } from './types';

import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  generateSequentialNumber,
  validateAddress,
  validateContact,
} from '../shared';
import type {
  Address,
} from '../shared';

export function validateCustomerData(data: Partial<CreateCustomerData | UpdateCustomerData>): string[] {
  const errors: string[] = [];

  if (data.companyName !== undefined && !data.companyName.trim()) {
    errors.push('Company name is required');
  }

  if (data.companyName && data.companyName.length > CUSTOMER_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH) {
    errors.push(`Company name must be less than ${CUSTOMER_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH} characters`);
  }

  if (data.shortName && data.shortName.length > CUSTOMER_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH) {
    errors.push(`Short name must be less than ${CUSTOMER_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH} characters`);
  }

  if (data.website && !isValidUrl(data.website)) {
    errors.push('Website URL format is invalid');
  }

  if (data.website && data.website.length > CUSTOMER_CONSTANTS.LIMITS.MAX_WEBSITE_LENGTH) {
    errors.push(`Website URL must be less than ${CUSTOMER_CONSTANTS.LIMITS.MAX_WEBSITE_LENGTH} characters`);
  }

  if (data.notes && data.notes.length > CUSTOMER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Notes must be less than ${CUSTOMER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  if (data.internalNotes && data.internalNotes.length > CUSTOMER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Internal notes must be less than ${CUSTOMER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  if (data.paymentTerms !== undefined) {
    if (data.paymentTerms < CUSTOMER_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS || 
        data.paymentTerms > CUSTOMER_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS) {
      errors.push(`Payment terms must be between ${CUSTOMER_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS} and ${CUSTOMER_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS} days`);
    }
  }

  if (data.margin !== undefined) {
    if (data.margin < CUSTOMER_CONSTANTS.LIMITS.MIN_MARGIN || 
        data.margin > CUSTOMER_CONSTANTS.LIMITS.MAX_MARGIN) {
      errors.push(`Margin must be between ${CUSTOMER_CONSTANTS.LIMITS.MIN_MARGIN} and ${CUSTOMER_CONSTANTS.LIMITS.MAX_MARGIN} percent`);
    }
  }

  if (data.tags && data.tags.length > CUSTOMER_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${CUSTOMER_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  if (data.additionalContacts && data.additionalContacts.length > CUSTOMER_CONSTANTS.LIMITS.MAX_CONTACTS) {
    errors.push(`Maximum ${CUSTOMER_CONSTANTS.LIMITS.MAX_CONTACTS} additional contacts allowed`);
  }

  if (data.primaryContact) {
    const contactErrors = validateContact(data.primaryContact);
    errors.push(...contactErrors.map(err => `Primary contact: ${err}`));
  }

  if (data.additionalContacts) {
    data.additionalContacts.forEach((contact, index) => {
      const contactErrors = validateContact(contact);
      errors.push(...contactErrors.map(err => `Contact ${index + 1}: ${err}`));
    });
  }

  if (data.billingAddress) {
    const addressErrors = validateAddress(data.billingAddress);
    errors.push(...addressErrors.map(err => `Billing address: ${err}`));
  }

  if (data.shippingAddress) {
    const addressErrors = validateAddress(data.shippingAddress);
    errors.push(...addressErrors.map(err => `Shipping address: ${err}`));
  }

  return errors;
}

export function generateCustomerNumber(sequence: number): string {
  return generateSequentialNumber('CUS', sequence);
}

export function getCustomerStatusColor(status: Customer['status']): string {
  return CUSTOMER_STATUS_COLORS[status] || '#6b7280';
}

export function formatCustomerDisplayName(customer: Customer): string {
  return customer.shortName || customer.companyName;
}

export function getCustomerFullAddress(address: Address): string {
  const parts = [
    address.street,
    address.city,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

export function sanitizeCustomerForExport(customer: Customer, includePrivateData = false): Partial<Customer> {
  const publicData = {
    companyName: customer.companyName,
    shortName: customer.shortName,
    status: customer.status,
    primaryContact: {
      name: customer.primaryContact.name,
      email: includePrivateData ? customer.primaryContact.email : undefined,
      phone: includePrivateData ? customer.primaryContact.phone : undefined,
      isPrimary: customer.primaryContact.isPrimary,
    },
    billingAddress: customer.billingAddress,
    shippingAddress: customer.shippingAddress,
    defaultCurrency: customer.defaultCurrency,
    paymentTerms: customer.paymentTerms,
    paymentMethod: customer.paymentMethod,
    tags: customer.tags,
    website: customer.website,
    createdAt: customer.createdAt,
  };

  if (includePrivateData) {
    return {
      ...publicData,
      additionalContacts: customer.additionalContacts,
      margin: customer.margin,
      notes: customer.notes,
      internalNotes: customer.internalNotes,
      inquirySourceId: customer.inquirySourceId,
      stats: customer.stats,
    };
  }

  return publicData;
}

export function calculateCustomerScore(customer: Customer): number {
  let score = 0;

  // Revenue contribution (40% of score)
  if (customer.stats.totalRevenue > 100000) score += 40;
  else if (customer.stats.totalRevenue > 50000) score += 30;
  else if (customer.stats.totalRevenue > 10000) score += 20;
  else if (customer.stats.totalRevenue > 1000) score += 10;

  // Quote acceptance rate (30% of score)
  if (customer.stats.totalQuotes > 0) {
    const acceptanceRate = customer.stats.acceptedQuotes / customer.stats.totalQuotes;
    score += Math.round(acceptanceRate * 30);
  }

  // Activity recency (20% of score)
  const now = Date.now();
  const oneMonth = 30 * 24 * 60 * 60 * 1000;
  const threeMonths = 90 * 24 * 60 * 60 * 1000;

  if (customer.stats.lastQuoteDate && (now - customer.stats.lastQuoteDate) < oneMonth) {
    score += 20;
  } else if (customer.stats.lastQuoteDate && (now - customer.stats.lastQuoteDate) < threeMonths) {
    score += 10;
  }

  // Account status (10% of score)
  if (customer.status === CUSTOMER_CONSTANTS.STATUS.ACTIVE) score += 10;
  else if (customer.status === CUSTOMER_CONSTANTS.STATUS.INACTIVE) score += 5;

  return Math.min(score, 100);
}

export function getCustomerRiskLevel(customer: Customer): 'low' | 'medium' | 'high' {
  const score = calculateCustomerScore(customer);
  
  if (customer.status === CUSTOMER_CONSTANTS.STATUS.BLACKLISTED) return 'high';
  if (score >= 70) return 'low';
  if (score >= 40) return 'medium';
  return 'high';
}

export function isCustomerActive(customer: Customer, daysThreshold = 90): boolean {
  if (customer.status !== CUSTOMER_CONSTANTS.STATUS.ACTIVE) return false;
  
  const now = Date.now();
  const threshold = daysThreshold * 24 * 60 * 60 * 1000;
  
  if (customer.stats.lastQuoteDate && (now - customer.stats.lastQuoteDate) < threshold) {
    return true;
  }
  
  if (customer.stats.lastShipmentDate && (now - customer.stats.lastShipmentDate) < threshold) {
    return true;
  }
  
  return false;
}

export function getPaymentTermsLabel(days: number): string {
  if (days === 0) return 'Due on Receipt';
  if (days === -1) return 'Cash in Advance';
  return `Net ${days}`;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}