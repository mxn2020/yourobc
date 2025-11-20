// src/features/yourobc/invoices/components/InvoiceStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useInvoices } from '../hooks/useInvoices'
import { CURRENCY_SYMBOLS } from '../types'

export const InvoiceStats: FC = () => {
  const { stats, isStatsLoading } = useInvoices()

  const formatCurrency = (amount: number, currency = 'EUR') => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

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

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
              <div className="text-3xl">📄</div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">
                {stats.draftInvoices} drafts
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.totalOutgoingAmount)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {formatCurrency(stats.monthlyRevenue)} this month
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
              <div className="text-3xl">⚠️</div>
            </div>
            <div className="mt-2">
              <Badge variant="danger" size="sm">
                {formatCurrency(stats.outstandingAmount)} outstanding
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.avgPaymentTime}</div>
                <div className="text-sm text-gray-600">Avg Payment Days</div>
              </div>
              <div className="text-3xl">📅</div>
            </div>
            <div className="mt-2">
              <Badge variant="success" size="sm">
                {stats.paidInvoices} paid
              </Badge>
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
                <span className="text-gray-600">Draft</span>
                <Badge variant="secondary" size="sm">
                  {stats.draftInvoices}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Sent</span>
                <Badge variant="primary" size="sm">
                  {stats.invoicesByStatus?.sent || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Paid</span>
                <Badge variant="success" size="sm">
                  {stats.paidInvoices}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Overdue</span>
                <Badge variant="danger" size="sm">
                  {stats.overdueInvoices}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* List Metric 2: By Type */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Type</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">💸 Outgoing</span>
                <Badge variant="info" size="sm">
                  {stats.invoicesByType?.outgoing || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">📥 Incoming</span>
                <Badge variant="warning" size="sm">
                  {stats.invoicesByType?.incoming || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.totalOutgoingAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(stats.totalIncomingAmount)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* List Metric 3: Monthly Summary */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">This Month</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(stats.monthlyExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Net Profit</span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(stats.monthlyRevenue - stats.monthlyExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Outstanding</span>
                <span className="font-medium text-orange-600">
                  {formatCurrency(stats.outstandingAmount)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Financial Health</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-blue-700 mb-1">Payment Performance</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.avgPaymentTime} days avg
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Collection Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.totalInvoices > 0
                    ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100)
                    : 0}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Total Profit</div>
                <div className="text-sm font-semibold text-blue-900">
                  {formatCurrency(stats.totalOutgoingAmount - stats.totalIncomingAmount)}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}