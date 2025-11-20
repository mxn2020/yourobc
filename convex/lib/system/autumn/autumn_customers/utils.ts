// convex/lib/boilerplate/autumn/autumn_customers/utils.ts
// Validation functions and utility helpers for autumn customers module

import { AUTUMN_CUSTOMERS_CONSTANTS, AUTUMN_SUBSCRIPTION_STATUS_NAMES } from './constants';
import type { CreateAutumnCustomerData, UpdateAutumnCustomerData } from './types';

/**
 * Validate autumn customer data for creation/update
 */
export function validateAutumnCustomerData(
  data: Partial<CreateAutumnCustomerData | UpdateAutumnCustomerData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < AUTUMN_CUSTOMERS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${AUTUMN_CUSTOMERS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > AUTUMN_CUSTOMERS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${AUTUMN_CUSTOMERS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!AUTUMN_CUSTOMERS_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate autumnCustomerId
  if ('autumnCustomerId' in data && data.autumnCustomerId !== undefined) {
    const trimmed = data.autumnCustomerId.trim();
    if (!trimmed) {
      errors.push('Autumn customer ID is required');
    }
  }

  return errors;
}

/**
 * Format autumn customer display name
 */
export function formatAutumnCustomerDisplayName(customer: { name: string; autumnCustomerId: string }): string {
  return `${customer.name} (${customer.autumnCustomerId})`;
}

/**
 * Get subscription status display name
 */
export function getSubscriptionStatusDisplayName(status: string): string {
  return AUTUMN_SUBSCRIPTION_STATUS_NAMES[status as keyof typeof AUTUMN_SUBSCRIPTION_STATUS_NAMES] || status;
}

/**
 * Check if customer needs sync
 */
export function needsSync(lastSyncedAt: number): boolean {
  const now = Date.now();
  return now - lastSyncedAt > AUTUMN_CUSTOMERS_CONSTANTS.LIMITS.SYNC_INTERVAL_MS;
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status?: string): boolean {
  return status === AUTUMN_CUSTOMERS_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE ||
         status === AUTUMN_CUSTOMERS_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING;
}

/**
 * Check if autumn customer is editable
 */
export function isAutumnCustomerEditable(customer: { deletedAt?: number }): boolean {
  return !customer.deletedAt;
}
