// src/features/yourobc/mobile/components/ShipmentCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui'
import type { Id } from '@/convex/_generated/dataModel'
import {
  formatMobileDate,
  formatSLACountdown,
  formatMobileRoute,
  formatMobileShipmentNumber,
  formatMobileStatus,
} from '../utils/mobileFormatters'

interface ShipmentCardProps {
  shipment: {
    _id: Id<'yourobcShipments'>
    shipmentNumber: string
    status: string
    customer?: {
      companyName: string
    }
    origin: string
    destination: string
    slaDeadline?: number
    courier?: {
      name: string
    } | null
    partner?: {
      companyName: string
    } | null
    serviceType: 'OBC' | 'NFO'
    createdAt: number
  }
  onQuickStatus?: (shipmentId: Id<'yourobcShipments'>) => void
  compact?: boolean
}

export const ShipmentCard: FC<ShipmentCardProps> = ({ shipment, onQuickStatus, compact = false }) => {
  const slaInfo = shipment.slaDeadline ? formatSLACountdown(shipment.slaDeadline) : null

  return (
    <Link
      to="/yourobc/shipments/$shipmentId"
      params={{ shipmentId: shipment._id }}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow active:bg-gray-50"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 text-sm">
              {formatMobileShipmentNumber(shipment.shipmentNumber)}
            </span>
            <Badge
              variant={shipment.serviceType === 'OBC' ? 'primary' : 'secondary'}
              size="sm"
            >
              {shipment.serviceType}
            </Badge>
          </div>
          <div className="text-xs text-gray-600 truncate">
            {shipment.customer?.companyName || 'No Customer'}
          </div>
        </div>

        {/* SLA Badge */}
        {slaInfo && (
          <div
            className={`flex-shrink-0 ml-2 px-2 py-1 rounded text-xs font-medium ${
              slaInfo.color === 'green'
                ? 'bg-green-100 text-green-700'
                : slaInfo.color === 'yellow'
                  ? 'bg-yellow-100 text-yellow-700 animate-pulse'
                  : 'bg-red-100 text-red-700 animate-pulse'
            }`}
          >
            {slaInfo.text}
          </div>
        )}
      </div>

      {/* Route */}
      <div className="mb-3">
        <div className="text-base font-medium text-gray-900">
          {formatMobileRoute(shipment.origin, shipment.destination)}
        </div>
      </div>

      {/* Status and Provider Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              shipment.status === 'delivered' || shipment.status === 'completed'
                ? 'success'
                : shipment.status === 'cancelled'
                  ? 'danger'
                  : shipment.status === 'in_transit'
                    ? 'warning'
                    : 'secondary'
            }
            size="sm"
          >
            {formatMobileStatus(shipment.status)}
          </Badge>
        </div>

        {/* Courier/Partner Info */}
        <div className="text-xs text-gray-600 truncate max-w-[150px]">
          {shipment.serviceType === 'OBC' && shipment.courier && (
            <span>{shipment.courier.name}</span>
          )}
          {shipment.serviceType === 'NFO' && shipment.partner && (
            <span>{shipment.partner.companyName}</span>
          )}
        </div>
      </div>

      {/* Footer - Timestamp */}
      {!compact && (
        <div className="pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Created {formatMobileDate(shipment.createdAt, { relative: true })}
          </div>
        </div>
      )}

      {/* Quick Actions (Optional) */}
      {onQuickStatus && !compact && (
        <div className="pt-2 mt-2 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.preventDefault() // Prevent link navigation
              onQuickStatus(shipment._id)
            }}
            className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 active:text-blue-800"
          >
            Update Status
          </button>
        </div>
      )}
    </Link>
  )
}

/**
 * Compact variant for list views
 */
export const ShipmentCardCompact: FC<Omit<ShipmentCardProps, 'compact'>> = (props) => {
  return <ShipmentCard {...props} compact={true} />
}

/**
 * Skeleton loader for shipment cards
 */
export const ShipmentCardSkeleton: FC = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>

      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>

      <div className="flex items-center justify-between mb-3">
        <div className="h-5 bg-gray-200 rounded w-20"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  )
}
