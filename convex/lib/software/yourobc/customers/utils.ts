// convex/lib/software/yourobc/customers/utils.ts
// Validation and utility functions for customers module

import type { CreateCustomerInput, UpdateCustomerInput, Contact, Address } from '@/schema/software/yourobc/customers';
import { CUSTOMERS_CONSTANTS } from './constants';

/**
 * Validate company name
 */
export function validateCompanyName(companyName: string): void {
  if (!companyName || companyName.trim().length === 0) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.COMPANY_NAME_REQUIRED);
  }
  if (companyName.trim().length < CUSTOMERS_CONSTANTS.BUSINESS_RULES.COMPANY_NAME_MIN_LENGTH) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.COMPANY_NAME_TOO_SHORT);
  }
  if (companyName.length > CUSTOMERS_CONSTANTS.BUSINESS_RULES.COMPANY_NAME_MAX_LENGTH) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.COMPANY_NAME_TOO_LONG);
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate contact information
 */
export function validateContact(contact: Contact): void {
  if (!contact.name || contact.name.trim().length === 0) {
    throw new Error('Contact name is required');
  }
  if (contact.email && !validateEmail(contact.email)) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.INVALID_EMAIL);
  }
}

/**
 * Validate address information
 */
export function validateAddress(address: Address): void {
  if (!address.city || address.city.trim().length === 0) {
    throw new Error('City is required');
  }
  if (!address.country || address.country.trim().length === 0) {
    throw new Error('Country is required');
  }
  if (!address.countryCode || address.countryCode.trim().length === 0) {
    throw new Error('Country code is required');
  }
}

/**
 * Validate payment terms
 */
export function validatePaymentTerms(paymentTerms: number): void {
  if (
    paymentTerms < CUSTOMERS_CONSTANTS.BUSINESS_RULES.MIN_PAYMENT_TERMS ||
    paymentTerms > CUSTOMERS_CONSTANTS.BUSINESS_RULES.MAX_PAYMENT_TERMS
  ) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.INVALID_PAYMENT_TERMS);
  }
}

/**
 * Validate margin
 */
export function validateMargin(margin: number): void {
  if (
    margin < CUSTOMERS_CONSTANTS.BUSINESS_RULES.MIN_MARGIN ||
    margin > CUSTOMERS_CONSTANTS.BUSINESS_RULES.MAX_MARGIN
  ) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.INVALID_MARGIN);
  }
}

/**
 * Validate customer creation data
 */
export function validateCustomerData(data: CreateCustomerInput): void {
  // Validate company name
  validateCompanyName(data.companyName);

  // Validate primary contact
  if (!data.primaryContact) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.PRIMARY_CONTACT_REQUIRED);
  }
  validateContact(data.primaryContact);

  // Validate additional contacts
  if (data.additionalContacts) {
    data.additionalContacts.forEach((contact) => validateContact(contact));
  }

  // Validate billing address
  if (!data.billingAddress) {
    throw new Error(CUSTOMERS_CONSTANTS.VALIDATION.BILLING_ADDRESS_REQUIRED);
  }
  validateAddress(data.billingAddress);

  // Validate shipping address if provided
  if (data.shippingAddress) {
    validateAddress(data.shippingAddress);
  }

  // Validate payment terms
  validatePaymentTerms(data.paymentTerms);

  // Validate margin
  validateMargin(data.margin);
}

/**
 * Validate customer update data
 */
export function validateCustomerUpdateData(data: UpdateCustomerInput): void {
  // Validate company name if provided
  if (data.companyName !== undefined) {
    validateCompanyName(data.companyName);
  }

  // Validate primary contact if provided
  if (data.primaryContact) {
    validateContact(data.primaryContact);
  }

  // Validate additional contacts if provided
  if (data.additionalContacts) {
    data.additionalContacts.forEach((contact) => validateContact(contact));
  }

  // Validate billing address if provided
  if (data.billingAddress) {
    validateAddress(data.billingAddress);
  }

  // Validate shipping address if provided
  if (data.shippingAddress) {
    validateAddress(data.shippingAddress);
  }

  // Validate payment terms if provided
  if (data.paymentTerms !== undefined) {
    validatePaymentTerms(data.paymentTerms);
  }

  // Validate margin if provided
  if (data.margin !== undefined) {
    validateMargin(data.margin);
  }
}

/**
 * Generate a unique public ID
 */
export function generatePublicId(): string {
  const randomString = Math.random().toString(36).substring(2, 15);
  const timestamp = Date.now().toString(36);
  return `cust_${timestamp}${randomString}`;
}

/**
 * Format customer display name
 */
export function formatCustomerDisplayName(customer: { companyName: string; shortName?: string }): string {
  return customer.shortName || customer.companyName;
}

/**
 * Check if customer is suspended
 */
export function isCustomerSuspended(customer: { serviceSuspended?: boolean }): boolean {
  return customer.serviceSuspended === true;
}

/**
 * Check if customer is blacklisted
 */
export function isCustomerBlacklisted(customer: { status: string }): boolean {
  return customer.status === CUSTOMERS_CONSTANTS.STATUS.BLACKLISTED;
}

/**
 * Check if customer is active
 */
export function isCustomerActive(customer: { status: string }): boolean {
  return customer.status === CUSTOMERS_CONSTANTS.STATUS.ACTIVE;
}

/**
 * Normalize search term for case-insensitive search
 */
export function normalizeSearchTerm(searchTerm: string): string {
  return searchTerm.toLowerCase().trim();
}

/**
 * Check if customer matches search term
 */
export function matchesSearchTerm(
  customer: { companyName: string; shortName?: string },
  searchTerm: string
): boolean {
  const normalized = normalizeSearchTerm(searchTerm);
  const companyNameMatch = customer.companyName.toLowerCase().includes(normalized);
  const shortNameMatch = customer.shortName?.toLowerCase().includes(normalized);
  return companyNameMatch || (shortNameMatch ?? false);
}
