// src/features/yourobc/shipments/components/ShipmentsPageHeader.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Button, Badge } from '@/components/ui'

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

interface ShipmentsPageHeaderProps {
  stats: ShipmentStats | undefined
  isStatsLoading: boolean
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  canCreate: boolean
  overdueCount?: number
}

export const ShipmentsPageHeader: FC<ShipmentsPageHeaderProps> = ({
  stats,
  isStatsLoading,
  viewMode,
  onViewModeChange,
  canCreate,
  overdueCount,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shipments</h1>
        <p className="text-gray-600 mt-2">
          Track and manage all shipments from quote to delivery
        </p>
        {!isStatsLoading && stats && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{stats.totalShipments} total</span>
            <span>•</span>
            <Badge variant="primary" size="sm">{stats.activeShipments} active</Badge>
            <span>•</span>
            <Badge variant="success" size="sm">{stats.completedShipments} completed</Badge>
            {overdueCount && overdueCount > 0 && (
              <>
                <span>•</span>
                <Badge variant="danger" size="sm">{overdueCount} overdue</Badge>
              </>
            )}
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
          <Link to="/yourobc/shipments/new">
            <Button variant="primary">
              + New Shipment
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
