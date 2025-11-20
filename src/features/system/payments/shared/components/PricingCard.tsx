// src/features/system/payments/shared/components/PricingCard.tsx
/**
 * Generic Pricing Card Component
 * 
 * Works with any payment provider
 */

import { Check } from 'lucide-react';
import { Button } from '@/components/ui';
import type { PricingPlan } from '../../types';

interface PricingCardProps {
  plan: PricingPlan;
  isCurrentPlan?: boolean;
  onSelectPlan?: (planId: string) => void | Promise<void>;
  isLoading?: boolean;
}

export function PricingCard({ 
  plan, 
  isCurrentPlan, 
  onSelectPlan,
  isLoading = false,
}: PricingCardProps) {
  const handleSelect = async () => {
    if (onSelectPlan) {
      await onSelectPlan(plan.id);
    }
  };

  return (
    <div
      className={`relative rounded-lg border-2 p-8 ${
        plan.isPopular
          ? 'border-blue-500 shadow-lg'
          : isCurrentPlan
          ? 'border-green-500'
          : 'border-gray-200'
      }`}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
          Most Popular
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-4 right-4 rounded-full bg-green-500 px-4 py-1 text-sm font-medium text-white">
          Current Plan
        </div>
      )}

      {/* Plan Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <p className="mt-2 text-sm text-gray-600">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="mb-6">
        <div className="flex items-baseline">
          <span className="text-5xl font-extrabold text-gray-900">
            {plan.displayPrice}
          </span>
          {plan.interval !== 'one_time' && (
            <span className="ml-2 text-xl text-gray-600">
              /{plan.intervalDisplay}
            </span>
          )}
        </div>
        {plan.trialDays && plan.trialDays > 0 && (
          <p className="mt-2 text-sm text-green-600">
            {plan.trialDays}-day free trial
          </p>
        )}
      </div>

      {/* CTA Button */}
      <div className="mb-6">
        {isCurrentPlan ? (
          <Button
            disabled
            className="w-full rounded-lg bg-gray-300 px-4 py-3 font-semibold text-gray-600 cursor-not-allowed"
          >
            Current Plan
          </Button>
        ) : (
          <Button
            onClick={handleSelect}
            disabled={isLoading}
            className={`w-full rounded-lg px-4 py-3 font-semibold ${
              plan.isPopular
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Loading...' : plan.ctaText}
          </Button>
        )}
      </div>

      {/* Features List */}
      <div className="space-y-3">
        {plan.features.map((feature, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${
              !feature.included ? 'opacity-50' : ''
            }`}
          >
            <Check
              className={`h-5 w-5 flex-shrink-0 ${
                feature.included ? 'text-green-500' : 'text-gray-400'
              }`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {feature.name}
              </p>
              {feature.description && (
                <p className="text-xs text-gray-600">{feature.description}</p>
              )}
              {feature.limit && (
                <p className="text-xs text-gray-600">
                  {feature.unlimited
                    ? 'Unlimited'
                    : `Up to ${feature.limit}`}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}