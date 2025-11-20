// src/features/system/payments/providers/autumn-betterauth/components/PurchaseButton.tsx
/**
 * Autumn Purchase Button Component
 * 
 * Simple button to upgrade to a plan
 */

import { useAutumnCheckout } from '../hooks';
import { Button } from '@/components/ui';
import type { CheckoutOptions } from '../../../types';

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
  const { createCheckout } = useAutumnCheckout();

  const handleClick = async () => {
    await createCheckout({
      planId,
      trialDays,
      metadata,
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
}