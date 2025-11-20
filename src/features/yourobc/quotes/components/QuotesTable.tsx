// src/features/yourobc/quotes/components/QuotesTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import type { QuoteListItem } from '../types'

interface QuotesTableProps {
  quotes: QuoteListItem[]
  onRowClick: (quote: QuoteListItem) => void
}

type SortField = 'quoteNumber' | 'totalPrice' | 'validUntil' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const QuotesTable: FC<QuotesTableProps> = ({ quotes, onRowClick }) => {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'quoteNumber':
          aValue = a.quoteNumber.toLowerCase()
          bValue = b.quoteNumber.toLowerCase()
          break
        case 'totalPrice':
          aValue = a.totalPrice?.amount || 0
          bValue = b.totalPrice?.amount || 0
          break
        case 'validUntil':
          aValue = a.validUntil || 0
          bValue = b.validUntil || 0
          break
        case 'createdAt':
          aValue = a.createdAt || 0
          bValue = b.createdAt || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [quotes, sortField, sortOrder])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'sent': return 'primary'
      case 'rejected': return 'danger'
      case 'expired': return 'warning'
      default: return 'secondary'
    }
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
                onClick={() => handleSort('quoteNumber')}
              >
                Quote # <SortIcon field="quoteNumber" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalPrice')}
              >
                Total Price <SortIcon field="totalPrice" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('validUntil')}
              >
                Valid Until <SortIcon field="validUntil" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedQuotes.map((quote) => (
              <tr
                key={quote._id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(quote)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {quote.quoteNumber}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {quote.customer?.companyName || '-'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-600 truncate max-w-xs">
                    {quote.description || '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant="primary" size="sm">
                    {quote.serviceType}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {quote.origin?.city} → {quote.destination?.city}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    {quote.totalPrice?.currency === 'EUR' ? '€' : '$'}{quote.totalPrice?.amount?.toLocaleString() || 0}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(quote.status)} size="sm">
                    {quote.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(quote)
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

      {sortedQuotes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No quotes to display
        </div>
      )}
    </div>
  )
}
