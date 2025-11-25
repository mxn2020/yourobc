// convex/lib/yourobc/customers/margins.utils.ts
// Validation functions and utility helpers for customerMargins module

import { CUSTOMER_MARGINS_CONSTANTS } from './margins.constants';
import type { CreateCustomerMarginData, UpdateCustomerMarginData } from './margins.types';

/**
 * Validate customer margin data for creation/update
 */
export function validateCustomerMarginData(
  data: Partial<CreateCustomerMarginData | UpdateCustomerMarginData>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < CUSTOMER_MARGINS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!CUSTOMER_MARGINS_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate margin ID if provided
  if (data.marginId !== undefined && data.marginId.trim()) {
    const trimmed = data.marginId.trim();
    if (trimmed.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_MARGIN_ID_LENGTH) {
      errors.push(`Margin ID cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_MARGIN_ID_LENGTH} characters`);
    }
    if (!CUSTOMER_MARGINS_CONSTANTS.VALIDATION.MARGIN_ID_PATTERN.test(trimmed)) {
      errors.push('Margin ID contains invalid characters (use A-Z, 0-9, -, _)');
    }
  }

  // Validate margin values
  if ('baseMargin' in data && data.baseMargin !== undefined) {
    if (data.baseMargin < CUSTOMER_MARGINS_CONSTANTS.LIMITS.MIN_MARGIN) {
      errors.push(`Base margin cannot be less than ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MIN_MARGIN}`);
    }
    if (data.baseMargin > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_MARGIN) {
      errors.push(`Base margin cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_MARGIN}`);
    }
  }

  if ('appliedMargin' in data && data.appliedMargin !== undefined) {
    if (data.appliedMargin < CUSTOMER_MARGINS_CONSTANTS.LIMITS.MIN_MARGIN) {
      errors.push(`Applied margin cannot be less than ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MIN_MARGIN}`);
    }
    if (data.appliedMargin > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_MARGIN) {
      errors.push(`Applied margin cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_MARGIN}`);
    }
  }

  // Validate minimum/maximum margins
  if ('minimumMargin' in data && 'maximumMargin' in data) {
    if (data.minimumMargin !== undefined && data.maximumMargin !== undefined) {
      if (data.minimumMargin > data.maximumMargin) {
        errors.push('Minimum margin cannot be greater than maximum margin');
      }
    }
  }

  // Validate effective dates
  if ('effectiveFrom' in data && 'effectiveTo' in data) {
    if (data.effectiveFrom !== undefined && data.effectiveTo !== undefined) {
      if (data.effectiveFrom > data.effectiveTo) {
        errors.push('Effective from date cannot be after effective to date');
      }
    }
  }

  // Validate pricing rules
  if ('pricingRules' in data && data.pricingRules) {
    if (data.pricingRules.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_PRICING_RULES) {
      errors.push(`Cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_PRICING_RULES} pricing rules`);
    }

    for (const rule of data.pricingRules) {
      if (!rule.condition.trim()) {
        errors.push('Pricing rule condition cannot be empty');
      }
    }
  }

  // Validate volume tiers
  if ('volumeTiers' in data && data.volumeTiers) {
    if (data.volumeTiers.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_VOLUME_TIERS) {
      errors.push(`Cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_VOLUME_TIERS} volume tiers`);
    }

    for (const tier of data.volumeTiers) {
      if (tier.minVolume < 0) {
        errors.push('Tier minimum volume cannot be negative');
      }
      if (tier.maxVolume !== undefined && tier.maxVolume < tier.minVolume) {
        errors.push('Tier maximum volume cannot be less than minimum volume');
      }
    }
  }

  // Validate change reason
  if ('changeReason' in data && data.changeReason && data.changeReason.trim()) {
    const trimmed = data.changeReason.trim();
    if (trimmed.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_CHANGE_REASON_LENGTH) {
      errors.push(`Change reason cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_CHANGE_REASON_LENGTH} characters`);
    }
  }

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate approval notes
  if ('approvalNotes' in data && data.approvalNotes && data.approvalNotes.trim()) {
    const trimmed = data.approvalNotes.trim();
    if (trimmed.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_APPROVAL_NOTES_LENGTH) {
      errors.push(`Approval notes cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_APPROVAL_NOTES_LENGTH} characters`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${CUSTOMER_MARGINS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter(tag => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  return errors;
}

/**
 * Format customer margin display name
 */
export function formatCustomerMarginDisplayName(margin: { name: string; status?: string }): string {
  const statusBadge = margin.status ? ` [${margin.status}]` : '';
  return `${margin.name}${statusBadge}`;
}

/**
 * Generate unique margin ID
 */
export function generateMarginId(customerId: string, serviceType: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
  return `MGN-${serviceType.toUpperCase()}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Check if margin is editable
 */
export function isCustomerMarginEditable(margin: { status: string; deletedAt?: number }): boolean {
  if (margin.deletedAt) return false;
  return margin.status === 'draft' || margin.status === 'pending_approval';
}

/**
 * Check if margin is currently active
 */
export function isCustomerMarginActive(margin: { status: string; effectiveFrom: number; effectiveTo?: number }): boolean {
  if (margin.status !== 'active') return false;

  const now = Date.now();

  if (margin.effectiveFrom > now) return false;
  if (margin.effectiveTo && margin.effectiveTo < now) return false;

  return true;
}

/**
 * Calculate margin amount
 */
export function calculateMarginAmount(cost: number, marginPercentage: number): number {
  return cost * (marginPercentage / 100);
}

/**
 * Calculate price with margin
 */
export function calculatePriceWithMargin(cost: number, marginPercentage: number): number {
  return cost + calculateMarginAmount(cost, marginPercentage);
}

/**
 * Determine applicable volume tier
 */
export function getApplicableVolumeTier(volume: number, tiers: Array<{ minVolume: number; maxVolume?: number; marginPercentage: number }>): number | null {
  for (const tier of tiers) {
    if (volume >= tier.minVolume) {
      if (tier.maxVolume === undefined || volume <= tier.maxVolume) {
        return tier.marginPercentage;
      }
    }
  }
  return null;
}
