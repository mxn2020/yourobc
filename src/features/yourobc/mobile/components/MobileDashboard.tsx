// src/features/yourobc/mobile/components/MobileDashboard.tsx

import { FC, useState, useMemo } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/generated/api'
import type { ShipmentId } from '@/features/yourobc/shipments/types'
import { ShipmentCard, ShipmentCardSkeleton } from './ShipmentCard'
import { MobileFilters, type QuickFilter } from './MobileFilters'
import { MobileSearchBar } from './MobileFilters'
import { useMobileDetect } from '../hooks/useMobileDetect'

interface MobileDashboardProps {
  authUserId: string
  onStatusUpdate?: (shipmentId: ShipmentId) => void
  showSearch?: boolean
  defaultFilter?: QuickFilter
}

export const MobileDashboard: FC<MobileDashboardProps> = ({
  authUserId,
  onStatusUpdate,
  showSearch = true,
  defaultFilter = 'all',
}) => {
  const { isMobile } = useMobileDetect()
  const [activeFilter, setActiveFilter] = useState<QuickFilter>(defaultFilter)
  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch all shipments
  const shipmentsData = useQuery(api.lib.yourobc.shipments.queries.getShipments, {
    authUserId,
  })

  const shipments = shipmentsData?.shipments

  // Filter shipments based on active filter and search
  const filteredShipments = useMemo(() => {
    if (!shipments) return []

    let filtered = [...shipments]
    const now = Date.now()

    // Apply quick filter
    switch (activeFilter) {
      case 'my_orders':
        filtered = filtered.filter((s) => s.courier?._id === authUserId || s.assignedCourierId === authUserId)
        break
      case 'sla_urgent':
        filtered = filtered.filter((s) => {
          if (!s.sla?.deadline) return false
          const remaining = s.sla.deadline - now
          return remaining > 0 && remaining < 2 * 60 * 60 * 1000 // Less than 2 hours
        })
        break
      case 'today_due':
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)
        filtered = filtered.filter((s) => {
          if (!s.sla?.deadline) return false
          return s.sla.deadline >= todayStart.getTime() && s.sla.deadline <= todayEnd.getTime()
        })
        break
      case 'awaiting_pod':
        filtered = filtered.filter((s) => s.currentStatus === 'delivered' || s.currentStatus === 'document')
        break
      case 'in_transit':
        filtered = filtered.filter((s) => s.currentStatus === 'in_transit')
        break
      case 'customs':
        filtered = filtered.filter((s) => s.currentStatus === 'customs')
        break
      case 'all':
      default:
        // Show all active shipments (not delivered, invoiced, or cancelled)
        filtered = filtered.filter(
          (s) => s.currentStatus !== 'delivered' && s.currentStatus !== 'invoiced' && s.currentStatus !== 'cancelled'
        )
        break
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.shipmentNumber.toLowerCase().includes(query) ||
          s.customer?.companyName?.toLowerCase().includes(query) ||
          s.origin.city.toLowerCase().includes(query) ||
          s.origin.country.toLowerCase().includes(query) ||
          s.destination.city.toLowerCase().includes(query) ||
          s.destination.country.toLowerCase().includes(query)
      )
    }

    // Sort by SLA deadline (urgent first)
    filtered.sort((a, b) => {
      // Items with SLA deadline first
      if (a.sla?.deadline && !b.sla?.deadline) return -1
      if (!a.sla?.deadline && b.sla?.deadline) return 1

      // Both have SLA - sort by urgency
      if (a.sla?.deadline && b.sla?.deadline) {
        return a.sla.deadline - b.sla.deadline
      }

      // Neither has SLA - sort by creation date (newest first)
      return (b._creationTime ?? 0) - (a._creationTime ?? 0)
    })

    return filtered
  }, [shipments, activeFilter, searchQuery, authUserId])

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    if (!shipments) return {}

    const now = Date.now()
    return {
      all: shipments.filter((s) => s.currentStatus !== 'delivered' && s.currentStatus !== 'invoiced' && s.currentStatus !== 'cancelled').length,
      my_orders: shipments.filter((s) => s.courier?._id === authUserId || s.assignedCourierId === authUserId).length,
      sla_urgent: shipments.filter((s) => {
        if (!s.sla?.deadline) return false
        const remaining = s.sla.deadline - now
        return remaining > 0 && remaining < 2 * 60 * 60 * 1000
      }).length,
      today_due: shipments.filter((s) => {
        if (!s.sla?.deadline) return false
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)
        return s.sla.deadline >= todayStart.getTime() && s.sla.deadline <= todayEnd.getTime()
      }).length,
      awaiting_pod: shipments.filter((s) => s.currentStatus === 'delivered' || s.currentStatus === 'document')
        .length,
      in_transit: shipments.filter((s) => s.currentStatus === 'in_transit').length,
      customs: shipments.filter((s) => s.currentStatus === 'customs').length,
    }
  }, [shipments, authUserId])

  // Pull to refresh handler
  const handleRefresh = async () => {
    setRefreshing(true)
    // Trigger refetch (Convex handles this automatically)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  // Loading state
  if (shipments === undefined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MobileFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
        {showSearch && (
          <MobileSearchBar value={searchQuery} onChange={setSearchQuery} />
        )}
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <ShipmentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Chips */}
      <MobileFilters
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={filterCounts}
      />

      {/* Search Bar */}
      {showSearch && (
        <MobileSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      )}

      {/* Pull to Refresh Indicator */}
      {refreshing && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Results Summary */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <div className="text-sm text-gray-600">
          {filteredShipments.length} {filteredShipments.length === 1 ? 'shipment' : 'yourobcShipments'}
          {searchQuery && (
            <span className="ml-1">
              matching "<span className="font-medium">{searchQuery}</span>"
            </span>
          )}
        </div>
      </div>

      {/* Shipment List */}
      <div className="p-4 space-y-3 pb-20">
        {filteredShipments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <div className="text-lg font-semibold text-gray-900 mb-2">No shipments found</div>
            <div className="text-sm text-gray-600">
              {searchQuery ? (
                <>
                  No results for "{searchQuery}".
                  <button
                    onClick={() => setSearchQuery('')}
                    className="block mx-auto mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                'Try adjusting your filters'
              )}
            </div>
          </div>
        ) : (
          filteredShipments.map((shipment) => (
            <ShipmentCard
              key={shipment._id}
              shipment={{
                _id: shipment._id,
                shipmentNumber: shipment.shipmentNumber,
                status: shipment.currentStatus,
                customer: shipment.customer ? { companyName: shipment.customer.companyName } : undefined,
                origin: `${shipment.origin.city}, ${shipment.origin.country}`,
                destination: `${shipment.destination.city}, ${shipment.destination.country}`,
                slaDeadline: shipment.sla?.deadline,
                courier: shipment.courier ? { name: `${shipment.courier.firstName} ${shipment.courier.lastName}` } : null,
                partner: shipment.partner ? { companyName: shipment.partner.companyName } : null,
                serviceType: shipment.serviceType,
                createdAt: shipment.createdAt || Date.now(),
              }}
              onQuickStatus={onStatusUpdate}
            />
          ))
        )}
      </div>

      {/* Bottom Padding for Navigation */}
      <div className="h-20" />
    </div>
  )
}

/**
 * Compact mobile dashboard for embedding
 */
export const MobileDashboardCompact: FC<Omit<MobileDashboardProps, 'showSearch'>> = (props) => {
  return <MobileDashboard {...props} showSearch={false} />
}
