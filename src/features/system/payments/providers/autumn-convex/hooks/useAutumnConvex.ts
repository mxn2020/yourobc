// src/features/system/payments/providers/autumn-convex/hooks/useAutumnConvex.ts
/**
 * Autumn Convex Hooks
 * 
 * Client-side hooks for Autumn + Convex integration
 */

import { useAction, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/features/system/auth';
import { useEffect, useState } from 'react';
import type { FeatureAccess, UsageStats, CheckoutOptions, CheckoutResult } from '../../../types';

/**
 * Hook to access Autumn customer data via Convex
 */
export function useAutumnConvexCustomer() {
  const { user } = useAuth();
  const createCustomerAction = useAction(api.autumn.createCustomer);
  const [customer, setCustomer] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCustomer = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get or create customer with expanded data
        const result = await createCustomerAction({
          expand: ['payment_method', 'invoices'],
          errorOnNotFound: false,
        });
        if (isMounted) {
          setCustomer(result.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch customer');
          setIsLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      isMounted = false;
    };
  }, [user?.id, createCustomerAction]);

  return {
    customer,
    subscription: customer?.subscription,
    features: customer?.features,
    isLoading,
    error,
    // Provide a way to manually refresh the data
    refresh: () => {
      if (user?.id) {
        setIsLoading(true);
        createCustomerAction({
          expand: ['payment_method', 'invoices'],
          errorOnNotFound: false,
        })
          .then((result) => setCustomer(result.data))
          .catch(err => setError(err instanceof Error ? err.message : 'Failed to fetch customer'))
          .finally(() => setIsLoading(false));
      }
    },
  };
}

/**
 * Hook for checkout operations
 */
export function useAutumnConvexCheckout() {
  const { user } = useAuth();
  const checkoutAction = useAction(api.autumn.checkout);

  const createCheckout = async (options: CheckoutOptions): Promise<CheckoutResult> => {
    if (!user?.id) {
      return { error: 'User not authenticated' };
    }

    try {
      const result = await checkoutAction({
        productId: options.planId,
        successUrl: options.successUrl,
        // Note: metadata is not supported by Autumn checkout, use checkoutSessionParams instead
      });

      // Handle Autumn API response format
      if (result.error) {
        return { error: typeof result.error === 'string' ? result.error : 'Checkout failed' };
      }

      if (result.data && 'url' in result.data) {
        return {
          url: result.data.url,
        };
      }

      return { error: 'Invalid checkout response' };
    } catch (error) {
      console.error('Checkout error:', error);
      return {
        error: error instanceof Error ? error.message : 'Checkout failed',
      };
    }
  };

  return {
    createCheckout,
  };
}

/**
 * Hook to check feature access
 */
export function useAutumnConvexFeatureAccess(featureKey: string): FeatureAccess & { isLoading: boolean; refresh: () => void } {
  const { user } = useAuth();
  const checkAction = useAction(api.autumn.check);
  const [accessCheck, setAccessCheck] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !featureKey) {
      setAccessCheck(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchAccessCheck = async () => {
      setIsLoading(true);
      try {
        const result = await checkAction({
          featureId: featureKey
        });
        if (isMounted) {
          setAccessCheck(result);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to check feature access:', err);
        if (isMounted) {
          setAccessCheck(null);
          setIsLoading(false);
        }
      }
    };

    fetchAccessCheck();

    return () => {
      isMounted = false;
    };
  }, [user?.id, featureKey, checkAction]);

  const refresh = () => {
    if (user?.id && featureKey) {
      setIsLoading(true);
      checkAction({ featureId: featureKey })
        .then(setAccessCheck)
        .catch(err => {
          console.error('Failed to check feature access:', err);
          setAccessCheck(null);
        })
        .finally(() => setIsLoading(false));
    }
  };

  if (isLoading || accessCheck === undefined) {
    return {
      hasAccess: false,
      isLoading: true,
      refresh,
    };
  }

  if (!accessCheck || !accessCheck.data) {
    return {
      hasAccess: false,
      reason: 'Feature not found',
      isLoading: false,
      refresh,
    };
  }

  return {
    hasAccess: accessCheck.data.allowed === true,
    reason: accessCheck.data.allowed ? undefined : accessCheck.data.reason,
    currentUsage: accessCheck.data.usage,
    limit: accessCheck.data.limit,
    remaining: accessCheck.data.remaining,
    isLoading: false,
    refresh,
  };
}

/**
 * Hook for usage tracking and querying
 */
export function useAutumnConvexUsage(featureKeys?: string | string[]) {
  const { user } = useAuth();
  const trackAction = useAction(api.autumn.track);
  const queryAction = useAction(api.autumn.query);
  const [usageData, setUsageData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !featureKeys) {
      setUsageData(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        const result = await queryAction({
          featureId: featureKeys,
        });
        if (isMounted) {
          setUsageData(result);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch usage:', err);
        if (isMounted) {
          setUsageData(null);
          setIsLoading(false);
        }
      }
    };

    fetchUsage();

    return () => {
      isMounted = false;
    };
  }, [user?.id, featureKeys, queryAction]);

  const trackUsage = async (featureKey: string, quantity: number = 1) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      await trackAction({
        featureId: featureKey,
        value: quantity,
      });

      // Refresh usage data after tracking if we're already tracking features
      if (featureKeys) {
        const result = await queryAction({
          featureId: featureKeys,
        });
        setUsageData(result);
      }
    } catch (error) {
      console.error('Failed to track usage:', error);
      throw error;
    }
  };

  const refreshUsage = async () => {
    if (!user?.id || !featureKeys) return;

    setIsLoading(true);
    try {
      const result = await queryAction({
        featureId: featureKeys,
      });
      setUsageData(result);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get usage stats for a single feature
   * @param featureKey - The feature key to get stats for
   * @returns UsageStats for the specified feature
   */
  const getSingleFeatureUsage = (featureKey: string): UsageStats => {
    if (!usageData?.data) {
      return {
        featureKey,
        currentUsage: 0,
        limit: undefined,
        remaining: undefined,
      };
    }

    const feature = usageData.data.features?.[featureKey];
    return {
      featureKey,
      currentUsage: feature?.usage || 0,
      limit: feature?.limit,
      remaining:
        feature?.limit !== undefined
          ? Math.max(0, feature.limit - (feature?.usage || 0))
          : undefined,
      resetAt: feature?.resetAt,
    };
  };

  /**
   * Get usage stats for all features
   * @returns Record of all features with their usage stats
   */
  const getAllFeatureUsage = (): Record<string, UsageStats> => {
    if (!usageData?.data) {
      return {};
    }

    const stats: Record<string, UsageStats> = {};
    if (usageData.data.features) {
      Object.entries(usageData.data.features).forEach(([key, feature]: [string, any]) => {
        stats[key] = {
          featureKey: key,
          currentUsage: feature.usage || 0,
          limit: feature.limit,
          remaining:
            feature.limit !== undefined
              ? Math.max(0, feature.limit - (feature.usage || 0))
              : undefined,
          resetAt: feature.resetAt,
        };
      });
    }
    return stats;
  };

  return {
    trackUsage,
    getSingleFeatureUsage,
    getAllFeatureUsage,
    usageData: usageData?.data,
    isLoading,
    refreshUsage,
  };
}