// src/features/yourobc/couriers/components/CouriersPageHeader.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Button, Badge } from '@/components/ui'

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

interface CouriersPageHeaderProps {
  stats: CourierStats | undefined | null
  isStatsLoading: boolean 
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  canCreate: boolean
}

export const CouriersPageHeader: FC<CouriersPageHeaderProps> = ({
  stats,
  isStatsLoading,
  viewMode,
  onViewModeChange,
  canCreate,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Couriers</h1>
        <p className="text-gray-600 mt-2">
          Manage your courier network and track availability
        </p>
        {!isStatsLoading && stats && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{stats.totalCouriers} total</span>
            <span>•</span>
            <Badge variant="success" size="sm">{stats.availableCouriers} available</Badge>
            <span>•</span>
            <Badge variant="info" size="sm">{stats.busyCouriers} busy</Badge>
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
          <Link to="/{-$locale}/yourobc/couriers/new">
            <Button variant="primary">
              + New Courier
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
