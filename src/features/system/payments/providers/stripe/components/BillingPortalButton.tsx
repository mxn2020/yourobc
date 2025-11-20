// src/features/boilerplate/payments/providers/stripe/components/BillingPortalButton.tsx
/**
 * Billing Portal Button Component
 *
 * Button to access Stripe's hosted billing portal
 */

import { Button } from '@/components/ui';
import { useStripeBillingPortal } from '../hooks/useStripeBillingPortal';
import { Settings } from 'lucide-react';

interface BillingPortalButtonProps {
  label?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  returnUrl?: string;
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Button component for accessing Stripe billing portal
 *
 * The billing portal allows customers to:
 * - Update payment methods
 * - View invoices
 * - Manage subscriptions
 * - Update billing details
 *
 * @example
 * ```tsx
 * <BillingPortalButton
 *   label="Manage Billing"
 *   variant="outline"
 * />
 * ```
 */
export function BillingPortalButton({
  label = 'Manage Billing',
  variant = 'outline',
  size = 'md',
  returnUrl,
  className,
  onSuccess,
  onError,
}: BillingPortalButtonProps) {
  const { openBillingPortal, isOpening, error, hasCustomer } = useStripeBillingPortal();

  const handleClick = async () => {
    const result = await openBillingPortal(returnUrl);

    if (result.success && result.url) {
      // Redirect to billing portal
      window.location.href = result.url;
      onSuccess?.();
    } else if (result.error) {
      console.error('Billing portal error:', result.error);
      onError?.(result.error);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isOpening || !hasCustomer}
        variant={variant}
        size={size}
        className={className}
      >
        {isOpening ? (
          'Loading...'
        ) : (
          <>
            <Settings className="mr-2 h-4 w-4" />
            {label}
          </>
        )}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
