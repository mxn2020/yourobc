// src/features/yourobc/quotes/components/QuoteQuickFilterBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'

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

interface QuoteQuickFilterBadgesProps {
  stats: QuoteStats | undefined | null
  statusFilter: string
  serviceTypeFilter: string
  onStatusFilterChange: (status: string) => void
  onServiceTypeFilterChange: (serviceType: string) => void
}

export const QuoteQuickFilterBadges: FC<QuoteQuickFilterBadgesProps> = ({
  stats,
  statusFilter,
  serviceTypeFilter,
  onStatusFilterChange,
  onServiceTypeFilterChange,
}) => {
  if (!stats) return null

  const handleStatusClick = (status: string) => {
    onStatusFilterChange(statusFilter === status ? '' : status)
  }

  const handleServiceTypeClick = (serviceType: string) => {
    onServiceTypeFilterChange(serviceTypeFilter === serviceType ? '' : serviceType)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* Status Filters */}
      <Badge
        variant={statusFilter === 'draft' ? 'secondary' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('draft')}
      >
        📝 Draft ({stats.quotesByStatus?.draft || 0})
      </Badge>

      <Badge
        variant={statusFilter === 'sent' ? 'primary' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('sent')}
      >
        📤 Sent ({stats.quotesByStatus?.sent || 0})
      </Badge>

      <Badge
        variant={statusFilter === 'accepted' ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('accepted')}
      >
        ✅ Accepted ({stats.acceptedQuotes})
      </Badge>

      <Badge
        variant={statusFilter === 'rejected' ? 'danger' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('rejected')}
      >
        ❌ Rejected ({stats.rejectedQuotes})
      </Badge>

      <Badge
        variant={statusFilter === 'expired' ? 'warning' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('expired')}
      >
        ⏰ Expired ({stats.expiredQuotes})
      </Badge>

      {/* Service Type Filters */}
      {stats.quotesByServiceType.OBC && (
        <Badge
          variant={serviceTypeFilter === 'OBC' ? 'primary' : 'secondary'}
          className="cursor-pointer"
          onClick={() => handleServiceTypeClick('OBC')}
        >
          🚶‍♂️ OBC ({stats.quotesByServiceType.OBC})
        </Badge>
      )}

      {stats.quotesByServiceType.NFO && (
        <Badge
          variant={serviceTypeFilter === 'NFO' ? 'info' : 'secondary'}
          className="cursor-pointer"
          onClick={() => handleServiceTypeClick('NFO')}
        >
          ✈️ NFO ({stats.quotesByServiceType.NFO})
        </Badge>
      )}
    </div>
  )
}
