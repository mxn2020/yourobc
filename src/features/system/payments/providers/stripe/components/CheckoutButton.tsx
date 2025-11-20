// src/features/boilerplate/payments/providers/stripe/components/CheckoutButton.tsx
/**
 * Checkout Button Component
 *
 * Button to initiate Stripe checkout (subscription or one-time payment)
 */

import { Button } from '@/components/ui';
import { useStripeCheckout } from '../hooks/useStripeCheckout';
import { CreditCard } from 'lucide-react';

interface CheckoutButtonProps {
  priceId?: string; // For subscriptions
  amount?: number; // For one-time payments (in cents)
  currency?: string;
  description?: string;
  label?: string;
  variant?: 'primary' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  successUrl?: string;
  cancelUrl?: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * Button component for initiating Stripe checkout
 *
 * @example
 * ```tsx
 * // Subscription checkout
 * <CheckoutButton
 *   priceId="price_xxx"
 *   label="Subscribe Now"
 *   trialPeriodDays={14}
 * />
 *
 * // One-time payment checkout
 * <CheckoutButton
 *   amount={9900} // $99.00
 *   currency="usd"
 *   description="Premium Feature"
 *   label="Buy Now"
 * />
 * ```
 */
export function CheckoutButton({
  priceId,
  amount,
  currency,
  description,
  label,
  variant = 'primary',
  size = 'md',
  successUrl,
  cancelUrl,
  trialPeriodDays,
  metadata,
  onSuccess,
  onError,
}: CheckoutButtonProps) {
  const { createSubscriptionCheckout, createPaymentCheckout, isCreating, error } =
    useStripeCheckout();

  const isSubscription = !!priceId;
  const isPayment = !!amount;

  const handleClick = async () => {
    let result;

    if (isSubscription) {
      // Create subscription checkout
      result = await createSubscriptionCheckout({
        priceId,
        successUrl,
        cancelUrl,
        trialPeriodDays,
        metadata,
      });
    } else if (isPayment) {
      // Create one-time payment checkout
      result = await createPaymentCheckout({
        amount,
        currency,
        description,
        successUrl,
        cancelUrl,
        metadata,
      });
    } else {
      console.error('Either priceId or amount must be provided');
      return;
    }

    if (result.success && result.url) {
      // Redirect to Stripe checkout
      window.location.href = result.url;
      onSuccess?.();
    } else if (result.error) {
      console.error('Checkout error:', result.error);
      onError?.(result.error);
    }
  };

  // Determine button text
  const buttonText =
    label ||
    (isSubscription
      ? trialPeriodDays
        ? `Start ${trialPeriodDays}-Day Trial`
        : 'Subscribe'
      : 'Buy Now');

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isCreating || (!priceId && !amount)}
        variant={variant}
        size={size}
      >
        {isCreating ? (
          'Loading...'
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {buttonText}
          </>
        )}
      </Button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
