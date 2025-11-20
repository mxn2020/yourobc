// convex/lib/boilerplate/payments/payments/utils.ts
// Validation and helper functions for payments module

import { PAYMENTS_CONSTANTS } from './constants';
import type {
  CreateSubscriptionData,
  UpdateSubscriptionData,
  TrackUsageData,
  Subscription,
  SubscriptionUsage,
  SubscriptionLimits,
  FeatureAccessCheck,
} from './types';

// ============================================
// Subscription Validation
// ============================================

/**
 * Validate create subscription data
 */
export function validateCreateSubscriptionData(
  data: Partial<CreateSubscriptionData>
): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.name || !data.name.trim()) {
    errors.push('Subscription name is required');
  } else if (data.name.length < PAYMENTS_CONSTANTS.LIMITS.MIN_PLAN_NAME_LENGTH) {
    errors.push(
      `Subscription name must be at least ${PAYMENTS_CONSTANTS.LIMITS.MIN_PLAN_NAME_LENGTH} character`
    );
  } else if (data.name.length > PAYMENTS_CONSTANTS.LIMITS.MAX_PLAN_NAME_LENGTH) {
    errors.push(
      `Subscription name must be ${PAYMENTS_CONSTANTS.LIMITS.MAX_PLAN_NAME_LENGTH} characters or less`
    );
  }

  if (!data.planId || !data.planId.trim()) {
    errors.push('Plan ID is required');
  }

  if (!data.planType) {
    errors.push('Plan type is required');
  }

  if (!data.status) {
    errors.push('Subscription status is required');
  }

  // Optional field validation
  if (data.description && data.description.length > PAYMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(
      `Description must be ${PAYMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`
    );
  }

  return errors;
}

/**
 * Validate update subscription data
 */
export function validateUpdateSubscriptionData(
  data: Partial<UpdateSubscriptionData>
): string[] {
  const errors: string[] = [];

  // Name validation (if provided)
  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Subscription name cannot be empty');
    } else if (data.name.length < PAYMENTS_CONSTANTS.LIMITS.MIN_PLAN_NAME_LENGTH) {
      errors.push(
        `Subscription name must be at least ${PAYMENTS_CONSTANTS.LIMITS.MIN_PLAN_NAME_LENGTH} character`
      );
    } else if (data.name.length > PAYMENTS_CONSTANTS.LIMITS.MAX_PLAN_NAME_LENGTH) {
      errors.push(
        `Subscription name must be ${PAYMENTS_CONSTANTS.LIMITS.MAX_PLAN_NAME_LENGTH} characters or less`
      );
    }
  }

  // Description validation (if provided)
  if (data.description !== undefined && data.description.length > PAYMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(
      `Description must be ${PAYMENTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`
    );
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
  } else if (data.featureKey.length > PAYMENTS_CONSTANTS.LIMITS.MAX_FEATURE_KEY_LENGTH) {
    errors.push(
      `Feature key must be ${PAYMENTS_CONSTANTS.LIMITS.MAX_FEATURE_KEY_LENGTH} characters or less`
    );
  } else if (!PAYMENTS_CONSTANTS.VALIDATION.FEATURE_KEY_PATTERN.test(data.featureKey)) {
    errors.push('Feature key must contain only alphanumeric characters, underscores, and hyphens');
  }

  if (data.quantity === undefined || data.quantity === null) {
    errors.push('Quantity is required');
  } else if (data.quantity < PAYMENTS_CONSTANTS.LIMITS.MIN_QUANTITY) {
    errors.push(`Quantity must be ${PAYMENTS_CONSTANTS.LIMITS.MIN_QUANTITY} or greater`);
  }

  // Optional fields validation
  if (data.unit && data.unit.length > PAYMENTS_CONSTANTS.LIMITS.MAX_UNIT_LENGTH) {
    errors.push(`Unit must be ${PAYMENTS_CONSTANTS.LIMITS.MAX_UNIT_LENGTH} characters or less`);
  }

  if (data.context && data.context.length > PAYMENTS_CONSTANTS.LIMITS.MAX_CONTEXT_LENGTH) {
    errors.push(
      `Context must be ${PAYMENTS_CONSTANTS.LIMITS.MAX_CONTEXT_LENGTH} characters or less`
    );
  }

  return errors;
}

// ============================================
// Subscription Helper Functions
// ============================================

/**
 * Check if subscription is active or trialing
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  return (
    subscription.status === PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE ||
    subscription.status === PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING
  );
}

/**
 * Check if subscription has feature access
 */
