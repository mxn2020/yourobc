// src/features/boilerplate/payments/providers/autumn-betterauth/components/BillingPortalButton.tsx
/**
 * Billing Portal Button
 * 
 * Opens the Autumn billing portal for managing subscription
 */

import { useAutumnCustomer } from '../hooks';
import { Button } from '@/components/ui';

interface BillingPortalButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function BillingPortalButton({
  children = 'Manage Billing',
  className,
}: BillingPortalButtonProps) {
  const { openBillingPortal } = useAutumnCustomer();

  return (
    <Button
      onClick={() => openBillingPortal()}
      variant="outline"
      className={className}
    >
      {children}
    </Button>
  );
}