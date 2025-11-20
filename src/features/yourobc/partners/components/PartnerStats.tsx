// src/features/yourobc/partners/components/PartnerStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { usePartners } from '../hooks/usePartners'

export const PartnerStats: FC = () => {
  const { stats, isStatsLoading } = usePartners()

  if (isStatsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Calculate additional metrics
  const activeRate = stats.totalPartners > 0
    ? Math.round((stats.activePartners / stats.totalPartners) * 100)
    : 0

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPartners}</div>
                <div className="text-sm text-gray-600">Total Partners</div>
              </div>
              <div className="text-3xl">🤝</div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">
                {stats.activePartners} active
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.partnersByServiceType?.OBC || 0}
                </div>
                <div className="text-sm text-gray-600">OBC Partners</div>
              </div>
              <div className="text-3xl">🚶‍♂️</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              On Board Courier services
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.partnersByServiceType?.NFO || 0}
                </div>
                <div className="text-sm text-gray-600">NFO Partners</div>
              </div>
              <div className="text-3xl">✈️</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Next Flight Out services
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgQuotesPerPartner.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Quotes/Partner</div>
              </div>
              <div className="text-3xl">📋</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.avgQuotesPerPartner.toFixed(1)} per partner
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: 3 List Metrics + Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* List Metric 1: By Service Type */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Service Type</h3>
            <div className="space-y-2">
              {Object.entries(stats.partnersByServiceType || {})
                .sort(([, a], [, b]) => b - a)
                .map(([serviceType, count]) => (
                  <div key={serviceType} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{serviceType}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* List Metric 2: By Country */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Countries</h3>
            <div className="space-y-2">
              {Object.entries(stats.partnersByCountry || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([country, count]) => (
                  <div key={country} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{country}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* List Metric 3: By Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Active</span>
                <Badge variant="success" size="sm">
                  {stats.activePartners}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Inactive</span>
                <Badge variant="warning" size="sm">
                  {stats.totalPartners - stats.activePartners}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Network Summary</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-blue-700 mb-1">Active Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {activeRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Selection Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.avgQuotesPerPartner.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Network Size</div>
                <div className="text-sm font-semibold text-blue-900">
                  {stats.totalPartners} partners
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}