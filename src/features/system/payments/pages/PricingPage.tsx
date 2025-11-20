// src/features/system/payments/pages/PricingPage.tsx
/**
 * Provider-Agnostic Pricing Page
 * 
 * Works with any configured payment provider
 */

import { useState } from 'react'
import { Check } from 'lucide-react'
import { PricingPlans } from '../shared/components'
import { usePayments } from '../hooks/usePayments'
import { DEFAULT_PLANS } from '../config/plans-config'

export function PricingPage() {
  const { createCheckout, subscription, isLoading } = usePayments()
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const handleSelectPlan = async (planId: string) => {
    if (subscription?.planId === planId) {
      return // Already on this plan
    }

    setCheckoutLoading(true)
    try {
      const result = await createCheckout({
        planId,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/pricing`,
      })

      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900">
            Choose Your Perfect Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Start free, upgrade when you need more power
          </p>
        </div>
      </div>

      {/* Pricing Plans */}
      <PricingPlans
        currentPlanId={subscription?.planId}
        onSelectPlan={handleSelectPlan}
        isLoading={isLoading || checkoutLoading}
      />

      {/* Feature Comparison Table */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
          Compare Features
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Feature
                </th>
                {DEFAULT_PLANS.map((plan) => (
                  <th
                    key={plan.id}
                    className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">
                  AI Requests per month
                </td>
                {DEFAULT_PLANS.map((plan) => (
                  <td
                    key={plan.id}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {plan.limits?.aiRequests === 999999
                      ? 'Unlimited'
                      : plan.limits?.aiRequests || '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Projects</td>
                {DEFAULT_PLANS.map((plan) => (
                  <td
                    key={plan.id}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {plan.limits?.projects === 999999
                      ? 'Unlimited'
                      : plan.limits?.projects || '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Storage</td>
                {DEFAULT_PLANS.map((plan) => (
                  <td
                    key={plan.id}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {plan.limits?.storage === 999999
                      ? 'Unlimited'
                      : `${plan.limits?.storage || '-'} GB`}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Team Members
                </td>
                {DEFAULT_PLANS.map((plan) => (
                  <td
                    key={plan.id}
                    className="px-6 py-4 text-center text-sm text-gray-600"
                  >
                    {plan.limits?.teamMembers === 999999
                      ? 'Unlimited'
                      : plan.limits?.teamMembers || '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Can I change plans later?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                What payment methods do you accept?
              </h3>
              <p className="mt-2 text-gray-600">
                We accept all major credit cards and debit cards through our
                secure payment processor.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Is there a free trial?
              </h3>
              <p className="mt-2 text-gray-600">
                Yes! Paid plans include a 14-day free trial. No credit card
                required.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Can I cancel anytime?
              </h3>
              <p className="mt-2 text-gray-600">
                Absolutely. Cancel your subscription at any time with no
                penalties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Start your free trial today. No credit card required.
          </p>
          <a
            href="#pricing"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            Choose Your Plan
          </a>
        </div>
      </div>
    </div>
  )
}