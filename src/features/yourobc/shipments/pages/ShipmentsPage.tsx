// src/features/yourobc/shipments/pages/ShipmentsPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { ShipmentCard } from '../components/ShipmentCard'
import { ShipmentsPageHeader } from '../components/ShipmentsPageHeader'
import { ShipmentsFilters } from '../components/ShipmentsFilters'
import { ShipmentQuickFilterBadges } from '../components/ShipmentQuickFilterBadges'
import { ShipmentsTable } from '../components/ShipmentsTable'
import { ShipmentsHelpSection } from '../components/ShipmentsHelpSection'
import { ShipmentStats } from '../components/ShipmentStats'
import { useShipments, useOverdueShipments } from '../hooks/useShipments'
import { Button, Card, Loading, Alert, AlertDescription, PermissionDenied, ErrorState } from '@/components/ui'
import type { ShipmentListItem } from '../types'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki/components/WikiSidebar'

export const ShipmentsPage: FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')

  const {
    shipments,
    stats,
    isLoading,
    isStatsLoading,
    error,
    isPermissionError,
    refetch,
    canCreateShipments,
  } = useShipments({
    limit: 50,
  })

  const { shipments: overdueShipments, hasOverdue } = useOverdueShipments(10)

  const handleShipmentClick = (shipment: ShipmentListItem) => {
    navigate({
      to: '/yourobc/shipments/$shipmentId',
      params: { shipmentId: shipment._id },
    })
  }

  const filteredShipments = shipments.filter((shipment) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        shipment.shipmentNumber?.toLowerCase().includes(searchLower) ||
        shipment.awbNumber?.toLowerCase().includes(searchLower) ||
        shipment.customerReference?.toLowerCase().includes(searchLower) ||
        shipment.description?.toLowerCase().includes(searchLower) ||
        shipment.customer?.companyName?.toLowerCase().includes(searchLower) ||
        shipment.courier?.firstName?.toLowerCase().includes(searchLower) ||
        shipment.courier?.lastName?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && shipment.currentStatus !== statusFilter) return false

    // Service type filter
    if (serviceTypeFilter && shipment.serviceType !== serviceTypeFilter) return false

    return true
  })

  if (isLoading && shipments.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  // Handle permission errors
  if (isPermissionError && error) {
    return (
      <PermissionDenied
        permission={error.permission}
        module="Shipments"
        message={error.message}
        showDetails={true}
      />
    )
  }

  // Handle other errors
  if (error) {
    return <ErrorState error={error} onRetry={refetch} showDetails={true} />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <ShipmentsPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreateShipments}
          overdueCount={overdueShipments.length}
        />

        {/* Overdue Alert */}
        {hasOverdue && (
          <Alert variant="warning" className="mb-6">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  ⚠️ <strong>{overdueShipments.length} shipment{overdueShipments.length !== 1 ? 's' : ''} overdue</strong> -
                  Immediate attention required to meet customer commitments.
                </div>
                <Link to="/yourobc/shipments/overdue">
                  <Button variant="outline" size="sm">
                    View Overdue
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        {!isStatsLoading && stats ? (
          <div className="mb-8">
            <ShipmentStats />
          </div>
        ) : isStatsLoading ? (
          <div className="flex justify-center py-8 mb-8">
            <Loading size="lg" />
          </div>
        ) : null}

        {/* Filters */}
        <ShipmentsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onServiceTypeChange={setServiceTypeFilter}
          onClearFilters={() => {
            setSearchTerm('')
            setStatusFilter('')
            setServiceTypeFilter('')
          }}
          showClearButton={!!(searchTerm || statusFilter || serviceTypeFilter)}
        />

        {/* Quick Filter Pills */}
        <ShipmentQuickFilterBadges
          stats={stats}
          statusFilter={statusFilter}
          serviceTypeFilter={serviceTypeFilter}
          onStatusFilterChange={setStatusFilter}
          onServiceTypeFilterChange={setServiceTypeFilter}
          overdueCount={overdueShipments.length}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredShipments.length} of {shipments.length} shipments
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                for "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Shipments Display */}
        {filteredShipments.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'No shipments found matching your criteria'
                  : 'No shipments yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'Try adjusting your search or filters'
                  : canCreateShipments
                  ? 'Create your first shipment to get started!'
                  : 'Shipments will appear here once created.'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredShipments.map((shipment) => (
              <ShipmentCard
                key={shipment._id}
                shipment={shipment}
                onClick={handleShipmentClick}
                showCustomer={true}
                showCourier={true}
                compact={false}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <ShipmentsTable
            shipments={filteredShipments}
            onRowClick={handleShipmentClick}
          />
        )}

        {/* Help Section */}
        <ShipmentsHelpSection />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Shipments" title="Shipment Wiki Helper" />
      </div>
    </div>
  )
}
