// src/features/boilerplate/payments/providers/autumn-betterauth/hooks/useAutumnUsage.ts
/**
 * Autumn Usage Tracking Hook
 */

import { useCallback } from 'react';
import { useAutumnCustomer } from './useAutumnCustomer';
import type { UsageStats } from '../../../types';

export function useAutumnUsage() {
  const { customer, track } = useAutumnCustomer();

  const trackUsage = useCallback(
    async (featureKey: string, quantity: number = 1) => {
      try {
        await track({
          featureId: featureKey,
          value: quantity,
        });
      } catch (error) {
        console.error('Failed to track usage:', error);
        throw error;
      }
    },
    [track]
  );

  /**
   * Get usage stats for a single feature
   * @param featureKey - The feature key to get stats for
   * @returns UsageStats for the specified feature
   */
  const getSingleFeatureUsage = useCallback(
    (featureKey: string): UsageStats => {
      if (!customer?.features) {
        return {
          featureKey,
          currentUsage: 0,
          limit: undefined,
          remaining: undefined,
        };
      }

      const feature = customer.features[featureKey] as any;
      const currentUsage = feature?.usage || 0;
      const usageLimit = feature?.usage_limit;
      const isUnlimited = feature?.unlimited === true;
      const balance = feature?.balance ?? 0;

      // Calculate limit (prioritize usage_limit, fall back to included_usage if available)
      const limit = isUnlimited ? undefined : (usageLimit ?? feature?.included_usage);
      const remaining = isUnlimited
        ? undefined
        : (balance ?? (limit !== undefined ? Math.max(0, limit - currentUsage) : undefined));

      return {
        featureKey,
        currentUsage,
        limit,
        remaining,
      };
    },
    [customer]
  );

  /**
   * Get usage stats for all features
   * @returns Record of all features with their usage stats
   */
  const getAllFeatureUsage = useCallback(
    (): Record<string, UsageStats> => {
      if (!customer?.features) {
        return {};
      }

      const stats: Record<string, UsageStats> = {};
      Object.entries(customer.features).forEach(([key, feature]: [string, any]) => {
        const currentUsage = feature.usage || 0;
        const usageLimit = feature.usage_limit;
        const isUnlimited = feature.unlimited === true;
        const balance = feature.balance ?? 0;

        const limit = isUnlimited ? undefined : (usageLimit ?? feature.included_usage);
        const remaining = isUnlimited
          ? undefined
          : (balance ?? (limit !== undefined ? Math.max(0, limit - currentUsage) : undefined));

        stats[key] = {
          featureKey: key,
          currentUsage,
          limit,
          remaining,
        };
      });
      return stats;
    },
    [customer]
  );

  return {
    trackUsage,
    getSingleFeatureUsage,
    getAllFeatureUsage,
  };
}