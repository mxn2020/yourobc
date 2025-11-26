// src/features/yourobc/quotes/components/QuotesPageHeader.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Button, Badge } from '@/components/ui'

interface QuoteStats {
  totalQuotes: number
  pendingQuotes: number
  acceptedQuotes: number
  rejectedQuotes: number
  expiredQuotes: number
  quotesByServiceType: Record<string, number>
  quotesByPriority: Record<string, number>
  quotesByStatus: Record<string, number>
  conversionRate: number
  averageQuoteValue: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  totalQuoteValue: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  expiringQuotes: number
  overdueQuotes: number
}

interface QuotesPageHeaderProps {
  stats: QuoteStats | undefined | null
  isStatsLoading: boolean
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  canCreate: boolean
}

export const QuotesPageHeader: FC<QuotesPageHeaderProps> = ({
  stats,
  isStatsLoading,
  viewMode,
  onViewModeChange,
  canCreate,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quotes</h1>
        <p className="text-gray-600 mt-2">
          Manage quotes and convert opportunities to shipments
        </p>
        {!isStatsLoading && stats && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{stats.totalQuotes} total</span>
            <span>•</span>
            <Badge variant="primary" size="sm">{stats.quotesByStatus?.sent || 0} sent</Badge>
            <span>•</span>
            <Badge variant="success" size="sm">{stats.acceptedQuotes} accepted</Badge>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗂️ Cards
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Table
          </button>
        </div>

        {/* Create Button */}
        {canCreate && (
          <Link to="/{-$locale}/yourobc/quotes/new">
            <Button variant="primary">
              + New Quote
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
