// src/features/yourobc/quotes/components/QuoteList.tsx

import { FC, useState, useMemo } from 'react'
import { QuoteCard } from './QuoteCard'
import { useQuotes } from '../hooks/useQuotes'
import {
  Card,
  Input,
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Loading,
} from '@/components/ui'
import { QUOTE_CONSTANTS } from '../types'
import type { QuoteSearchFilters, QuoteListItem } from '../types'

interface QuoteListProps {
  filters?: QuoteSearchFilters
  showFilters?: boolean
  onQuoteClick?: (quote: QuoteListItem) => void
  limit?: number
  compact?: boolean
  viewMode?: 'grid' | 'table'
  showCustomer?: boolean
}

export const QuoteList: FC<QuoteListProps> = ({
  filters: initialFilters,
  showFilters = true,
  onQuoteClick,
  limit = 20,
  compact = false,
  viewMode = 'grid',
  showCustomer = true,
}) => {
  const [filters, setFilters] = useState<QuoteSearchFilters>(initialFilters || {})
  const [searchTerm, setSearchTerm] = useState('')

  const {
    quotes,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
    canCreateQuotes,
  } = useQuotes({
    limit,
    filters: {
      ...filters,
      search: searchTerm,
    },
  })

  const filteredQuotes = useMemo(() => {
    let filtered = quotes

    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (quote) =>
          quote.quoteNumber?.toLowerCase().includes(searchLower) ||
          quote.description?.toLowerCase().includes(searchLower) ||
          quote.customerReference?.toLowerCase().includes(searchLower) ||
          quote.customer?.companyName?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [quotes, searchTerm])

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        status: [status as any],
      }))
    }
  }

  const handleServiceTypeFilter = (serviceType: string) => {
    if (!serviceType) {
      setFilters((prev) => ({ ...prev, serviceType: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        serviceType: [serviceType as any],
      }))
    }
  }

  const handlePriorityFilter = (priority: string) => {
    if (!priority) {
      setFilters((prev) => ({ ...prev, priority: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        priority: [priority as any],
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  if (isLoading && quotes.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 p-6">
          <div className="text-red-500 mb-2">Error loading quotes</div>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="primary" size="sm">
            Try again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search quotes by number, description, customer..."
              />

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.status?.[0] || ''}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.STATUS.DRAFT}>Draft</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.STATUS.SENT}>Sent</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.STATUS.ACCEPTED}>Accepted</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.STATUS.REJECTED}>Rejected</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.STATUS.EXPIRED}>Expired</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.serviceType?.[0] || ''}
                  onValueChange={handleServiceTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Service Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Service Types</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.SERVICE_TYPE.OBC}>OBC</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.SERVICE_TYPE.NFO}>NFO</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority?.[0] || ''}
                  onValueChange={handlePriorityFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.PRIORITY.STANDARD}>Standard</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.PRIORITY.URGENT}>Urgent</SelectItem>
                    <SelectItem value={QUOTE_CONSTANTS.PRIORITY.CRITICAL}>Critical</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || Object.values(filters).some(Boolean)) && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={filters.status?.[0] === QUOTE_CONSTANTS.STATUS.SENT ? 'primary' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter(QUOTE_CONSTANTS.STATUS.SENT)}
                >
                  📧 Sent Quotes
                </Badge>

                <Badge
                  variant={filters.isExpiring ? 'warning' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, isExpiring: !prev.isExpiring }))
                  }
                >
                  ⏰ Expiring Soon
                </Badge>

                <Badge
                  variant={filters.status?.[0] === QUOTE_CONSTANTS.STATUS.ACCEPTED ? 'success' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter(QUOTE_CONSTANTS.STATUS.ACCEPTED)}
                >
                  ✅ Ready to Convert
                </Badge>

                <Badge
                  variant={filters.priority?.[0] === QUOTE_CONSTANTS.PRIORITY.URGENT ? 'warning' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => handlePriorityFilter(QUOTE_CONSTANTS.PRIORITY.URGENT)}
                >
                  🔥 Urgent
                </Badge>

                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={clearAllFilters}
                >
                  🔄 Clear All
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredQuotes.length} of {total} quotes
          {searchTerm && (
            <span className="ml-2 text-blue-600 font-medium">
              for "{searchTerm}"
            </span>
          )}
        </div>
      </div>

      {/* Quotes Display */}
      {filteredQuotes.length === 0 ? (
        <Card>
          <div className="text-center py-12 p-6">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm || Object.keys(filters).length > 0
                ? 'No quotes found matching your criteria'
                : 'No quotes yet'}
            </div>
            <p className="text-gray-400 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : canCreateQuotes
                ? 'Create your first quote to get started!'
                : 'Quotes will appear here once created.'}
            </p>
            {(searchTerm || Object.keys(filters).length > 0) && (
              <Button onClick={clearAllFilters} variant="primary" size="sm">
                Clear all filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${
            compact
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote._id}
              quote={quote}
              onClick={onQuoteClick}
              compact={compact}
              showActions={true}
              showCustomer={showCustomer}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && filteredQuotes.length > 0 && (
        <div className="text-center">
          <Button onClick={() => refetch()} variant="primary">
            Load More Quotes
          </Button>
        </div>
      )}
    </div>
  )
}