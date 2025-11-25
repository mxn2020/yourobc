// convex/lib/yourobc/partners/utils.ts
// Validation functions and utility helpers for partners module

import { PARTNERS_CONSTANTS } from './constants';
import type { CreatePartnerData, UpdatePartnerData } from './types';

/**
 * Trim all string fields in partner data
 * Generic typing ensures type safety without `any`
 */
export function trimPartnerData<
  T extends Partial<CreatePartnerData | UpdatePartnerData>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  // Trim string fields
  if (typeof trimmed.companyName === 'string') {
    trimmed.companyName = trimmed.companyName.trim() as T['companyName'];
  }

  if (typeof trimmed.shortName === 'string') {
    trimmed.shortName = trimmed.shortName.trim() as T['shortName'];
  }

  if (typeof trimmed.partnerCode === 'string') {
    trimmed.partnerCode = trimmed.partnerCode.trim() as T['partnerCode'];
  }

  if (typeof trimmed.quotingEmail === 'string') {
    trimmed.quotingEmail = trimmed.quotingEmail.trim() as T['quotingEmail'];
  }

  if (typeof trimmed.rankingNotes === 'string') {
    trimmed.rankingNotes = trimmed.rankingNotes.trim() as T['rankingNotes'];
  }

  if (typeof trimmed.internalPaymentNotes === 'string') {
    trimmed.internalPaymentNotes = trimmed.internalPaymentNotes.trim() as T['internalPaymentNotes'];
  }

  if (typeof trimmed.apiKey === 'string') {
    trimmed.apiKey = trimmed.apiKey.trim() as T['apiKey'];
  }

  if (typeof trimmed.apiEndpoint === 'string') {
    trimmed.apiEndpoint = trimmed.apiEndpoint.trim() as T['apiEndpoint'];
  }

  if (typeof trimmed.notes === 'string') {
    trimmed.notes = trimmed.notes.trim() as T['notes'];
  }

  return trimmed;
}

/**
 * Validate partner data for creation/update
 */
export function validatePartnerData(
  data: Partial<CreatePartnerData | UpdatePartnerData>
): string[] {
  const errors: string[] = [];

  // Validate company name (main display field)
  if (data.companyName !== undefined) {
    const trimmed = data.companyName.trim();

    if (!trimmed) {
      errors.push('Company name is required');
    } else if (trimmed.length < PARTNERS_CONSTANTS.LIMITS.MIN_COMPANY_NAME_LENGTH) {
      errors.push(`Company name must be at least ${PARTNERS_CONSTANTS.LIMITS.MIN_COMPANY_NAME_LENGTH} characters`);
    } else if (trimmed.length > PARTNERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH) {
      errors.push(`Company name cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_COMPANY_NAME_LENGTH} characters`);
    } else if (!PARTNERS_CONSTANTS.VALIDATION.COMPANY_NAME_PATTERN.test(trimmed)) {
      errors.push('Company name contains invalid characters');
    }
  }

  // Validate short name
  if (data.shortName !== undefined && data.shortName.trim()) {
    const trimmed = data.shortName.trim();
    if (trimmed.length > PARTNERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH) {
      errors.push(`Short name cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_SHORT_NAME_LENGTH} characters`);
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > PARTNERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate payment terms
  if (data.paymentTerms !== undefined) {
    if (data.paymentTerms < PARTNERS_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS) {
      errors.push(`Payment terms must be at least ${PARTNERS_CONSTANTS.LIMITS.MIN_PAYMENT_TERMS} days`);
    } else if (data.paymentTerms > PARTNERS_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS) {
      errors.push(`Payment terms cannot exceed ${PARTNERS_CONSTANTS.LIMITS.MAX_PAYMENT_TERMS} days`);
    }
  }

  // Validate ranking
  if (data.ranking !== undefined) {
    if (data.ranking < PARTNERS_CONSTANTS.LIMITS.MIN_RANKING || data.ranking > PARTNERS_CONSTANTS.LIMITS.MAX_RANKING) {
      errors.push(`Ranking must be between ${PARTNERS_CONSTANTS.LIMITS.MIN_RANKING} and ${PARTNERS_CONSTANTS.LIMITS.MAX_RANKING}`);
    }
  }

  // Validate commission rate
  if (data.commissionRate !== undefined) {
    if (data.commissionRate < PARTNERS_CONSTANTS.LIMITS.MIN_COMMISSION_RATE || data.commissionRate > PARTNERS_CONSTANTS.LIMITS.MAX_COMMISSION_RATE) {
      errors.push(`Commission rate must be between ${PARTNERS_CONSTANTS.LIMITS.MIN_COMMISSION_RATE}% and ${PARTNERS_CONSTANTS.LIMITS.MAX_COMMISSION_RATE}%`);
    }
  }

  // Validate email
  if (data.quotingEmail !== undefined && data.quotingEmail.trim()) {
    const trimmed = data.quotingEmail.trim();
    if (!PARTNERS_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(trimmed)) {
      errors.push('Invalid email format');
    }
  }

  // Validate primary contact email
  if ('primaryContact' in data && data.primaryContact) {
    const email = data.primaryContact.email;
    if (email && !PARTNERS_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(email)) {
      errors.push('Invalid primary contact email format');
    }
  }

  return errors;
}

/**
 * Format partner display name
 */
export function formatPartnerDisplayName(partner: { companyName: string; status?: string }): string {
  const statusBadge = partner.status ? ` [${partner.status}]` : '';
  return `${partner.companyName}${statusBadge}`;
}

/**
 * Check if partner is editable
 */
export function isPartnerEditable(partner: { status: string; deletedAt?: number }): boolean {
  if (partner.deletedAt) return false;
  return partner.status !== 'archived';
}
