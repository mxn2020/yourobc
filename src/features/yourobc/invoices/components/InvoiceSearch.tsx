// src/features/yourobc/invoices/components/InvoiceSearch.tsx

import { FC, useState } from 'react'
import { Input, Card, Badge, Loading } from '@/components/ui'
import type { BadgeVariant } from '@/components/ui/types'
import { useInvoiceSearch } from '../hooks/useInvoices'
import {
  INVOICE_STATUS_LABELS,
  INVOICE_TYPE_LABELS,
  CURRENCY_SYMBOLS,
} from '../types'
import type { InvoiceListItem } from '../types'

interface InvoiceSearchProps {
  onSelect?: (invoice: InvoiceListItem) => void
  placeholder?: string
  limit?: number
}

export const InvoiceSearch: FC<InvoiceSearchProps> = ({
  onSelect,
  placeholder = 'Search invoices...',
  limit = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { results, isLoading, hasResults } = useInvoiceSearch(searchTerm)

  const handleSelect = (invoice: InvoiceListItem) => {
    onSelect?.(invoice)
    setSearchTerm('')
    setShowResults(false)
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || currency
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const getStatusVariant = (status: string): BadgeVariant => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'sent': return 'primary'
      case 'paid': return 'success'
      case 'overdue': return 'danger'
      case 'cancelled': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTypeVariant = (type: string): BadgeVariant => {
    switch (type) {
      case 'incoming': return 'info'
      case 'outgoing': return 'primary'
      default: return 'secondary'
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setShowResults(true)
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder={placeholder}
      />

      {showResults && searchTerm.length >= 2 && (
        <Card className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loading size="sm" />
            </div>
          ) : hasResults ? (
            <div className="divide-y">
              {results.slice(0, limit).map((invoice) => (
                <div
                  key={invoice._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(invoice)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <Badge variant={getTypeVariant(invoice.type)} size="sm">
                        {INVOICE_TYPE_LABELS[invoice.type as keyof typeof INVOICE_TYPE_LABELS]}
                      </Badge>
                      <Badge variant={getStatusVariant(invoice.status)} size="sm">
                        {INVOICE_STATUS_LABELS[invoice.status as keyof typeof INVOICE_STATUS_LABELS]}
                      </Badge>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(invoice.totalAmount.amount, invoice.totalAmount.currency)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-1 truncate">
                    {invoice.description}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      {invoice.customer?.companyName || invoice.partner?.companyName || 'No entity'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Due: {formatDate(invoice.dueDate)}</span>
                      {invoice.overdueStatus?.isOverdue && (
                        <Badge variant="danger" size="sm">
                          {invoice.overdueStatus.daysOverdue}d overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No invoices found</div>
          )}
        </Card>
      )}
    </div>
  )
}