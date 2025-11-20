// src/features/boilerplate/payments/providers/autumn-convex/components/PurchaseButton.tsx
/**
 * Autumn Convex Purchase Button
 */

import { useState } from 'react';
import { useAutumnConvexCheckout } from '../hooks';
import { Button } from '@/components/ui';

interface PurchaseButtonProps {
  planId: string;
  trialDays?: number;
  metadata?: Record<string, any>;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function PurchaseButton({
  planId,
  trialDays,
  metadata,
  children = 'Upgrade',
  className,
  disabled = false,
}: PurchaseButtonProps) {
  const { createCheckout } = useAutumnConvexCheckout();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await createCheckout({
        planId,
        trialDays,
        metadata,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      });

      if (result.url) {
        window.location.href = result.url;
      } else if (result.error) {
        console.error('Checkout error:', result.error);
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? 'Loading...' : children}
    </Button>
  );
}