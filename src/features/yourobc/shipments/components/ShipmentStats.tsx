// src/features/yourobc/shipments/components/ShipmentStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useShipments } from '../hooks/useShipments'

export const ShipmentStats: FC = () => {
  const { stats, isStatsLoading } = useShipments()

  if (isStatsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatHours = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Shipments */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalShipments}</div>
              <div className="text-sm text-gray-600">Total Shipments</div>
            </div>
            <div className="text-3xl">📦</div>
          </div>
          <div className="mt-2 flex gap-2">
            <Badge variant="primary" size="sm">
              {stats.activeShipments} active
            </Badge>
            <Badge variant="success" size="sm">
              {stats.completedShipments} completed
            </Badge>
          </div>
        </div>
      </Card>

      {/* SLA Performance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.slaPerformance.onTime + stats.slaPerformance.warning}
              </div>
              <div className="text-sm text-gray-600">On Track</div>
            </div>
            <div className="text-3xl">⏱️</div>
          </div>
          <div className="mt-2 flex gap-2">
            <Badge variant="success" size="sm">
              {stats.slaPerformance.onTime} on-time
            </Badge>
            {stats.slaPerformance.overdue > 0 && (
              <Badge variant="danger" size="sm">
                {stats.slaPerformance.overdue} overdue
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Revenue */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-3xl">💰</div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Avg: {formatCurrency(stats.avgRevenue)} per shipment
          </div>
        </div>
      </Card>

      {/* Delivery Performance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatHours(stats.avgDeliveryTime)}
              </div>
              <div className="text-sm text-gray-600">Avg Delivery Time</div>
            </div>
            <div className="text-3xl">🚀</div>
          </div>
          <div className="mt-2">
            <Badge variant="info" size="sm">
              Based on {stats.completedShipments} deliveries
            </Badge>
          </div>
        </div>
      </Card>

      {/* Service Type Breakdown */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-900">Service Types</div>
            <div className="text-2xl">🛫</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">🚶‍♂️ OBC</span>
              <span className="font-medium">
                {stats.shipmentsByServiceType?.OBC || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">✈️ NFO</span>
              <span className="font-medium">
                {stats.shipmentsByServiceType?.NFO || 0}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-900">Priority Levels</div>
            <div className="text-2xl">⚡</div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Standard</span>
              <span className="font-medium">
                {stats.shipmentsByPriority?.standard || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Urgent</span>
              <span className="font-medium text-orange-600">
                {stats.shipmentsByPriority?.urgent || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical</span>
              <span className="font-medium text-red-600">
                {stats.shipmentsByPriority?.critical || 0}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-900">Current Status</div>
            <div className="text-2xl">📊</div>
          </div>
          
          <div className="space-y-1 text-xs">
            {Object.entries(stats.shipmentsByStatus || {})
              .filter(([_, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </Card>

      {/* Quick Performance Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-blue-900">Performance Summary</div>
            <div className="text-2xl">📈</div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center text-blue-800">
              <span>On-Time Rate:</span>
              <span className="font-semibold">
                {stats.totalShipments > 0 
                  ? Math.round((stats.slaPerformance.onTime / stats.totalShipments) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center text-blue-800">
              <span>Active/Total:</span>
              <span className="font-semibold">
                {stats.activeShipments}/{stats.totalShipments}
              </span>
            </div>
            <div className="flex justify-between items-center text-blue-800">
              <span>Completion Rate:</span>
              <span className="font-semibold">
                {stats.totalShipments > 0 
                  ? Math.round((stats.completedShipments / stats.totalShipments) * 100)
                  : 0}%
              </span>
            </div>
          </div>
          
          {stats.slaPerformance.overdue > 0 && (
            <div className="mt-3 p-2 bg-red-100 rounded-lg border border-red-200">
              <div className="text-xs text-red-800 font-medium">
                ⚠️ {stats.slaPerformance.overdue} shipment{stats.slaPerformance.overdue !== 1 ? 's' : ''} overdue
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}