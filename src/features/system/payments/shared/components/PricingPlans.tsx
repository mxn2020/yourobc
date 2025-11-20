// src/features/system/payments/shared/components/PricingPlans.tsx
/**
 * Generic Pricing Plans Grid
 * 
 * Works with any payment provider
 */

import { PricingCard } from './PricingCard';
import { DEFAULT_PLANS } from '../../config/plans-config';
import type { PricingPlan } from '../../types';

interface PricingPlansProps {
  plans?: PricingPlan[];
  currentPlanId?: string;
  onSelectPlan?: (planId: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function PricingPlans({ 
  plans = DEFAULT_PLANS,
  currentPlanId,
  onSelectPlan,
  isLoading = false,
}: PricingPlansProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Choose the perfect plan for your needs
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlanId === plan.id}
            onSelectPlan={onSelectPlan}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600">
          All plans include 24/7 support. No hidden fees.{' '}
          <a href="/contact" className="text-blue-600 hover:underline">
            Contact us
          </a>{' '}
          for custom enterprise solutions.
        </p>
      </div>
    </div>
  );
}