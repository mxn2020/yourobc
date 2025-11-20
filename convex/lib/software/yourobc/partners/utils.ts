// convex/lib/software/yourobc/partners/utils.ts
// Utility functions for partners module

import { PARTNERS_CONSTANTS } from './constants';
import type { CreatePartnerInput, UpdatePartnerInput, Partner } from './types';

/**
 * Validate partner creation data
 * @throws Error if validation fails
 */
export function validatePartnerData(data: CreatePartnerInput): void {
  // Validate required fields
  if (!data.companyName || data.companyName.trim().length === 0) {
    throw new Error('Company name is required');
  }

  if (data.companyName.length > PARTNERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH) {
    throw new Error(
      `Company name must be ${PARTNERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH} characters or less`
    );
  }

  if (data.shortName && data.shortName.length > PARTNERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH) {
    throw new Error(
      `Short name must be ${PARTNERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH} characters or less`
    );
  }

  if (data.partnerCode && data.partnerCode.length > PARTNERS_CONSTANTS.LIMITS.MAX_PARTNER_CODE_LENGTH) {
    throw new Error(
      `Partner code must be ${PARTNERS_CONSTANTS.LIMITS.MAX_PARTNER_CODE_LENGTH} characters or less`
    );
  }

  // Validate primary contact
  if (!data.primaryContact || !data.primaryContact.name || data.primaryContact.name.trim().length === 0) {
    throw new Error('Primary contact name is required');
  }

  // Validate address
  if (!data.address || !data.address.city || !data.address.country || !data.address.countryCode) {
    throw new Error('Address with city, country, and country code is required');
  }

  // Validate service coverage
  if (!data.serviceCoverage) {
    throw new Error('Service coverage is required');
  }

  if (!Array.isArray(data.serviceCoverage.countries)) {
    throw new Error('Service coverage countries must be an array');
  }

  if (!Array.isArray(data.serviceCoverage.cities)) {
    throw new Error('Service coverage cities must be an array');
  }

  if (!Array.isArray(data.serviceCoverage.airports)) {
    throw new Error('Service coverage airports must be an array');
  }

  if (data.serviceCoverage.countries.length > PARTNERS_CONSTANTS.LIMITS.MAX_COUNTRIES) {
    throw new Error(`Cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_COUNTRIES} countries`);
  }

  if (data.serviceCoverage.cities.length > PARTNERS_CONSTANTS.LIMITS.MAX_CITIES) {
    throw new Error(`Cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_CITIES} cities`);
  }

  if (data.serviceCoverage.airports.length > PARTNERS_CONSTANTS.LIMITS.MAX_AIRPORTS) {
    throw new Error(`Cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_AIRPORTS} airports`);
  }

  // Validate payment terms
  if (data.paymentTerms < PARTNERS_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS_DAYS) {
    throw new Error(`Payment terms must be at least ${PARTNERS_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS_DAYS} days`);
  }

  if (data.paymentTerms > PARTNERS_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS_DAYS) {
    throw new Error(`Payment terms cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS_DAYS} days`);
  }

  // Validate ranking if provided
  if (data.ranking !== undefined) {
    if (data.ranking < PARTNERS_CONSTANTS.RANKING.MIN || data.ranking > PARTNERS_CONSTANTS.RANKING.MAX) {
      throw new Error(
        `Ranking must be between ${PARTNERS_CONSTANTS.RANKING.MIN} and ${PARTNERS_CONSTANTS.RANKING.MAX}`
      );
    }
  }

  // Validate notes length
  if (data.notes && data.notes.length > PARTNERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    throw new Error(`Notes must be ${PARTNERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters or less`);
  }

  if (data.rankingNotes && data.rankingNotes.length > PARTNERS_CONSTANTS.LIMITS.MAX_RANKING_NOTES_LENGTH) {
    throw new Error(
      `Ranking notes must be ${PARTNERS_CONSTANTS.LIMITS.MAX_RANKING_NOTES_LENGTH} characters or less`
    );
  }

  if (
    data.internalPaymentNotes &&
    data.internalPaymentNotes.length > PARTNERS_CONSTANTS.LIMITS.MAX_INTERNAL_PAYMENT_NOTES_LENGTH
  ) {
    throw new Error(
      `Internal payment notes must be ${PARTNERS_CONSTANTS.LIMITS.MAX_INTERNAL_PAYMENT_NOTES_LENGTH} characters or less`
    );
  }

  // Validate email format if provided
  if (data.quotingEmail && !isValidEmail(data.quotingEmail)) {
    throw new Error('Invalid quoting email format');
  }

  if (data.primaryContact.email && !isValidEmail(data.primaryContact.email)) {
    throw new Error('Invalid primary contact email format');
  }
}

/**
 * Validate partner update data
 * @throws Error if validation fails
 */
