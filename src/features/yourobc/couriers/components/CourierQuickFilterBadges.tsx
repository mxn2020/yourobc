// src/features/yourobc/couriers/components/CourierQuickFilterBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'

interface CourierStats {
  totalCouriers: number
  activeCouriers: number
  onlineCouriers: number
  availableCouriers?: number
  busyCouriers?: number
  totalShipments?: number
  onTimeDeliveryRate?: number
  totalCommissions?: number
  pendingCommissions?: number
  couriersByStatus: {
    available: number
    busy: number
    offline: number
  }
  couriersByLocation: Record<string, number>
  avgShipmentsPerCourier: number
}

interface CourierQuickFilterBadgesProps {
  stats: CourierStats | undefined | null
  statusFilter: string
  serviceTypeFilter: string
  onStatusFilterChange: (status: string) => void
  onServiceTypeFilterChange: (serviceType: string) => void
}

export const CourierQuickFilterBadges: FC<CourierQuickFilterBadgesProps> = ({
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
        variant={statusFilter === 'available' ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('available')}
      >
        ✅ Available ({stats.availableCouriers})
      </Badge>

      <Badge
        variant={statusFilter === 'busy' ? 'info' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('busy')}
      >
        📋 Busy ({stats.busyCouriers})
      </Badge>

      <Badge
        variant={statusFilter === 'offline' ? 'warning' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('offline')}
      >
        ⏸️ Offline ({stats.couriersByStatus.offline})
      </Badge>
    </div>
  )
}
