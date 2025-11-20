// src/features/yourobc/customers/components/CustomerCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import { CURRENCY_SYMBOLS } from '../types'
import type { CustomerCardProps } from '../types'

export const CustomerCard: FC<CustomerCardProps> = ({
  customer,
  onClick,
  showContactInfo = true,
  compact = false,
  showActions = true,
}) => {
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString()
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || ''}${amount.toLocaleString()}`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'blacklisted': return 'danger'
      default: return 'secondary'
    }
  }

  const getRiskVariant = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return 'success'
      case 'medium': return 'warning'
      case 'high': return 'danger'
      default: return 'secondary'
    }
  }

  return (
    <Card
      hover={!!onClick}
      onClick={onClick ? () => onClick(customer) : undefined}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {customer.displayName || customer.companyName}
              </h3>

              {customer.score && customer.score >= 80 && (
                <Badge variant="success" size="sm">
                  High Value
                </Badge>
              )}
            </div>

            {customer.shortName && customer.shortName !== customer.companyName && (
              <div className="text-sm text-gray-600 mb-1">
                {customer.shortName}
              </div>
            )}

            <div className="text-sm text-gray-600">
              📍 {customer.formattedBillingAddress}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(customer.status)} size="sm">
              {customer.status.toUpperCase()}
            </Badge>

            {customer.riskLevel && (
              <Badge variant={getRiskVariant(customer.riskLevel)} size="sm">
                {customer.riskLevel.toUpperCase()} RISK
              </Badge>
            )}

            {customer.hasRecentActivity && (
              <Badge variant="info" size="sm">
                🟢 Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Contact Info */}
        {showContactInfo && (
          <div className="mb-4">
            <div className="flex items-center gap-4 flex-wrap">
              {customer.primaryContact.email && (
                <a
                  href={`mailto:${customer.primaryContact.email}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  📧 {customer.primaryContact.email}
                </a>
              )}

              {customer.primaryContact.phone && (
                <a
                  href={`tel:${customer.primaryContact.phone}`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  📞 {customer.primaryContact.phone}
                </a>
              )}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              Contact: {customer.primaryContact.name}
            </div>
          </div>
        )}

        {/* Business Info */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Currency:</span>
              <span className="ml-1 font-medium">{customer.defaultCurrency}</span>
            </div>
            <div>
              <span className="text-gray-500">Payment:</span>
              <span className="ml-1 font-medium">Net {customer.paymentTerms}</span>
            </div>
            <div>
              <span className="text-gray-500">Margin:</span>
              <span className="ml-1 font-medium">{customer.margin}%</span>
            </div>
            <div>
              <span className="text-gray-500">Method:</span>
              <span className="ml-1 font-medium capitalize">
                {customer.paymentMethod.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="font-medium text-gray-900">
                {formatCurrency(customer.stats.totalRevenue, customer.defaultCurrency)}
              </div>
              <div className="text-xs text-gray-600">Total Revenue</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {customer.stats.totalQuotes}
              </div>
              <div className="text-xs text-gray-600">Total Quotes</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {customer.stats.acceptedQuotes}
              </div>
              <div className="text-xs text-gray-600">Accepted</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {customer.stats.totalQuotes > 0 
                  ? Math.round((customer.stats.acceptedQuotes / customer.stats.totalQuotes) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-gray-600">Accept Rate</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        {customer.tags && customer.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {customer.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {customer.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{customer.tags.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Customer since: {formatDate(customer.createdAt)}</span>
            <span>Updated: {formatDate(customer.updatedAt)}</span>
          </div>
          {customer.lastContactDate && (
            <div className="mt-1">
              Last contact: {formatDate(customer.lastContactDate)}
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Link
                to="/yourobc/quotes/new"
                search={{ customerId: customer._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="primary">
                  📄 New Quote
                </Button>
              </Link>

              <Link
                to="/yourobc/customers/$customerId"
                params={{ customerId: customer._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              {customer.website && (
                <a
                  href={customer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => e.stopPropagation()}
                  title="Visit website"
                >
                  🌐
                </a>
              )}
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span>{customer.defaultCurrency}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}