// src/features/yourobc/invoices/components/InvoicesTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import { CURRENCY_SYMBOLS, type InvoiceListItem } from '../types'

interface InvoicesTableProps {
  invoices: InvoiceListItem[]
  onRowClick: (invoice: InvoiceListItem) => void
}

type SortField = 'invoiceNumber' | 'issueDate' | 'dueDate' | 'totalAmount'
type SortOrder = 'asc' | 'desc'

export const InvoicesTable: FC<InvoicesTableProps> = ({ invoices, onRowClick }) => {
  const [sortField, setSortField] = useState<SortField>('issueDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'invoiceNumber':
          aValue = a.invoiceNumber.toLowerCase()
          bValue = b.invoiceNumber.toLowerCase()
          break
        case 'totalAmount':
          aValue = a.totalAmount.amount
          bValue = b.totalAmount.amount
          break
        case 'issueDate':
          aValue = a.issueDate
          bValue = b.issueDate
          break
        case 'dueDate':
          aValue = a.dueDate || 0
          bValue = b.dueDate || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [invoices, sortField, sortOrder])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'primary'
      case 'overdue': return 'danger'
      case 'cancelled': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTypeVariant = (type: string) => {
    return type === 'outgoing' ? 'info' : 'warning'
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const SortIcon: FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">⇅</span>
    return sortOrder === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('invoiceNumber')}
              >
                Invoice # <SortIcon field="invoiceNumber" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer/Partner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalAmount')}
              >
                Total Amount <SortIcon field="totalAmount" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('issueDate')}
              >
                Issue Date <SortIcon field="issueDate" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dueDate')}
              >
                Due Date <SortIcon field="dueDate" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedInvoices.map((invoice) => (
              <tr
                key={invoice._id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(invoice)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </div>
                  {invoice.externalInvoiceNumber && (
                    <div className="text-xs text-gray-500">
                      Ext: {invoice.externalInvoiceNumber}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getTypeVariant(invoice.type)} size="sm">
                    {invoice.type === 'outgoing' ? '💸 Out' : '📥 In'}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {invoice.type === 'outgoing'
                      ? invoice.customer?.companyName || '-'
                      : invoice.partner?.companyName || '-'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600 truncate max-w-xs">
                    {invoice.description}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(invoice.totalAmount.amount, invoice.totalAmount.currency)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(invoice.status)} size="sm">
                    {invoice.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                  </div>
                  {invoice.overdueStatus?.isOverdue && (
                    <div className="text-xs text-red-600 font-medium">
                      {invoice.overdueStatus.daysOverdue}d overdue
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(invoice)
                    }}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedInvoices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No invoices to display
        </div>
      )}
    </div>
  )
}
