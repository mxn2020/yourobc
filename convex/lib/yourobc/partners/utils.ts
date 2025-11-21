// convex/lib/yourobc/partners/utils.ts
// Validation functions and utility helpers for partners module

import { PARTNERS_CONSTANTS } from './constants';
import type { CreatePartnerData, UpdatePartnerData } from './types';

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
    if (!PARTNERS_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(data.primaryContact.email)) {
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
