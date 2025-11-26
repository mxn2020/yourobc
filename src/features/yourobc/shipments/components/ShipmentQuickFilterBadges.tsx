// src/features/yourobc/shipments/components/ShipmentQuickFilterBadges.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui'

interface ShipmentStats {
  totalShipments: number
  activeShipments: number
  completedShipments: number
  shipmentsByStatus: Record<string, number>
  shipmentsByServiceType: Record<string, number>
  shipmentsByPriority: Record<string, number>
  slaPerformance: {
    onTime: number
    warning: number
    overdue: number
  }
  avgDeliveryTime: number
  totalRevenue: number
  avgRevenue: number
}

interface ShipmentQuickFilterBadgesProps {
  stats: ShipmentStats | undefined
  statusFilter: string
  serviceTypeFilter: string
  onStatusFilterChange: (status: string) => void
  onServiceTypeFilterChange: (serviceType: string) => void
  overdueCount?: number
}

export const ShipmentQuickFilterBadges: FC<ShipmentQuickFilterBadgesProps> = ({
  stats,
  statusFilter,
  serviceTypeFilter,
  onStatusFilterChange,
  onServiceTypeFilterChange,
  overdueCount,
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
        variant={statusFilter === 'quoted' ? 'primary' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('quoted')}
      >
        📋 Quotes ({stats.shipmentsByStatus?.quoted || 0})
      </Badge>

      <Badge
        variant={statusFilter === 'in_transit' ? 'info' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('in_transit')}
      >
        🚛 In Transit ({stats.shipmentsByStatus?.in_transit || 0})
      </Badge>

      <Badge
        variant={statusFilter === 'delivered' ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('delivered')}
      >
        ✅ Delivered ({stats.shipmentsByStatus?.delivered || 0})
      </Badge>

      {/* Service Type Filters */}
      <Badge
        variant={serviceTypeFilter === 'OBC' ? 'primary' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleServiceTypeClick('OBC')}
      >
        🚶‍♂️ OBC ({stats.shipmentsByServiceType?.OBC || 0})
      </Badge>

      <Badge
        variant={serviceTypeFilter === 'NFO' ? 'info' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleServiceTypeClick('NFO')}
      >
        ✈️ NFO ({stats.shipmentsByServiceType?.NFO || 0})
      </Badge>

      {/* Overdue Badge with Link */}
      {overdueCount && overdueCount > 0 && (
        <Link to="/{-$locale}/yourobc/shipments/overdue">
          <Badge variant="danger" className="cursor-pointer">
            🚨 Overdue ({overdueCount})
          </Badge>
        </Link>
      )}
    </div>
  )
}
