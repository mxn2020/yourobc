// src/features/yourobc/accounting/components/StatementOfAccounts.tsx

import { FC, useState } from 'react'
import { Badge, Button } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'

interface Transaction {
  date: number
  type: 'invoice' | 'payment' | 'credit_note' | 'adjustment'
  reference: string
  description: string
  debit?: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  credit?: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  balance: {
    amount: number
    currency: 'EUR' | 'USD'
  }
}

interface OutstandingInvoice {
  invoiceId: Id<'yourobcInvoices'>
  invoiceNumber: string
  issueDate: number
  dueDate: number
  amount: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  daysOverdue: number
}

interface StatementOfAccountsProps {
  statement?: {
    _id: Id<'yourobcStatementOfAccounts'>
    customerId: Id<'yourobcCustomers'>
    startDate: number
    endDate: number
    generatedDate: number
    openingBalance: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    totalInvoiced: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    totalPaid: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    closingBalance: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    transactions: Transaction[]
    outstandingInvoices: OutstandingInvoice[]
    customer?: {
      _id: Id<'yourobcCustomers'>
      companyName: string
      contactEmail?: string
      contactPerson?: string
    } | null
  } | null
  onExport?: (format: 'pdf' | 'excel') => void
  onSendToCustomer?: (email: string) => void
  onRegenerate?: () => void
  showActions?: boolean
  compact?: boolean
}

export const StatementOfAccounts: FC<StatementOfAccountsProps> = ({
  statement,
  onExport,
  onSendToCustomer,
  onRegenerate,
  showActions = true,
  compact = false,
}) => {
  const [showTransactions, setShowTransactions] = useState(true)
  const [showOutstanding, setShowOutstanding] = useState(true)

  if (!statement) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="animate-pulse">Loading statement...</div>
      </div>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount?: { amount: number; currency: string }) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: amount.currency,
    }).format(amount.amount)
  }

  const getTransactionTypeBadge = (type: string) => {
    const variants = {
      invoice: 'primary' as const,
      payment: 'success' as const,
      credit_note: 'warning' as const,
      adjustment: 'secondary' as const,
    }

    const labels = {
      invoice: 'Invoice',
      payment: 'Payment',
      credit_note: 'Credit Note',
      adjustment: 'Adjustment',
    }

    return (
      <Badge variant={variants[type as keyof typeof variants]} size="sm">
        {labels[type as keyof typeof labels]}
      </Badge>
    )
  }

  const getOverdueBadge = (daysOverdue: number) => {
    if (daysOverdue <= 0) {
      return <Badge variant="success" size="sm">Current</Badge>
    } else if (daysOverdue <= 30) {
      return <Badge variant="warning" size="sm">{daysOverdue}d overdue</Badge>
    } else if (daysOverdue <= 60) {
      return <Badge variant="danger" size="sm">{daysOverdue}d overdue</Badge>
    } else {
      return <Badge variant="danger" size="sm">⚠️ {daysOverdue}d overdue</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Statement of Accounts</h2>
            {statement.customer && (
              <div className="mt-2">
                <div className="text-lg font-semibold text-gray-900">
                  {statement.customer.companyName}
                </div>
                {statement.customer.contactPerson && (
                  <div className="text-sm text-gray-600">
                    Attn: {statement.customer.contactPerson}
                  </div>
                )}
                {statement.customer.contactEmail && (
                  <div className="text-sm text-gray-600">
                    {statement.customer.contactEmail}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Period</div>
            <div className="text-base font-semibold text-gray-900">
              {formatDate(statement.startDate)} - {formatDate(statement.endDate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Generated: {formatDate(statement.generatedDate)}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
            {onExport && (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => onExport('pdf')}
                >
                  📄 Export PDF
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onExport('excel')}
                >
                  📊 Export Excel
                </Button>
              </>
            )}
            {onSendToCustomer && statement.customer?.contactEmail && (
              <Button
                size="sm"
                variant="success"
                onClick={() => onSendToCustomer(statement.customer!.contactEmail!)}
              >
                📧 Send to Customer
              </Button>
            )}
            {onRegenerate && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onRegenerate}
              >
                🔄 Regenerate
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-gray-600">Opening Balance</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(statement.openingBalance)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Invoiced</div>
            <div className="text-xl font-semibold text-blue-600">
              +{formatCurrency(statement.totalInvoiced)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Paid</div>
            <div className="text-xl font-semibold text-green-600">
              -{formatCurrency(statement.totalPaid)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Closing Balance</div>
            <div className={`text-2xl font-bold ${statement.closingBalance.amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(statement.closingBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Invoices */}
      {statement.outstandingInvoices.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Outstanding Invoices ({statement.outstandingInvoices.length})
            </h3>
            <button
              onClick={() => setShowOutstanding(!showOutstanding)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showOutstanding ? '▲ Hide' : '▼ Show'}
            </button>
          </div>

          {showOutstanding && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Issue Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {statement.outstandingInvoices.map((invoice) => (
                    <tr
                      key={invoice.invoiceId}
                      className={invoice.daysOverdue > 30 ? 'bg-red-50' : ''}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getOverdueBadge(invoice.daysOverdue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900">
                      Total Outstanding
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-right text-red-600">
                      {formatCurrency({
                        amount: statement.outstandingInvoices.reduce(
                          (sum, inv) => sum + inv.amount.amount,
                          0
                        ),
                        currency: statement.closingBalance.currency,
                      })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Transaction History */}
      {!compact && statement.transactions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Transaction History ({statement.transactions.length})
            </h3>
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showTransactions ? '▲ Hide' : '▼ Show'}
            </button>
          </div>

          {showTransactions && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                      Credit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {statement.transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {getTransactionTypeBadge(transaction.type)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {transaction.reference}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-blue-600">
                        {transaction.debit ? formatCurrency(transaction.debit) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {transaction.credit ? formatCurrency(transaction.credit) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                        {formatCurrency(transaction.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {statement.transactions.length === 0 && statement.outstandingInvoices.length === 0 && (
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
          <div className="text-6xl mb-4">📄</div>
          <div className="text-lg font-semibold">No transactions in this period</div>
          <div className="text-sm mt-2">
            This customer had no activity during the selected period.
          </div>
        </div>
      )}
    </div>
  )
}
