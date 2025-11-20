// src/features/boilerplate/payments/providers/autumn-betterauth/hooks/useAutumnFeatureAccess.ts
/**
 * Autumn Feature Access Hook
 */

import { useAutumnCustomer } from './useAutumnCustomer';
import type { FeatureAccess } from '../../../types';

export function useAutumnFeatureAccess(featureKey: string): FeatureAccess & { isLoading: boolean } {
  const { customer, isLoading } = useAutumnCustomer();

  // Check if feature is accessible
  const featureData = customer?.features?.[featureKey];

  if (!featureData) {
    return {
      hasAccess: false,
      reason: 'Feature not found in subscription',
      isLoading,
    };
  }

  // Determine access based on Autumn's CustomerFeature structure
  const hasUnlimitedAccess = featureData.unlimited === true;
  const currentUsage = featureData.usage || 0;
  const usageLimit = featureData.usage_limit;
  const balance = featureData.balance ?? 0;
  
  // Feature is accessible if:
  // 1. It's unlimited, OR
  // 2. Balance is positive (for credit-based features), OR
  // 3. Usage hasn't exceeded the limit
  const hasAccess = 
    hasUnlimitedAccess || 
    balance > 0 || 
    (usageLimit !== undefined && currentUsage < usageLimit);

  const limit = hasUnlimitedAccess ? undefined : (usageLimit ?? featureData.included_usage);
  const remaining = hasUnlimitedAccess 
    ? undefined 
    : (balance ?? (limit !== undefined ? Math.max(0, limit - currentUsage) : undefined));

  return {
    hasAccess,
    reason: hasAccess ? undefined : 'Usage limit exceeded',
    currentUsage,
    limit,
    remaining,
    isLoading,
  };
}