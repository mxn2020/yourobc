// src/features/yourobc/quotes/components/QuoteSearch.tsx

import { FC, useState } from 'react'
import { Input, Card, Badge, Loading } from '@/components/ui'
import { useQuoteSearch } from '../hooks/useQuotes'
import { CURRENCY_SYMBOLS } from '../types'
import type { QuoteListItem } from '../types'

interface QuoteSearchProps {
  onSelect?: (quote: QuoteListItem) => void
  placeholder?: string
  limit?: number
}

export const QuoteSearch: FC<QuoteSearchProps> = ({
  onSelect,
  placeholder = 'Search quotes...',
  limit = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { results, isLoading, hasResults } = useQuoteSearch(searchTerm)

  const handleSelect = (quote: QuoteListItem) => {
    onSelect?.(quote)
    setSearchTerm('')
    setShowResults(false)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'sent': return 'primary'
      case 'rejected': return 'danger'
      case 'expired': return 'warning'
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
              {results.slice(0, limit).map((quote) => (
                <div
                  key={quote._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(quote)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {quote.quoteNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quote.customer?.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {quote.origin.city} → {quote.destination.city}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={getStatusVariant(quote.status)} size="sm">
                        {quote.status}
                      </Badge>
                      {quote.totalPrice && (
                        <div className="text-sm font-medium text-green-600">
                          {CURRENCY_SYMBOLS[quote.totalPrice.currency]}{quote.totalPrice.amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No quotes found</div>
          )}
        </Card>
      )}
    </div>
  )
}