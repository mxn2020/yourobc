// src/features/system/payments/pages/BillingPage.tsx
/**
 * Provider-Agnostic Billing Page
 */

import { CreditCard, FileText, TrendingUp } from 'lucide-react'
import { Button, Section, SectionTitle, SectionContent } from '@/components/ui'
import { usePayments, useUsageTracking } from '../hooks'
import { useActiveProvider } from '../hooks/useActiveProvider'
import { UsageIndicator } from '../shared/components'

// Provider-specific components
import { SubscriptionStatus as AutumnSubscriptionStatus } from '../providers/autumn-betterauth/components'

export function BillingPage() {
  const { subscription, openBillingPortal, isLoading } = usePayments()
  const { getAllFeatureUsage } = useUsageTracking()
  const activeProvider = useActiveProvider()

  const usageStats = getAllFeatureUsage()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription, view usage, and update billing details
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Current Subscription */}
            <Section spacing="lg">
              <SectionTitle size="md" className="mb-4">
                Current Subscription
              </SectionTitle>
              <SectionContent>
                {activeProvider === 'autumn-betterauth' && (
                  <AutumnSubscriptionStatus />
                )}
                {/* Add other provider subscription components here */}
              </SectionContent>
            </Section>

            {/* Usage Stats */}
            {usageStats && typeof usageStats === 'object' && (
              <Section spacing="lg">
                <SectionTitle size="md" className="mb-4">
                  Usage Overview
                </SectionTitle>
                <SectionContent>
                  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                    {Object.entries(usageStats).map(([key, stats]) => (
                      <UsageIndicator
                        key={key}
                        stats={stats}
                        featureName={formatFeatureName(key)}
                        unit={getFeatureUnit(key)}
                      />
                    ))}
                  </div>
                </SectionContent>
              </Section>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            <Section spacing="md">
              <SectionTitle size="md" className="mb-4">
                Quick Actions
              </SectionTitle>
              <SectionContent>
                <div className="space-y-3">
                  <a
                    href="/pricing"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="rounded-full bg-blue-100 p-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">View Plans</p>
                      <p className="text-sm text-gray-600">
                        Upgrade or change plan
                      </p>
                    </div>
                  </a>

                  <Button
                    variant="ghost"
                    onClick={() => openBillingPortal()}
                    className="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="rounded-full bg-green-100 p-2">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        Manage Billing
                      </p>
                      <p className="text-sm text-gray-600">
                        Update payment info
                      </p>
                    </div>
                  </Button>
                </div>
              </SectionContent>
            </Section>

            {/* Need Help */}
            <Section spacing="md">
              <SectionTitle size="md" className="mb-4">
                Need Help?
              </SectionTitle>
              <SectionContent>
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-600">
                    Have questions about your subscription or billing?
                  </p>
                  <a
                    href="/contact"
                    className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
                  >
                    Contact Support →
                  </a>
                </div>
              </SectionContent>
            </Section>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatFeatureName(key: string): string {
  const names: Record<string, string> = {
    aiRequests: 'AI Requests',
    projects: 'Projects',
    storage: 'Storage',
    teamMembers: 'Team Members',
  }
  return names[key] || key
}

function getFeatureUnit(key: string): string {
  const units: Record<string, string> = {
    aiRequests: 'requests',
    projects: 'projects',
    storage: 'GB',
    teamMembers: 'members',
  }
  return units[key] || 'units'
}