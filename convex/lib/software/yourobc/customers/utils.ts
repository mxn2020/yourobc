// convex/lib/software/yourobc/customers/utils.ts
// Validation functions and utility helpers for customers module

import { CUSTOMERS_CONSTANTS } from './constants';
import type { CreateCustomerData, UpdateCustomerData, ContactData, AddressData } from './types';

/**
 * Validate customer data for creation/update
 */
export function validateCustomerData(
  data: Partial<CreateCustomerData | UpdateCustomerData>
): string[] {
  const errors: string[] = [];

  // Validate company name
  if (data.companyName !== undefined) {
    const trimmed = data.companyName.trim();

    if (!trimmed) {
      errors.push('Company name is required');
    } else if (trimmed.length < CUSTOMERS_CONSTANTS.LIMITS.MIN_COMPANY_NAME_LENGTH) {
      errors.push(`Company name must be at least ${CUSTOMERS_CONSTANTS.LIMITS.MIN_COMPANY_NAME_LENGTH} characters`);
    } else if (trimmed.length > CUSTOMERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH) {
      errors.push(`Company name cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH} characters`);
    } else if (!CUSTOMERS_CONSTANTS.VALIDATION.COMPANY_NAME_PATTERN.test(trimmed)) {
      errors.push('Company name contains invalid characters');
    }
  }

  // Validate short name
  if (data.shortName !== undefined && data.shortName.trim()) {
    const trimmed = data.shortName.trim();
    if (trimmed.length > CUSTOMERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH) {
      errors.push(`Short name cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH} characters`);
    }
  }

  // Validate website
  if (data.website !== undefined && data.website.trim()) {
    const trimmed = data.website.trim();
    if (trimmed.length > CUSTOMERS_CONSTANTS.LIMITS.MAX_WEBSITE_LENGTH) {
      errors.push(`Website cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_WEBSITE_LENGTH} characters`);
    } else if (!CUSTOMERS_CONSTANTS.VALIDATION.WEBSITE_PATTERN.test(trimmed)) {
      errors.push('Website URL is invalid');
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > CUSTOMERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate internal notes
  if (data.internalNotes !== undefined && data.internalNotes.trim()) {
    const trimmed = data.internalNotes.trim();
    if (trimmed.length > CUSTOMERS_CONSTANTS.LIMITS.MAX_INTERNAL_NOTES_LENGTH) {
      errors.push(`Internal notes cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_INTERNAL_NOTES_LENGTH} characters`);
    }
  }

  // Validate margin
  if (data.margin !== undefined) {
    if (data.margin < CUSTOMERS_CONSTANTS.LIMITS.MIN_MARGIN) {
      errors.push(`Margin cannot be less than ${CUSTOMERS_CONSTANTS.LIMITS.MIN_MARGIN}%`);
    } else if (data.margin > CUSTOMERS_CONSTANTS.LIMITS.MAX_MARGIN) {
      errors.push(`Margin cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_MARGIN}%`);
    }
  }

  // Validate payment terms
  if (data.paymentTerms !== undefined) {
    if (data.paymentTerms < CUSTOMERS_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS) {
      errors.push(`Payment terms cannot be less than ${CUSTOMERS_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS} days`);
    } else if (data.paymentTerms > CUSTOMERS_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS) {
      errors.push(`Payment terms cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS} days`);
    }
  }

  // Validate additional contacts
  if ('additionalContacts' in data && data.additionalContacts) {
    if (data.additionalContacts.length > CUSTOMERS_CONSTANTS.LIMITS.MAX_ADDITIONAL_CONTACTS) {
      errors.push(`Cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_ADDITIONAL_CONTACTS} additional contacts`);
    }

    // Validate each contact
    data.additionalContacts.forEach((contact, index) => {
      const contactErrors = validateContact(contact);
      if (contactErrors.length > 0) {
        errors.push(`Contact ${index + 1}: ${contactErrors.join(', ')}`);
      }
    });
  }

  // Validate primary contact
  if ('primaryContact' in data && data.primaryContact) {
    const contactErrors = validateContact(data.primaryContact);
    if (contactErrors.length > 0) {
      errors.push(`Primary contact: ${contactErrors.join(', ')}`);
    }
  }

  // Validate billing address
  if ('billingAddress' in data && data.billingAddress) {
    const addressErrors = validateAddress(data.billingAddress);
    if (addressErrors.length > 0) {
      errors.push(`Billing address: ${addressErrors.join(', ')}`);
    }
  }

  // Validate shipping address
  if ('shippingAddress' in data && data.shippingAddress) {
    const addressErrors = validateAddress(data.shippingAddress);
    if (addressErrors.length > 0) {
      errors.push(`Shipping address: ${addressErrors.join(', ')}`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > CUSTOMERS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${CUSTOMERS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

/**
 * Validate contact data
 */
export function validateContact(contact: ContactData): string[] {
  const errors: string[] = [];

  if (!contact.name || !contact.name.trim()) {
    errors.push('Contact name is required');
  }

  if (contact.email && contact.email.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(contact.email.trim())) {
      errors.push('Invalid email address');
    }
  }

  return errors;
}

/**
 * Validate address data
 */
export function validateAddress(address: AddressData): string[] {
  const errors: string[] = [];

  if (!address.city || !address.city.trim()) {
    errors.push('City is required');
  }

  if (!address.country || !address.country.trim()) {
    errors.push('Country is required');
  }

  if (!address.countryCode || !address.countryCode.trim()) {
    errors.push('Country code is required');
  } else if (address.countryCode.trim().length !== 2) {
    errors.push('Country code must be 2 characters');
  }

  return errors;
}

/**
 * Format customer display name
 */
export function formatCustomerDisplayName(customer: { companyName: string; status?: string }): string {
  const statusBadge = customer.status ? ` [${customer.status}]` : '';
  return `${customer.companyName}${statusBadge}`;
}

/**
 * Check if customer is editable
 */
export function isCustomerEditable(customer: { status: string; deletedAt?: number }): boolean {
  if (customer.deletedAt) return false;
  return customer.status !== 'blacklisted';
}

/**
 * Calculate average margin for customers
 */
export function calculateAverageMargin(customers: { margin: number }[]): number {
  if (customers.length === 0) return 0;
  const total = customers.reduce((sum, customer) => sum + customer.margin, 0);
  return Math.round((total / customers.length) * 100) / 100;
}

/**
 * Calculate average payment terms for customers
 */
export function calculateAveragePaymentTerms(customers: { paymentTerms: number }[]): number {
  if (customers.length === 0) return 0;
  const total = customers.reduce((sum, customer) => sum + customer.paymentTerms, 0);
  return Math.round(total / customers.length);
}