export function validatePartnerUpdateData(data: UpdatePartnerInput): void {
  // Validate company name if provided
  if (data.companyName !== undefined) {
    if (!data.companyName || data.companyName.trim().length === 0) {
      throw new Error('Company name cannot be empty');
    }

    if (data.companyName.length > PARTNERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH) {
      throw new Error(
        `Company name must be ${PARTNERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH} characters or less`
      );
    }
  }

  // Validate other fields if provided (similar to create validation)
  if (data.shortName !== undefined && data.shortName.length > PARTNERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH) {
    throw new Error(
      `Short name must be ${PARTNERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH} characters or less`
    );
  }

  if (data.partnerCode !== undefined && data.partnerCode.length > PARTNERS_CONSTANTS.LIMITS.MAX_PARTNER_CODE_LENGTH) {
    throw new Error(
      `Partner code must be ${PARTNERS_CONSTANTS.LIMITS.MAX_PARTNER_CODE_LENGTH} characters or less`
    );
  }

  if (data.ranking !== undefined) {
    if (data.ranking < PARTNERS_CONSTANTS.RANKING.MIN || data.ranking > PARTNERS_CONSTANTS.RANKING.MAX) {
      throw new Error(
        `Ranking must be between ${PARTNERS_CONSTANTS.RANKING.MIN} and ${PARTNERS_CONSTANTS.RANKING.MAX}`
      );
    }
  }

  if (data.notes !== undefined && data.notes.length > PARTNERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    throw new Error(`Notes must be ${PARTNERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters or less`);
  }

  if (data.quotingEmail !== undefined && data.quotingEmail && !isValidEmail(data.quotingEmail)) {
    throw new Error('Invalid quoting email format');
  }

  if (data.primaryContact?.email && !isValidEmail(data.primaryContact.email)) {
    throw new Error('Invalid primary contact email format');
  }
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a unique partner code from company name
 */
export function generatePartnerCode(companyName: string): string {
  // Take first 3 letters of company name, uppercase
  const prefix = companyName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
  // Add random 4-digit number
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${suffix}`;
}

/**
 * Generate display name for partner
 */
export function getPartnerDisplayName(partner: Partner): string {
  return partner.shortName || partner.companyName;
}

/**
 * Get partner status label
 */
export function getPartnerStatusLabel(status: 'active' | 'inactive' | 'suspended'): string {
  const labels = {
    active: 'Active',
    inactive: 'Inactive',
    suspended: 'Suspended',
  };
  return labels[status] || status;
}

/**
 * Get service type label
 */
export function getServiceTypeLabel(serviceType: 'OBC' | 'NFO' | 'both'): string {
  const labels = {
    OBC: 'OBC Only',
    NFO: 'NFO Only',
    both: 'Both OBC & NFO',
  };
  return labels[serviceType] || serviceType;
}

/**
 * Get ranking label
 */
export function getRankingLabel(ranking: 1 | 2 | 3 | 4 | 5): string {
  const labels = {
    1: '1 Star - Poor',
    2: '2 Stars - Below Average',
    3: '3 Stars - Average',
    4: '4 Stars - Good',
    5: '5 Stars - Excellent',
  };
  return labels[ranking] || `${ranking} Stars`;
}

/**
 * Check if partner is active
 */
export function isPartnerActive(partner: Partner): boolean {
  return partner.status === 'active' && !partner.deletedAt;
}

/**
 * Check if partner can handle service type
 */
export function canHandleServiceType(partner: Partner, serviceType: 'OBC' | 'NFO'): boolean {
  if (partner.serviceType === 'both') return true;
  return partner.serviceType === serviceType;
}

/**
 * Check if partner covers country
 */
export function coversCountry(partner: Partner, country: string): boolean {
  return partner.serviceCoverage.countries.includes(country);
}

/**
 * Check if partner covers city
 */
export function coversCity(partner: Partner, city: string): boolean {
  return partner.serviceCoverage.cities.includes(city);
}

/**
 * Check if partner covers airport
 */
export function coversAirport(partner: Partner, airport: string): boolean {
  return partner.serviceCoverage.airports.includes(airport);
}

/**
 * Get service capabilities summary
 */
export function getServiceCapabilitiesSummary(partner: Partner): string[] {
  const capabilities: string[] = [];

  if (partner.serviceCapabilities?.handlesCustoms) capabilities.push('Customs');
  if (partner.serviceCapabilities?.handlesPickup) capabilities.push('Pickup');
  if (partner.serviceCapabilities?.handlesDelivery) capabilities.push('Delivery');
  if (partner.serviceCapabilities?.handlesNFO) capabilities.push('NFO');
  if (partner.serviceCapabilities?.handlesTrucking) capabilities.push('Trucking');

  return capabilities;
}

/**
 * Calculate average rating for display
 */
export function formatRating(ranking?: 1 | 2 | 3 | 4 | 5): string {
  if (!ranking) return 'Not rated';
  return `${ranking}/5`;
}

/**
 * Format payment terms for display
 */
export function formatPaymentTerms(days: number): string {
  if (days === 0) return 'Immediate';
  if (days === 1) return '1 day';
  return `${days} days`;
}

/**
 * Generate search keywords from partner data
 */
export function generateSearchKeywords(partner: Partner): string[] {
  const keywords: string[] = [
    partner.companyName.toLowerCase(),
  ];

  if (partner.shortName) {
    keywords.push(partner.shortName.toLowerCase());
  }

  if (partner.partnerCode) {
    keywords.push(partner.partnerCode.toLowerCase());
  }

  // Add countries, cities, airports
  keywords.push(...partner.serviceCoverage.countries.map(c => c.toLowerCase()));
  keywords.push(...partner.serviceCoverage.cities.map(c => c.toLowerCase()));
  keywords.push(...partner.serviceCoverage.airports.map(a => a.toLowerCase()));

  return [...new Set(keywords)]; // Remove duplicates
}
