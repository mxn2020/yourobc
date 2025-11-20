// src/features/yourobc/quotes/pages/QuotesPage.tsx

import { FC, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { QuoteCard } from '../components/QuoteCard'
import { QuotesPageHeader } from '../components/QuotesPageHeader'
import { QuotesFilters } from '../components/QuotesFilters'
import { QuoteQuickFilterBadges } from '../components/QuoteQuickFilterBadges'
import { QuotesTable } from '../components/QuotesTable'
import { QuotesHelpSection } from '../components/QuotesHelpSection'
import { QuoteStats } from '../components/QuoteStats'
import { useQuotes } from '../hooks/useQuotes'
import { Card, Loading, PermissionDenied, ErrorState } from '@/components/ui'
import type { QuoteListItem } from '../types'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki/components/WikiSidebar'

export const QuotesPage: FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')

  const {
    quotes,
    stats,
    isLoading,
    isStatsLoading,
    error,
    isPermissionError,
    refetch,
    canCreateQuotes,
  } = useQuotes({
    limit: 50,
  })

  const handleQuoteClick = (quote: QuoteListItem) => {
    navigate({
      to: '/yourobc/quotes/$quoteId',
      params: { quoteId: quote._id },
    })
  }

  const filteredQuotes = quotes.filter((quote) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        quote.quoteNumber.toLowerCase().includes(searchLower) ||
        quote.description.toLowerCase().includes(searchLower) ||
        quote.customerReference?.toLowerCase().includes(searchLower) ||
        quote.customer?.companyName?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && quote.status !== statusFilter) return false

    // Service type filter
    if (serviceTypeFilter && quote.serviceType !== serviceTypeFilter) return false

    return true
  })

  if (isLoading && quotes.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  // Handle permission errors
  if (isPermissionError && error) {
    return (
      <PermissionDenied
        permission={error.permission}
        module="Quotes"
        message={error.message}
        showDetails={true}
      />
    )
  }

  // Handle other errors
  if (error) {
    return <ErrorState error={error} onRetry={refetch} showDetails={true} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <QuotesPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreateQuotes}
        />

        {/* Stats Overview */}
        {!isStatsLoading ? (
          <div className="mb-8">
            <QuoteStats />
          </div>
        ) : (
          <div className="flex justify-center py-8 mb-8">
            <Loading size="lg" />
          </div>
        )}

        {/* Filters */}
        <QuotesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onServiceTypeChange={setServiceTypeFilter}
          onClearFilters={() => {
            setSearchTerm('')
            setStatusFilter('')
            setServiceTypeFilter('')
          }}
          showClearButton={!!(searchTerm || statusFilter || serviceTypeFilter)}
        />

        {/* Quick Filter Pills */}
        <QuoteQuickFilterBadges
          stats={stats}
          statusFilter={statusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onStatusFilterChange={setStatusFilter}
          onServiceTypeFilterChange={setServiceTypeFilter}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredQuotes.length} of {quotes.length} quotes
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
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'No quotes found matching your criteria'
                  : 'No quotes yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'Try adjusting your search or filters'
                  : canCreateQuotes
                  ? 'Create your first quote to get started!'
                  : 'Quotes will appear here once created.'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuotes.map((quote) => (
              <QuoteCard
                key={quote._id}
                quote={quote}
                onClick={handleQuoteClick}
                compact={false}
                showActions={true}
                showCustomer={true}
              />
            ))}
          </div>
        ) : (
          <QuotesTable
            quotes={filteredQuotes}
            onRowClick={handleQuoteClick}
          />
        )}

        {/* Help Section */}
        <QuotesHelpSection />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Quotes" title="Quote Wiki Helper" />
      </div>
    </div>
  )
}
