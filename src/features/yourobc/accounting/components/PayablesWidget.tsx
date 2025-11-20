// src/features/yourobc/accounting/components/PayablesWidget.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'

interface PayablesWidgetProps {
  data?: {
    totalPayables: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    currentPayables: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    overduePayables: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    pendingApprovalCount: number
    pendingApprovalValue: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    missingInvoicesCount: number
    missingInvoicesValue: {
      amount: number
      currency: 'EUR' | 'USD'
    }
  } | null
  topPartners?: Array<{
    partner: {
      _id: Id<'yourobcPartners'>
      companyName: string
    } | null
    totalAmount: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    invoiceCount: number
    oldestInvoiceDays: number
  }>
  compact?: boolean
}

export const PayablesWidget: FC<PayablesWidgetProps> = ({ data, topPartners, compact = false }) => {
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

  const overduePercentage =
    data.totalPayables.amount > 0
      ? (data.overduePayables.amount / data.totalPayables.amount) * 100
      : 0

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Payables</h3>
          <div className="text-sm text-gray-600">Money we owe</div>
        </div>
        <div className="text-3xl">💸</div>
      </div>

      {/* Total Amount */}
      <div>
        <div className="text-sm text-gray-600 mb-1">Total Outstanding</div>
        <div className="text-3xl font-bold text-gray-900">{formatCurrency(data.totalPayables)}</div>
      </div>

      {/* Current vs Overdue */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Current</div>
          <div className="text-xl font-semibold text-blue-600">
            {formatCurrency(data.currentPayables)}
          </div>
          <div className="text-xs text-gray-500">
            {((data.currentPayables.amount / data.totalPayables.amount) * 100).toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">Overdue</div>
          <div className="text-xl font-semibold text-red-600">
            {formatCurrency(data.overduePayables)}
          </div>
          <div className="text-xs text-gray-500">{overduePercentage.toFixed(1)}%</div>
        </div>
      </div>

      {/* Alerts Section */}
      {!compact && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">Alerts</div>
          <div className="space-y-2">
            {/* Pending Approvals */}
            {data.pendingApprovalCount > 0 && (
              <div className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">
                    Pending Approval
                  </Badge>
                  <span className="text-sm text-gray-900">{data.pendingApprovalCount} invoices</span>
                </div>
                <div className="text-sm font-semibold text-yellow-700">
                  {formatCurrency(data.pendingApprovalValue)}
                </div>
              </div>
            )}

            {/* Missing Invoices */}
            {data.missingInvoicesCount > 0 && (
              <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="danger" size="sm">
                    Missing
                  </Badge>
                  <span className="text-sm text-gray-900">{data.missingInvoicesCount} invoices</span>
                </div>
                <div className="text-sm font-semibold text-red-700">
                  {formatCurrency(data.missingInvoicesValue)}
                </div>
              </div>
            )}

            {/* No Alerts */}
            {data.pendingApprovalCount === 0 && data.missingInvoicesCount === 0 && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                <span className="text-sm text-green-700">✅ All invoices processed</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Partners */}
      {topPartners && topPartners.length > 0 && !compact && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-3">Top Partners by Outstanding</div>
          <div className="space-y-2">
            {topPartners.slice(0, 5).map((partner, index) => (
              <div
                key={partner.partner?._id || index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {partner.partner?.companyName || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {partner.invoiceCount} invoices
                    {partner.oldestInvoiceDays > 0 && (
                      <span className="ml-1">· {partner.oldestInvoiceDays}d aging</span>
                    )}
                  </div>
                </div>
                <div className="font-semibold text-gray-900">
                  {formatCurrency(partner.totalAmount)}
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
            <span>Payment Health</span>
            <span>{(100 - overduePercentage).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${100 - overduePercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Action Items */}
      {!compact && (data.pendingApprovalCount > 0 || data.missingInvoicesCount > 0) && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-2">Action Required</div>
          <div className="text-xs text-gray-600 space-y-1">
            {data.pendingApprovalCount > 0 && (
              <div>• Review and approve {data.pendingApprovalCount} pending invoices</div>
            )}
            {data.missingInvoicesCount > 0 && (
              <div>• Follow up on {data.missingInvoicesCount} missing invoices</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
