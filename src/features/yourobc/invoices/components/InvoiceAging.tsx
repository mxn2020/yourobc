// src/features/yourobc/invoices/components/InvoiceAging.tsx

import { FC } from 'react'
import { Card, Loading, Badge } from '@/components/ui'
import { useInvoiceAging } from '../hooks/useInvoices'
import { CURRENCY_SYMBOLS } from '../types'

interface InvoiceAgingProps {
  type?: 'incoming' | 'outgoing'
  title?: string
}

export const InvoiceAging: FC<InvoiceAgingProps> = ({ 
  type, 
  title = 'Invoice Aging Analysis' 
}) => {
  const { aging, isLoading, error } = useInvoiceAging(type)

  const formatCurrency = (amount: number, currency = 'EUR') => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  if (isLoading) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <div className="flex justify-center py-8">
            <Loading size="md" />
          </div>
        </div>
      </Card>
    )
  }

  if (error || !aging) {
    return (
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
          <div className="text-center py-8 text-gray-500">
            {error ? 'Error loading aging data' : 'No aging data available'}
          </div>
        </div>
      </Card>
    )
  }

  const totalAmount = Object.values(aging).reduce((sum, bucket) => sum + bucket.amount, 0)
  const totalCount = Object.values(aging).reduce((sum, bucket) => sum + bucket.count, 0)

  const agingBuckets = [
    {
      key: 'current',
      label: 'Current',
      description: 'Not yet due',
      data: aging.current,
      color: 'bg-green-500',
      variant: 'success' as const,
    },
    {
      key: 'days1to30',
      label: '1-30 Days',
      description: '1-30 days overdue',
      data: aging.days1to30,
      color: 'bg-yellow-500',
      variant: 'warning' as const,
    },
    {
      key: 'days31to60',
      label: '31-60 Days',
      description: '31-60 days overdue',
      data: aging.days31to60,
      color: 'bg-orange-500',
      variant: 'warning' as const,
    },
    {
      key: 'days61to90',
      label: '61-90 Days',
      description: '61-90 days overdue',
      data: aging.days61to90,
      color: 'bg-red-500',
      variant: 'danger' as const,
    },
    {
      key: 'over90',
      label: '90+ Days',
      description: 'Over 90 days overdue',
      data: aging.over90,
      color: 'bg-red-700',
      variant: 'danger' as const,
    },
  ]

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {type && (
            <Badge variant={type === 'outgoing' ? 'primary' : 'info'} size="sm">
              {type === 'outgoing' ? 'Outgoing' : 'Incoming'}
            </Badge>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-sm text-gray-600">Total Invoices</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-sm text-gray-600">Total Amount</div>
          </div>
        </div>

        {/* Aging Buckets */}
        <div className="space-y-4">
          {agingBuckets.map((bucket) => {
            const percentage = totalAmount > 0 ? (bucket.data.amount / totalAmount) * 100 : 0
            
            return (
              <div key={bucket.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${bucket.color}`}></div>
                    <div>
                      <div className="font-medium text-gray-900">{bucket.label}</div>
                      <div className="text-xs text-gray-500">{bucket.description}</div>
                    </div>
                  </div>
                  <Badge variant={bucket.variant} size="sm">
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {bucket.data.count}
                    </div>
                    <div className="text-xs text-gray-500">Invoices</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(bucket.data.amount)}
                    </div>
                    <div className="text-xs text-gray-500">Amount</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${bucket.color}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Risk Analysis */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Risk Analysis</h4>
          <div className="text-sm text-blue-800">
            {(() => {
              const overdueAmount = aging.days1to30.amount + aging.days31to60.amount + aging.days61to90.amount + aging.over90.amount
              const overduePercentage = totalAmount > 0 ? (overdueAmount / totalAmount) * 100 : 0
              const severelyOverdue = aging.over90.amount

              if (overduePercentage > 25) {
                return `⚠️ High risk: ${overduePercentage.toFixed(1)}% of receivables are overdue. Consider tightening credit terms.`
              } else if (severelyOverdue > 0) {
                return `🔍 Monitor closely: ${formatCurrency(severelyOverdue)} in severely overdue invoices (90+ days).`
              } else if (overduePercentage > 10) {
                return `📋 Moderate risk: ${overduePercentage.toFixed(1)}% overdue. Regular follow-up recommended.`
              } else {
                return `✅ Low risk: Good payment collection with ${overduePercentage.toFixed(1)}% overdue.`
              }
            })()}
          </div>
        </div>
      </div>
    </Card>
  )
}