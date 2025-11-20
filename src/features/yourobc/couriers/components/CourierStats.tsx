// src/features/yourobc/couriers/components/CourierStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useCouriers } from '../hooks/useCouriers'

export const CourierStats: FC = () => {
  const { stats, isStatsLoading } = useCouriers()

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

  // Calculate additional metrics
  const availabilityRate = stats.totalCouriers > 0
    ? Math.round((stats.availableCouriers / stats.totalCouriers) * 100)
    : 0

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCouriers}</div>
                <div className="text-sm text-gray-600">Total Couriers</div>
              </div>
              <div className="text-3xl">🚚</div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">
                {stats.activeCouriers} active
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.availableCouriers}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.couriersByStatus.busy} busy, {stats.couriersByStatus.offline} offline
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalShipments}</div>
                <div className="text-sm text-gray-600">Total Shipments</div>
              </div>
              <div className="text-3xl">📦</div>
            </div>
            <div className="mt-2">
              <Badge variant="success" size="sm">
                {stats.onTimeDeliveryRate}% on-time
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  €{stats.totalCommissions?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">Commissions</div>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">Total paid</div>
          </div>
        </Card>
      </div>

      {/* Row 2: 3 List Metrics + Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* List Metric 1: By Location */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Location</h3>
            <div className="space-y-2">
              {Object.entries(stats.couriersByLocation || {})
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 4)
                .map(([location, count]) => (
                  <div key={location} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{location}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* List Metric 2: Performance */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipment Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Shipments</span>
                <Badge variant="primary" size="sm">
                  {stats.totalShipments || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">On-Time Rate</span>
                <Badge variant="success" size="sm">
                  {stats.onTimeDeliveryRate || 0}%
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Avg per Courier</span>
                <Badge variant="secondary" size="sm">
                  {stats.avgShipmentsPerCourier.toFixed(1)}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* List Metric 3: By Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Available</span>
                <Badge variant="success" size="sm">
                  {stats.availableCouriers}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Busy</span>
                <Badge variant="info" size="sm">
                  {stats.busyCouriers}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Offline</span>
                <Badge variant="warning" size="sm">
                  {stats.couriersByStatus.offline}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Network Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-blue-700 mb-1">Availability Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {availabilityRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">On-Time Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.onTimeDeliveryRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Avg Shipments</div>
                <div className="text-sm font-semibold text-blue-900">
                  {stats.avgShipmentsPerCourier.toFixed(1)} per courier
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

