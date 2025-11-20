// convex/lib/yourobc/partners/utils.ts
// convex/yourobc/partners/utils.ts

import { PARTNER_CONSTANTS, PARTNER_STATUS_COLORS, SERVICE_TYPE_COLORS } from './constants';
import type { Partner, CreatePartnerData, UpdatePartnerData, ServiceCoverage } from './types';

import {
  isValidEmail,
  isValidPhone,
  generateSequentialNumber,
  validateAddress,
  validateContact,
} from '../shared';

export function validatePartnerData(data: Partial<CreatePartnerData | UpdatePartnerData>): string[] {
  const errors: string[] = [];

  if (data.companyName !== undefined && !data.companyName.trim()) {
    errors.push('Company name is required');
  }

  if (data.companyName && data.companyName.length > PARTNER_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH) {
    errors.push(`Company name must be less than ${PARTNER_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH} characters`);
  }

  if (data.shortName && data.shortName.length > PARTNER_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH) {
    errors.push(`Short name must be less than ${PARTNER_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH} characters`);
  }

  if (data.partnerCode && data.partnerCode.length > PARTNER_CONSTANTS.LIMITS.MAX_PARTNER_CODE_LENGTH) {
    errors.push(`Partner code must be less than ${PARTNER_CONSTANTS.LIMITS.MAX_PARTNER_CODE_LENGTH} characters`);
  }

  if (data.paymentTerms !== undefined) {
    if (data.paymentTerms < PARTNER_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS || 
        data.paymentTerms > PARTNER_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS) {
      errors.push(`Payment terms must be between ${PARTNER_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS} and ${PARTNER_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS} days`);
    }
  }

  if (data.quotingEmail && !isValidEmail(data.quotingEmail)) {
    errors.push('Quoting email format is invalid');
  }

  if (data.notes && data.notes.length > PARTNER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
    errors.push(`Notes must be less than ${PARTNER_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
  }

  if (data.primaryContact) {
    const contactErrors = validateContact(data.primaryContact);
    errors.push(...contactErrors);
  }

  if (data.address) {
    const addressErrors = validateAddress(data.address);
    errors.push(...addressErrors);
  }

  if (data.serviceCoverage) {
    const coverageErrors = validateServiceCoverage(data.serviceCoverage);
    errors.push(...coverageErrors);
  }

  return errors;
}

export function validateServiceCoverage(coverage: Partial<ServiceCoverage>): string[] {
  const errors: string[] = [];

  if (!coverage.countries || coverage.countries.length === 0) {
    errors.push('At least one country must be specified in service coverage');
  }

  if (coverage.countries && coverage.countries.length > PARTNER_CONSTANTS.LIMITS.MAX_COUNTRIES) {
    errors.push(`Maximum ${PARTNER_CONSTANTS.LIMITS.MAX_COUNTRIES} countries allowed in service coverage`);
  }

  if (coverage.cities && coverage.cities.length > PARTNER_CONSTANTS.LIMITS.MAX_CITIES) {
    errors.push(`Maximum ${PARTNER_CONSTANTS.LIMITS.MAX_CITIES} cities allowed in service coverage`);
  }

  if (coverage.airports && coverage.airports.length > PARTNER_CONSTANTS.LIMITS.MAX_AIRPORTS) {
    errors.push(`Maximum ${PARTNER_CONSTANTS.LIMITS.MAX_AIRPORTS} airports allowed in service coverage`);
  }

  return errors;
}

export function generatePartnerCode(companyName: string, sequence?: number): string {
  if (sequence) {
    return generateSequentialNumber('PTR', sequence);
  }

  // Generate from company name
  const cleanName = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);

  return cleanName.length >= 3 ? cleanName : generateSequentialNumber('PTR', 1);
}

export function getPartnerStatusColor(status: Partner['status']): string {
  return PARTNER_STATUS_COLORS[status] || '#6b7280';
}

export function getServiceTypeColor(serviceType: Partner['serviceType']): string {
  return SERVICE_TYPE_COLORS[serviceType] || '#6b7280';
}

export function isPartnerAvailableForRoute(
  partner: Partner,
  serviceType: 'OBC' | 'NFO',
  originCountryCode: string,
  destinationCountryCode: string
): boolean {
  if (partner.status !== PARTNER_CONSTANTS.STATUS.ACTIVE) {
    return false;
  }

  if (partner.serviceType !== serviceType && partner.serviceType !== 'both') {
    return false;
  }

  const hasOriginCoverage = partner.serviceCoverage.countries.includes(originCountryCode) ||
                           partner.serviceCoverage.countries.length === 0;
  
  const hasDestinationCoverage = partner.serviceCoverage.countries.includes(destinationCountryCode) ||
                                partner.serviceCoverage.countries.length === 0;

  return hasOriginCoverage && hasDestinationCoverage;
}

export function isPartnerAvailableForCity(
  partner: Partner,
  city: string
): boolean {
  if (partner.status !== PARTNER_CONSTANTS.STATUS.ACTIVE) {
    return false;
  }

  return partner.serviceCoverage.cities.includes(city) ||
         partner.serviceCoverage.cities.length === 0;
}

export function isPartnerAvailableForAirport(
  partner: Partner,
  airportCode: string
): boolean {
  if (partner.status !== PARTNER_CONSTANTS.STATUS.ACTIVE) {
    return false;
  }

  return partner.serviceCoverage.airports.includes(airportCode) ||
         partner.serviceCoverage.airports.length === 0;
}

export function formatPartnerDisplayName(partner: Partner): string {
  return partner.shortName || partner.companyName || `Partner ${partner.partnerCode || partner._id}`;
}

export function getPartnerContactInfo(partner: Partner): {
  name: string;
  email?: string;
  phone?: string;
} {
  return {
    name: partner.primaryContact.name,
    email: partner.primaryContact.email,
    phone: partner.primaryContact.phone,
  };
}

export function sanitizePartnerForExport(partner: Partner, includePrivateData = false): Partial<Partner> {
  const publicData = {
    companyName: partner.companyName,
    shortName: partner.shortName,
    partnerCode: partner.partnerCode,
    status: partner.status,
    serviceType: partner.serviceType,
    address: partner.address,
    serviceCoverage: partner.serviceCoverage,
    preferredCurrency: partner.preferredCurrency,
    paymentTerms: partner.paymentTerms,
    createdAt: partner.createdAt,
  };

  if (includePrivateData) {
    return {
      ...publicData,
      primaryContact: partner.primaryContact,
      quotingEmail: partner.quotingEmail,
      notes: partner.notes,
    };
  }

  return publicData;
}

export function calculatePartnerPerformanceScore(partnerStats: {
  totalQuotes: number;
  acceptedQuotes: number;
  averageResponseTime: number; // in hours
  averageQuoteAccuracy: number; // percentage
}): number {
  const responseScore = Math.max(0, 100 - (partnerStats.averageResponseTime * 5)); // Penalty for slow response
  const acceptanceRate = partnerStats.totalQuotes > 0 ? 
    (partnerStats.acceptedQuotes / partnerStats.totalQuotes) * 100 : 0;
  const accuracyScore = partnerStats.averageQuoteAccuracy;

  return Math.round((responseScore + acceptanceRate + accuracyScore) / 3);
}

export function getPartnerServiceCapabilities(partner: Partner): {
  canHandleOBC: boolean;
  canHandleNFO: boolean;
  primaryService: string;
} {
  return {
    canHandleOBC: partner.serviceType === 'OBC' || partner.serviceType === 'both',
    canHandleNFO: partner.serviceType === 'NFO' || partner.serviceType === 'both',
    primaryService: partner.serviceType,
  };
}