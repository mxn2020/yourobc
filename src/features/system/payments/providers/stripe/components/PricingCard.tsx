// src/features/system/payments/providers/stripe/components/PricingCard.tsx
/**
 * Pricing Card Component
 *
 * Displays a pricing plan with features and checkout button
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@/components/ui';
import { CheckoutButton } from './CheckoutButton';
import { Check } from 'lucide-react';
import type { SubscriptionPlan } from '../types';

interface PricingCardProps {
  plan: SubscriptionPlan;
  featured?: boolean;
  trialPeriodDays?: number;
  successUrl?: string;
  cancelUrl?: string;
  className?: string;
}

/**
 * Card component for displaying a pricing plan
 *
 * @example
 * ```tsx
 * const plan = {
 *   id: 'pro',
 *   name: 'Pro Plan',
 *   description: 'For growing businesses',
 *   price: 2900, // $29.00
 *   currency: 'usd',
 *   interval: 'month',
 *   stripePriceId: 'price_xxx',
 *   active: true,
 *   features: [
 *     'Unlimited projects',
 *     'Priority support',
 *     'Advanced analytics',
 *   ],
 * };
 *
 * <PricingCard
 *   plan={plan}
 *   featured={true}
 *   trialPeriodDays={14}
 * />
 * ```
 */
export function PricingCard({
  plan,
  featured = false,
  trialPeriodDays,
  successUrl,
  cancelUrl,
  className,
}: PricingCardProps) {
  // Format price
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(price / 100);
  };

  // Format interval
  const formatInterval = (interval: string, count?: number) => {
    const countStr = count && count > 1 ? `${count} ` : '';
    return `${countStr}${interval}${count && count > 1 ? 's' : ''}`;
  };

  return (
    <Card
      className={`relative ${featured ? 'border-primary border-2 shadow-lg' : ''} ${className || ''}`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="primary">Most Popular</Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        {plan.description && (
          <CardDescription className="text-base">{plan.description}</CardDescription>
        )}

        {/* Price */}
        <div className="mt-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-gray-600">
              / {formatInterval(plan.interval, plan.intervalCount)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Features */}
        {plan.features && plan.features.length > 0 && (
          <div className="space-y-3">
            {plan.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Checkout Button */}
        {plan.active && plan.stripePriceId && (
          <CheckoutButton
            priceId={plan.stripePriceId}
            label={trialPeriodDays ? `Start ${trialPeriodDays}-Day Trial` : 'Subscribe'}
            variant={featured ? 'primary' : 'outline'}
            size="lg"
            trialPeriodDays={trialPeriodDays}
            successUrl={successUrl}
            cancelUrl={cancelUrl}
            metadata={{ planId: plan.id }}
          />
        )}

        {!plan.active && (
          <p className="text-sm text-gray-500 text-center">Not available</p>
        )}
      </CardContent>
    </Card>
  );
}
