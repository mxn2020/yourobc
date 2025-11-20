// src/features/yourobc/accounting/components/ReceivablesWidget.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'

interface ReceivablesWidgetProps {
  data?: {
    totalReceivables: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    currentReceivables: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    overdueReceivables: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    overdueBreakdown: {
      overdue1to30: {
        amount: number
        currency: 'EUR' | 'USD'
      }
      overdue31to60: {
        amount: number
        currency: 'EUR' | 'USD'
      }
      overdue61to90: {
        amount: number
        currency: 'EUR' | 'USD'
      }
      overdue90plus: {
        amount: number
        currency: 'EUR' | 'USD'
      }
    }
    dunningLevel1Count: number
    dunningLevel2Count: number
    dunningLevel3Count: number
    suspendedCustomersCount: number
  } | null
  topCustomers?: Array<{
    customer: {
      _id: Id<'yourobcCustomers'>
      companyName: string
    } | null
    totalAmount: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    invoiceCount: number
    oldestInvoiceDays: number
    overdueAmount: {
      amount: number
      currency: 'EUR' | 'USD'
    }
  }>
  compact?: boolean
}

export const ReceivablesWidget: FC<ReceivablesWidgetProps> = ({
  data,
  topCustomers,
  compact = false,
}) => {
  if (!data) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount?: { amount: number; currency: string }) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: amount.currency,
    }).format(amount.amount)
  }

  const overduePercentage = data.totalReceivables.amount > 0
    ? (data.overdueReceivables.amount / data.totalReceivables.amount) * 100
    : 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Receivables</h3>
          <div className="text-sm text-gray-600">Money owed to us</div>
        </div>
        <div className="text-3xl">💰</div>
      </div>

      {/* Total Amount */}
      <div>
        <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
        <div className="text-3xl font-bold text-gray-900">
          {formatCurrency(data.totalReceivables)}
        </div>
      </div>

      {/* Current vs Overdue */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Current</div>
          <div className="text-xl font-semibold text-green-600">
            {formatCurrency(data.currentReceivables)}
          </div>
          <div className="text-xs text-gray-500">
            {((data.currentReceivables.amount / data.totalReceivables.amount) * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Overdue</div>
          <div className="text-xl font-semibold text-red-600">
            {formatCurrency(data.overdueReceivables)}
          </div>
          <div className="text-xs text-gray-500">
            {overduePercentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Overdue Breakdown */}
      {!compact && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">Overdue Breakdown</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">1-30 days</span>
              <span className="font-semibold text-yellow-600">
                {formatCurrency(data.overdueBreakdown.overdue1to30)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">31-60 days</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(data.overdueBreakdown.overdue31to60)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">61-90 days</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(data.overdueBreakdown.overdue61to90)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">90+ days</span>
              <span className="font-semibold text-red-700">
                {formatCurrency(data.overdueBreakdown.overdue90plus)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dunning Status */}
      {!compact && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">Dunning Status</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="warning" size="sm">Level 1</Badge>
              <span className="text-sm text-gray-600">{data.dunningLevel1Count}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" size="sm">Level 2</Badge>
              <span className="text-sm text-gray-600">{data.dunningLevel2Count}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" size="sm">Level 3</Badge>
              <span className="text-sm text-gray-600">{data.dunningLevel3Count}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="danger" size="sm">Suspended</Badge>
              <span className="text-sm text-gray-600">{data.suspendedCustomersCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Top Customers */}
      {topCustomers && topCustomers.length > 0 && !compact && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">
            Top Customers by Outstanding
          </div>
          <div className="space-y-2">
            {topCustomers.slice(0, 5).map((customer, index) => (
              <div
                key={customer.customer?._id || index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {customer.customer?.companyName || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {customer.invoiceCount} invoices
                    {customer.oldestInvoiceDays > 0 && (
                      <span className="text-red-600 ml-1">
                        · {customer.oldestInvoiceDays}d overdue
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(customer.totalAmount)}
                  </div>
                  {customer.overdueAmount.amount > 0 && (
                    <div className="text-xs text-red-600">
                      {formatCurrency(customer.overdueAmount)} overdue
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Progress Bar */}
      {!compact && overduePercentage > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Collection Health</span>
            <span>{(100 - overduePercentage).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${100 - overduePercentage}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
