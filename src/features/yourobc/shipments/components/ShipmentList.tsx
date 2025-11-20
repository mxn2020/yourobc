// src/features/yourobc/shipments/components/ShipmentList.tsx

import { FC, useState, useMemo } from 'react'
import { ShipmentCard } from './ShipmentCard'
import { useShipments } from '../hooks/useShipments'
import {
  Card,
  Input,
  Button,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Loading,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui'
import { 
  SHIPMENT_CONSTANTS, 
  SHIPMENT_STATUS_LABELS, 
  PRIORITY_LABELS, 
  SERVICE_TYPE_LABELS,
  SLA_STATUS_LABELS,
} from '../types'
import type { ShipmentSearchFilters, ShipmentListItem } from '../types'

interface ShipmentListProps {
  filters?: ShipmentSearchFilters
  showFilters?: boolean
  onShipmentClick?: (shipment: ShipmentListItem) => void
  limit?: number
  compact?: boolean
  viewMode?: 'grid' | 'table'
  showCustomer?: boolean
  showCourier?: boolean
}

export const ShipmentList: FC<ShipmentListProps> = ({
  filters: initialFilters,
  showFilters = true,
  onShipmentClick,
  limit = 20,
  compact = false,
  viewMode = 'grid',
  showCustomer = true,
  showCourier = true,
}) => {
  const [filters, setFilters] = useState<ShipmentSearchFilters>(initialFilters || {})
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'overdue' | 'completed'>('all')

  const {
    shipments,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
    canCreateShipments,
  } = useShipments({
    limit,
    filters: {
      ...filters,
      search: searchTerm,
    },
  })

  const filteredShipments = useMemo(() => {
    let filtered = shipments

    // Apply tab filters
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(shipment => 
          !['delivered', 'invoiced', 'cancelled'].includes(shipment.currentStatus)
        )
        break
      case 'overdue':
        filtered = filtered.filter(shipment => shipment.isOverdue)
        break
      case 'completed':
        filtered = filtered.filter(shipment => 
          ['delivered', 'invoiced'].includes(shipment.currentStatus)
        )
        break
      default:
        // Show all
        break
    }

    // Search filter
    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (shipment) =>
          shipment.shipmentNumber?.toLowerCase().includes(searchLower) ||
          shipment.awbNumber?.toLowerCase().includes(searchLower) ||
          shipment.customerReference?.toLowerCase().includes(searchLower) ||
          shipment.description?.toLowerCase().includes(searchLower) ||
          shipment.customer?.companyName?.toLowerCase().includes(searchLower) ||
          shipment.courier?.firstName?.toLowerCase().includes(searchLower) ||
          shipment.courier?.lastName?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [shipments, searchTerm, activeTab])

  // Calculate tab counts
  const tabCounts = useMemo(() => {
    return {
      all: shipments.length,
      active: shipments.filter(s => !['delivered', 'invoiced', 'cancelled'].includes(s.currentStatus)).length,
      overdue: shipments.filter(s => s.isOverdue).length,
      completed: shipments.filter(s => ['delivered', 'invoiced'].includes(s.currentStatus)).length,
    }
  }, [shipments])

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        status: [status as any],
      }))
    }
  }

  const handleServiceTypeFilter = (serviceType: string) => {
    if (!serviceType) {
      setFilters((prev) => ({ ...prev, serviceType: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        serviceType: [serviceType as 'OBC' | 'NFO'],
      }))
    }
  }

  const handlePriorityFilter = (priority: string) => {
    if (!priority) {
      setFilters((prev) => ({ ...prev, priority: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        priority: [priority as any],
      }))
    }
  }

  const handleSLAFilter = (slaStatus: string) => {
    if (!slaStatus) {
      setFilters((prev) => ({ ...prev, slaStatus: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        slaStatus: [slaStatus as any],
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm('')
    setActiveTab('all')
  }

  if (isLoading && shipments.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8 p-6">
          <div className="text-red-500 mb-2">Error loading shipments</div>
          <p className="text-gray-500 text-sm mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="primary" size="sm">
            Try again
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Card>
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
          <TabsList className="w-full justify-start border-b">
            <TabsTrigger value="all">
              All ({tabCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({tabCounts.active})
            </TabsTrigger>
            <TabsTrigger value="overdue">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Overdue ({tabCounts.overdue})
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({tabCounts.completed})
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            {/* Search and Filters */}
            {showFilters && (
              <div className="space-y-4 mb-6">
                {/* Search Bar */}
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search shipments by number, AWB, reference, description, customer, or courier..."
                />

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select
                    value={filters.status?.[0] || ''}
                    onValueChange={handleStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      {Object.entries(SHIPMENT_STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.serviceType?.[0] || ''}
                    onValueChange={handleServiceTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Service Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Service Types</SelectItem>
                      <SelectItem value="OBC">{SERVICE_TYPE_LABELS.OBC}</SelectItem>
                      <SelectItem value="NFO">{SERVICE_TYPE_LABELS.NFO}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.priority?.[0] || ''}
                    onValueChange={handlePriorityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.slaStatus?.[0] || ''}
                    onValueChange={handleSLAFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All SLA Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All SLA Status</SelectItem>
                      {Object.entries(SLA_STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={activeTab === 'overdue' ? 'danger' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setActiveTab('overdue')}
                  >
                    🚨 Overdue Only
                  </Badge>

                  <Badge
                    variant={filters.priority?.[0] === 'urgent' ? 'warning' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handlePriorityFilter('urgent')}
                  >
                    ⚡ Urgent Priority
                  </Badge>

                  <Badge
                    variant={filters.serviceType?.[0] === 'OBC' ? 'primary' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleServiceTypeFilter('OBC')}
                  >
                    🚶‍♂️ OBC Only
                  </Badge>

                  <Badge
                    variant={filters.serviceType?.[0] === 'NFO' ? 'info' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleServiceTypeFilter('NFO')}
                  >
                    ✈️ NFO Only
                  </Badge>

                  <Badge
                    variant="info"
                    className="cursor-pointer"
                    onClick={clearAllFilters}
                  >
                    🔄 Clear All
                  </Badge>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                Showing {filteredShipments.length} of {total} shipments
                {searchTerm && (
                  <span className="ml-2 text-blue-600 font-medium">
                    for "{searchTerm}"
                  </span>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <TabsContent value="all">
              <ShipmentGrid 
                shipments={filteredShipments}
                onShipmentClick={onShipmentClick}
                showCustomer={showCustomer}
                showCourier={showCourier}
                compact={compact}
              />
            </TabsContent>

            <TabsContent value="active">
              <ShipmentGrid 
                shipments={filteredShipments}
                onShipmentClick={onShipmentClick}
                showCustomer={showCustomer}
                showCourier={showCourier}
                compact={compact}
              />
            </TabsContent>

            <TabsContent value="overdue">
              <ShipmentGrid 
                shipments={filteredShipments}
                onShipmentClick={onShipmentClick}
                showCustomer={showCustomer}
                showCourier={showCourier}
                compact={compact}
              />
            </TabsContent>

            <TabsContent value="completed">
              <ShipmentGrid 
                shipments={filteredShipments}
                onShipmentClick={onShipmentClick}
                showCustomer={showCustomer}
                showCourier={showCourier}
                compact={compact}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      {/* Load More */}
      {hasMore && filteredShipments.length > 0 && (
        <div className="text-center">
          <Button onClick={() => refetch()} variant="primary">
            Load More Shipments
          </Button>
        </div>
      )}
    </div>
  )
}

// Separate component for the shipment grid/list
const ShipmentGrid: FC<{
  shipments: ShipmentListItem[]
  onShipmentClick?: (shipment: ShipmentListItem) => void
  showCustomer: boolean
  showCourier: boolean
  compact: boolean
}> = ({ shipments, onShipmentClick, showCustomer, showCourier, compact }) => {
  if (shipments.length === 0) {
    return (
      <Card>
        <div className="text-center py-12 p-6">
          <div className="text-gray-500 text-lg mb-2">No shipments found</div>
          <p className="text-gray-400">
            Try adjusting your search or filters to find shipments.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div
      className={`grid gap-6 ${
        compact
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}
    >
      {shipments.map((shipment) => (
        <ShipmentCard
          key={shipment._id}
          shipment={shipment}
          onClick={onShipmentClick}
          showCustomer={showCustomer}
          showCourier={showCourier}
          compact={compact}
          showActions={true}
        />
      ))}
    </div>
  )
}