// src/features/yourobc/accounting/components/CashFlowForecast.tsx

import { FC, useMemo } from 'react'

interface CashFlowForecastProps {
  data?: {
    dailyFlow: Array<{
      date: number
      incoming: number
      outgoing: number
      net: number
    }>
    totalIncoming: number
    totalOutgoing: number
    netFlow: number
    currency: 'EUR' | 'USD'
  } | null
  days?: number
  compact?: boolean
}

export const CashFlowForecast: FC<CashFlowForecastProps> = ({
  data,
  days = 30,
  compact = false,
}) => {
  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (timestamp: number, format: 'short' | 'long' = 'short') => {
    const date = new Date(timestamp)
    if (format === 'short') {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
    }
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  }

  // Calculate weekly aggregates for better visualization
  const weeklyData = useMemo(() => {
    const weeks: Array<{
      weekStart: number
      weekEnd: number
      incoming: number
      outgoing: number
      net: number
    }> = []

    for (let i = 0; i < data.dailyFlow.length; i += 7) {
      const week = data.dailyFlow.slice(i, Math.min(i + 7, data.dailyFlow.length))

      weeks.push({
        weekStart: week[0].date,
        weekEnd: week[week.length - 1].date,
        incoming: week.reduce((sum, day) => sum + day.incoming, 0),
        outgoing: week.reduce((sum, day) => sum + day.outgoing, 0),
        net: week.reduce((sum, day) => sum + day.net, 0),
      })
    }

    return weeks
  }, [data.dailyFlow])

  // Find max value for chart scaling
  const maxValue = Math.max(
    ...weeklyData.map((w) => Math.max(w.incoming, w.outgoing)),
    1 // Prevent division by zero
  )

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cash Flow Forecast</h3>
          <div className="text-sm text-gray-600">Next {days} days</div>
        </div>
        <div className="text-3xl">📈</div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Expected Incoming</div>
          <div className="text-xl font-semibold text-green-600">
            {formatCurrency(data.totalIncoming, data.currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Expected Outgoing</div>
          <div className="text-xl font-semibold text-red-600">
            {formatCurrency(data.totalOutgoing, data.currency)}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Net Flow</div>
          <div
            className={`text-xl font-bold ${data.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatCurrency(data.netFlow, data.currency)}
          </div>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      {!compact && weeklyData.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-4">Weekly Breakdown</div>
          <div className="space-y-3">
            {weeklyData.map((week, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                  </span>
                  <span
                    className={`font-semibold ${week.net >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {week.net >= 0 ? '+' : ''}
                    {formatCurrency(week.net, data.currency)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {/* Incoming bar */}
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-green-500 flex items-center justify-end pr-2 text-xs text-white font-medium"
                        style={{
                          width: `${(week.incoming / maxValue) * 100}%`,
                          minWidth: week.incoming > 0 ? '40px' : '0',
                        }}
                      >
                        {week.incoming > 0 && `${(week.incoming / 1000).toFixed(0)}k`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">In</div>
                  </div>

                  {/* Outgoing bar */}
                  <div className="flex-1">
                    <div className="h-8 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-red-500 flex items-center justify-end pr-2 text-xs text-white font-medium"
                        style={{
                          width: `${(week.outgoing / maxValue) * 100}%`,
                          minWidth: week.outgoing > 0 ? '40px' : '0',
                        }}
                      >
                        {week.outgoing > 0 && `${(week.outgoing / 1000).toFixed(0)}k`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Out</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Indicator */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Trend</div>
          <div className="flex items-center gap-2">
            {data.netFlow > 0 ? (
              <>
                <span className="text-lg">📈</span>
                <span className="text-sm font-semibold text-green-600">Positive</span>
              </>
            ) : data.netFlow < 0 ? (
              <>
                <span className="text-lg">📉</span>
                <span className="text-sm font-semibold text-red-600">Negative</span>
              </>
            ) : (
              <>
                <span className="text-lg">➡️</span>
                <span className="text-sm font-semibold text-gray-600">Neutral</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {!compact && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">Insights</div>
          <div className="text-xs text-gray-600 space-y-1">
            {data.netFlow > 0 && (
              <div className="text-green-700">
                ✓ Positive cash flow expected over the next {days} days
              </div>
            )}
            {data.netFlow < 0 && (
              <div className="text-red-700">
                ⚠ Negative cash flow expected - consider payment scheduling
              </div>
            )}
            {data.totalIncoming === 0 && (
              <div className="text-yellow-700">
                ⚠ No incoming payments expected - follow up on receivables
              </div>
            )}
            {data.totalOutgoing === 0 && data.totalIncoming > 0 && (
              <div className="text-blue-700">• Strong cash position with no major outflows</div>
            )}
            {data.totalOutgoing > data.totalIncoming && (
              <div className="text-orange-700">
                • Outflows exceed inflows by {formatCurrency(Math.abs(data.netFlow), data.currency)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
