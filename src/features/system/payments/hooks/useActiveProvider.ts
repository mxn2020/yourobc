// src/features/boilerplate/payments/shared/hooks/useActiveProvider.ts
/**
 * Hook to get the active payment provider
 */

import { useMemo } from 'react';
import { PAYMENT_CONFIG } from '../config/payment-config';
import type { PaymentProviderType } from '../types';

export function useActiveProvider(): PaymentProviderType | null {
  return useMemo(() => {
    return PAYMENT_CONFIG.primaryProvider;
  }, []);
}

export function useEnabledProviders(): PaymentProviderType[] {
  return useMemo(() => {
    return Object.entries(PAYMENT_CONFIG.enabledProviders)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type as PaymentProviderType);
  }, []);
}

export function useIsProviderEnabled(provider: PaymentProviderType): boolean {
  return useMemo(() => {
    return PAYMENT_CONFIG.enabledProviders[provider] === true;
  }, [provider]);
}