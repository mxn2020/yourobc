// src/features/yourobc/quotes/components/QuoteCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import { QUOTE_STATUS_COLORS, PRIORITY_COLORS, SERVICE_TYPE_LABELS, CURRENCY_SYMBOLS } from '../types'
import type { QuoteCardProps } from '../types'

export const QuoteCard: FC<QuoteCardProps> = ({
  quote,
  onClick,
  compact = false,
  showActions = true,
  showCustomer = true,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: number, currency: 'EUR' | 'USD' = 'EUR') => {
    return `${CURRENCY_SYMBOLS[currency]}${amount.toLocaleString()}`
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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'danger'
      case 'urgent': return 'warning'
      default: return 'secondary'
    }
  }

  const getUrgencyIndicator = () => {
    if (quote.isOverdue) return '🔴 Overdue'
    if (quote.isExpiring) return '🟡 Expiring Soon'
    if (quote.daysToDeadline && quote.daysToDeadline <= 1) return '🟠 Due Tomorrow'
    return null
  }

  return (
    <Card
      hover={!!onClick}
      onClick={onClick ? () => onClick(quote) : undefined}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {quote.quoteNumber}
              </h3>

              <Badge variant={getStatusVariant(quote.status)} size="sm">
                {quote.status.toUpperCase()}
              </Badge>

              {quote.priority !== 'standard' && (
                <Badge variant={getPriorityVariant(quote.priority)} size="sm">
                  {quote.priority.toUpperCase()}
                </Badge>
              )}
            </div>

            {showCustomer && quote.customer && (
              <div className="text-sm text-gray-600 mb-1">
                🏢 {quote.customer.companyName}
              </div>
            )}

            <div className="text-sm text-gray-600">
              {SERVICE_TYPE_LABELS[quote.serviceType]}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {quote.totalPrice && (
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(quote.totalPrice.amount, quote.totalPrice.currency)}
              </div>
            )}

            {getUrgencyIndicator() && (
              <Badge variant="warning" size="sm">
                {getUrgencyIndicator()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Route Information */}
        <div className="mb-4">
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">📍 From:</span>
              <span>{quote.formattedOrigin || `${quote.origin.city}, ${quote.origin.country}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">🎯 To:</span>
              <span>{quote.formattedDestination || `${quote.destination.city}, ${quote.destination.country}`}</span>
            </div>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="mb-4">
          <div className="text-sm text-gray-700 line-clamp-2">
            📦 {quote.description}
          </div>
        </div>

        {/* Key Dates */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>
              <div className="font-medium">Deadline</div>
              <div>{formatDate(quote.deadline)}</div>
            </div>
            <div>
              <div className="font-medium">Valid Until</div>
              <div>{formatDate(quote.validUntil)}</div>
            </div>
          </div>
        </div>

        {/* Profit Margin */}
        {quote.profitMargin !== undefined && quote.profitMargin > 0 && (
          <div className="text-xs text-gray-500">
            <span className="font-medium">Margin:</span> {quote.profitMargin}%
          </div>
        )}

        {/* Special Indicators */}
        {quote.assignedCourier && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="primary" size="sm">
              🚚 {quote.assignedCourier.firstName} {quote.assignedCourier.lastName}
            </Badge>
          </div>
        )}

        {/* Recent Activity */}
        <div className="text-xs text-gray-500 mt-4">
          <div className="flex justify-between">
            <span>Created: {formatDate(quote.createdAt)}</span>
            {quote.sentAt && (
              <span>Sent: {formatDate(quote.sentAt)}</span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {quote.status === 'draft' && (
                <Button size="sm" variant="primary">
                  📧 Send
                </Button>
              )}

              {quote.status === 'accepted' && (
                <Link
                  to="/yourobc/shipments/new"
                  search={{ quoteId: quote._id }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button size="sm" variant="primary">
                    📦 Convert
                  </Button>
                </Link>
              )}

              <Link
                to="/yourobc/quotes/$quoteId"
                params={{ quoteId: quote._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>{quote.serviceType}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
