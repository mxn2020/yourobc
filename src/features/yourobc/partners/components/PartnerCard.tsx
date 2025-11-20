// src/features/yourobc/partners/components/PartnerCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import { SERVICE_TYPE_COLORS, SERVICE_TYPE_LABELS } from '../types'
import type { PartnerCardProps } from '../types'

export const PartnerCard: FC<PartnerCardProps> = ({
  partner,
  onClick,
  showCoverage = true,
  compact = false,
  showActions = true,
}) => {
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString()
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'secondary'
      default: return 'secondary'
    }
  }

  const getServiceTypeColor = (serviceType: string) => {
    return SERVICE_TYPE_COLORS[serviceType as keyof typeof SERVICE_TYPE_COLORS] || '#6b7280'
  }

  return (
    <Card
      hover={!!onClick}
      onClick={onClick ? () => onClick(partner) : undefined}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {partner.displayName || partner.companyName}
              </h3>

              {partner.isPreferred && (
                <Badge variant="primary" size="sm">
                  ⭐ Preferred
                </Badge>
              )}

              {partner.performanceScore && partner.performanceScore >= 80 && (
                <Badge variant="success" size="sm">
                  🏆 Top Performer
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-1">
              {partner.partnerCode ? `Code: ${partner.partnerCode}` : 'No code'}
            </div>

            <div className="text-sm text-gray-600">
              📍 {partner.formattedLocation || `${partner.address.city}, ${partner.address.country}`}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(partner.status)} size="sm">
              {partner.status.toUpperCase()}
            </Badge>

            <Badge 
              variant="secondary" 
              size="sm"
              style={{ 
                backgroundColor: getServiceTypeColor(partner.serviceType),
                color: 'white'
              }}
            >
              {SERVICE_TYPE_LABELS[partner.serviceType]}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Contact Info */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-900 mb-2">Primary Contact</div>
          <div className="space-y-1">
            <div className="text-sm text-gray-700">
              👤 {partner.primaryContact.name}
            </div>
            {partner.primaryContact.email && (
              <a
                href={`mailto:${partner.primaryContact.email}`}
                className="text-sm text-blue-600 hover:text-blue-800 block"
                onClick={(e) => e.stopPropagation()}
              >
                📧 {partner.primaryContact.email}
              </a>
            )}
            {partner.primaryContact.phone && (
              <a
                href={`tel:${partner.primaryContact.phone}`}
                className="text-sm text-blue-600 hover:text-blue-800 block"
                onClick={(e) => e.stopPropagation()}
              >
                📞 {partner.primaryContact.phone}
              </a>
            )}
          </div>
        </div>

        {/* Service Coverage */}
        {showCoverage && partner.coverageStats && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Coverage</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">
                  {partner.coverageStats.countries}
                </div>
                <div className="text-xs text-gray-500">Countries</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">
                  {partner.coverageStats.cities}
                </div>
                <div className="text-xs text-gray-500">Cities</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-900">
                  {partner.coverageStats.airports}
                </div>
                <div className="text-xs text-gray-500">Airports</div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Payment Terms:</span>
            <span className="font-medium text-gray-900">
              {partner.paymentTerms === 0 ? 'Immediate' : `${partner.paymentTerms} days`}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Currency:</span>
            <span className="font-medium text-gray-900">
              {partner.preferredCurrency}
            </span>
          </div>
        </div>

        {/* Performance Score */}
        {partner.performanceScore !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Performance:</span>
              <span className="font-medium text-gray-900">
                {partner.performanceScore}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  partner.performanceScore >= 80 ? 'bg-green-500' :
                  partner.performanceScore >= 60 ? 'bg-yellow-500' :
                  partner.performanceScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${partner.performanceScore}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Activity Status */}
        <div className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Joined: {formatDate(partner.createdAt)}</span>
            <span>Updated: {formatDate(partner.updatedAt)}</span>
          </div>
          {partner.hasRecentActivity && (
            <div className="text-green-600 mt-1">🟢 Recent activity</div>
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
                search={{ partnerId: partner._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="primary">
                  💼 Request Quote
                </Button>
              </Link>

              <Link
                to="/yourobc/partners/$partnerId"
                params={{ partnerId: partner._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span>{partner.serviceCoverage.countries.length > 0 ? 
                `${partner.serviceCoverage.countries.length} countries` : 
                'Global'
              }</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}