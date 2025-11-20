// src/features/system/payments/providers/autumn-convex/components/BillingPortalButton.tsx
/**
 * Billing Portal Button
 */

import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/features/system/auth';
import { Button } from '@/components/ui';
import { useState } from 'react';

interface BillingPortalButtonProps {
  children?: React.ReactNode;
  className?: string;
  returnUrl?: string;
}

export function BillingPortalButton({
  children = 'Manage Billing',
  className,
  returnUrl = window.location.origin + '/billing',
}: BillingPortalButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const billingPortalAction = useAction(api.autumn.billingPortal);

  const handleClick = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await billingPortalAction({
        returnUrl,
      });

      if (result.data && "url" in result.data && result.data.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} variant="outline" className={className} disabled={isLoading}>
      {isLoading ? 'Loading...' : children}
    </Button>
  );
}