export function hasFeatureAccess(
  subscription: Subscription,
  featureKey: string
): FeatureAccessCheck {
  // Check subscription status
  if (!isSubscriptionActive(subscription)) {
    return {
      hasAccess: false,
      reason: `Subscription is ${subscription.status}`,
    };
  }

  // Check feature list
  const features = subscription.features || [];
  if (!features.includes(featureKey)) {
    return {
      hasAccess: false,
      reason: 'Feature not included in plan',
    };
  }

  // Check usage limits
  const limits = subscription.limits || {};
  const usage = subscription.usage || {};

  const limit = limits[featureKey as keyof typeof limits];
  const currentUsage = usage[featureKey as keyof typeof usage] || 0;

  if (limit !== undefined && typeof currentUsage === 'number' && currentUsage >= limit) {
    return {
      hasAccess: false,
      reason: 'Usage limit exceeded',
      currentUsage,
      limit,
      remaining: 0,
    };
  }

  return {
    hasAccess: true,
    currentUsage: typeof currentUsage === 'number' ? currentUsage : 0,
    limit,
    remaining:
      limit !== undefined && typeof currentUsage === 'number'
        ? limit - currentUsage
        : undefined,
  };
}

/**
 * Check if usage limit is exceeded
 */
export function isUsageLimitExceeded(
  subscription: Subscription,
  featureKey: string
): boolean {
  const usage = subscription.usage || {};
  const limits = subscription.limits || {};

  const limit = limits[featureKey as keyof typeof limits];
  const currentUsage = usage[featureKey as keyof typeof usage] || 0;

  if (limit === undefined) {
    return false;
  }

  return typeof currentUsage === 'number' && currentUsage >= limit;
}

/**
 * Calculate remaining usage for a feature
 */
export function calculateRemainingUsage(
  subscription: Subscription,
  featureKey: string
): number | undefined {
  const usage = subscription.usage || {};
  const limits = subscription.limits || {};

  const limit = limits[featureKey as keyof typeof limits];
  const currentUsage = usage[featureKey as keyof typeof usage] || 0;

  if (limit === undefined || typeof currentUsage !== 'number') {
    return undefined;
  }

  return Math.max(0, limit - currentUsage);
}

/**
 * Initialize default usage object
 */
export function initializeDefaultUsage(): SubscriptionUsage {
  return {
    ...PAYMENTS_CONSTANTS.DEFAULT_VALUES.USAGE,
    lastResetAt: Date.now(),
  };
}

/**
 * Initialize default limits object
 */
export function initializeDefaultLimits(): SubscriptionLimits {
  return {
    ...PAYMENTS_CONSTANTS.DEFAULT_VALUES.LIMITS,
  };
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export function isSubscriptionExpiringSoon(subscription: Subscription): boolean {
  if (!subscription.currentPeriodEnd) {
    return false;
  }

  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  return subscription.currentPeriodEnd - now < sevenDays && subscription.currentPeriodEnd > now;
}

/**
 * Check if trial is ending soon (within 3 days)
 */
export function isTrialEndingSoon(subscription: Subscription): boolean {
  if (!subscription.trialEndDate || subscription.status !== PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING) {
    return false;
  }

  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;

  return subscription.trialEndDate - now < threeDays && subscription.trialEndDate > now;
}

/**
 * Get subscription status color
 */
export function getSubscriptionStatusColor(status: string): string {
  switch (status) {
    case PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE:
      return 'green';
    case PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING:
      return 'blue';
    case PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.PAST_DUE:
      return 'orange';
    case PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.CANCELLED:
      return 'red';
    case PAYMENTS_CONSTANTS.SUBSCRIPTION_STATUS.INACTIVE:
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Format usage percentage
 */
export function formatUsagePercentage(currentUsage: number, limit?: number): string {
  if (limit === undefined || limit === 0) {
    return 'Unlimited';
  }

  const percentage = Math.min(100, (currentUsage / limit) * 100);
  return `${percentage.toFixed(1)}%`;
}

/**
 * Get usage level (low, medium, high, critical)
 */
export function getUsageLevel(currentUsage: number, limit?: number): string {
  if (limit === undefined) {
    return 'unlimited';
  }

  const percentage = (currentUsage / limit) * 100;

  if (percentage >= 100) return 'critical';
  if (percentage >= 80) return 'high';
  if (percentage >= 50) return 'medium';
  return 'low';
}
