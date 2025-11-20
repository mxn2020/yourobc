// src/features/yourobc/quotes/components/QuoteStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useQuotes } from '../hooks/useQuotes'
import { CURRENCY_SYMBOLS } from '../types'

export const QuoteStats: FC = () => {
  const { stats, isStatsLoading } = useQuotes()

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

  const formatCurrency = (value: { amount: number; currency: 'EUR' | 'USD' }) => {
    const symbol = CURRENCY_SYMBOLS[value.currency]
    return `${symbol}${value.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</div>
                <div className="text-sm text-gray-600">Total Quotes</div>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">
                {stats.pendingQuotes} pending
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.acceptedQuotes}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.rejectedQuotes} rejected
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalQuoteValue)}
                </div>
                <div className="text-sm text-gray-600">Total Value</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <div className="mt-2">
              <Badge variant="success" size="sm">
                {formatCurrency(stats.averageQuoteValue)} avg
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.expiredQuotes}</div>
                <div className="text-sm text-gray-600">Expired</div>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Needs follow-up
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: 3 List Metrics + Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* List Metric 1: By Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Sent</span>
                <Badge variant="primary" size="sm">
                  {stats.quotesByStatus?.sent || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Accepted</span>
                <Badge variant="success" size="sm">
                  {stats.acceptedQuotes}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Rejected</span>
                <Badge variant="danger" size="sm">
                  {stats.rejectedQuotes}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Expired</span>
                <Badge variant="warning" size="sm">
                  {stats.expiredQuotes}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* List Metric 2: By Service Type */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Service Type</h3>
            <div className="space-y-2">
              {Object.entries(stats.quotesByServiceType || {})
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

        {/* List Metric 3: By Customer (Top 4) */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Priority</h3>
            <div className="space-y-2">
              {Object.entries(stats.quotesByPriority || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 4)
                .map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 truncate max-w-[120px] capitalize">{priority}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Quote Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-blue-700 mb-1">Conversion Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.conversionRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Acceptance Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.totalQuotes > 0
                    ? Math.round((stats.acceptedQuotes / stats.totalQuotes) * 100)
                    : 0}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Total Pipeline</div>
                <div className="text-sm font-semibold text-blue-900">
                  {formatCurrency(stats.totalQuoteValue)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}