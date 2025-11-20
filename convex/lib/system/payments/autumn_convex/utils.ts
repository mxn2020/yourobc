// convex/lib/boilerplate/payments/autumn_convex/utils.ts

/**
 * Autumn Convex Utilities
 *
 * Validation and helper functions for Autumn payment integration module
 */

import { AUTUMN_CONSTANTS } from './constants';
import type { SyncSubscriptionData, TrackUsageData } from './types';

// ============================================
// Subscription Validation
// ============================================

/**
 * Validate sync subscription data
 */
export function validateSyncSubscriptionData(data: Partial<SyncSubscriptionData>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.planId || !data.planId.trim()) {
    errors.push('Plan ID is required');
  }

  if (!data.planName || !data.planName.trim()) {
    errors.push('Plan name is required');
  } else if (data.planName.length > AUTUMN_CONSTANTS.LIMITS.MAX_PLAN_NAME_LENGTH) {
    errors.push(
      `Plan name must be ${AUTUMN_CONSTANTS.LIMITS.MAX_PLAN_NAME_LENGTH} characters or less`
    );
  }

  if (!data.planType) {
    errors.push('Plan type is required');
  }

  if (!data.status) {
    errors.push('Status is required');
  }

  return errors;
}

// ============================================
// Usage Validation
// ============================================

/**
 * Validate track usage data
 */
export function validateTrackUsageData(data: Partial<TrackUsageData>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.featureKey || !data.featureKey.trim()) {
    errors.push('Feature key is required');
  } else if (data.featureKey.length > AUTUMN_CONSTANTS.LIMITS.MAX_FEATURE_KEY_LENGTH) {
    errors.push(
      `Feature key must be ${AUTUMN_CONSTANTS.LIMITS.MAX_FEATURE_KEY_LENGTH} characters or less`
    );
  }

  if (data.quantity === undefined || data.quantity === null) {
    errors.push('Quantity is required');
  } else if (data.quantity < 0) {
    errors.push('Quantity must be non-negative');
  }

  // Optional fields validation
  if (data.unit && data.unit.length > AUTUMN_CONSTANTS.LIMITS.MAX_UNIT_LENGTH) {
    errors.push(`Unit must be ${AUTUMN_CONSTANTS.LIMITS.MAX_UNIT_LENGTH} characters or less`);
  }

  if (data.context && data.context.length > AUTUMN_CONSTANTS.LIMITS.MAX_CONTEXT_LENGTH) {
    errors.push(
      `Context must be ${AUTUMN_CONSTANTS.LIMITS.MAX_CONTEXT_LENGTH} characters or less`
    );
  }

  return errors;
}
