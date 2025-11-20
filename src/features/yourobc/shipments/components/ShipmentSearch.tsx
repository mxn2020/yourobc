// src/features/yourobc/shipments/components/ShipmentSearch.tsx

import { FC, useState } from 'react'
import { Input, Card, Badge, Loading, Button } from '@/components/ui'
import { useShipmentSearch } from '../hooks/useShipments'
import { SHIPMENT_STATUS_LABELS, SERVICE_TYPE_LABELS } from '../types'
import type { ShipmentListItem, ShipmentWithDetails } from '../types'

interface ShipmentSearchProps {
  onSelect?: (shipment: ShipmentListItem | null) => void
  placeholder?: string
  limit?: number
  selectedShipment?: ShipmentListItem | ShipmentWithDetails | null
  showSelectedShipment?: boolean
}

export const ShipmentSearch: FC<ShipmentSearchProps> = ({
  onSelect,
  placeholder = 'Search shipments...',
  limit = 10,
  selectedShipment = null,
  showSelectedShipment = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { results, isLoading, hasResults } = useShipmentSearch(searchTerm)

  const handleSelect = (shipment: ShipmentListItem) => {
    onSelect?.(shipment)
    setSearchTerm('')
    setShowResults(false)
  }

  const handleRemove = () => {
    onSelect?.(null)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatAddress = (address: { city: string; country: string }) => {
    return `${address.city}, ${address.country}`
  }

  const getOriginDestination = (shipment: ShipmentListItem | ShipmentWithDetails) => {
    const formattedOrigin = 'formattedOrigin' in shipment ? shipment.formattedOrigin : undefined
    const formattedDestination = 'formattedDestination' in shipment ? shipment.formattedDestination : undefined
    const origin = formattedOrigin || formatAddress(shipment.origin)
    const destination = formattedDestination || formatAddress(shipment.destination)
    return { origin, destination }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'quoted': return 'secondary'
      case 'booked': return 'primary'
      case 'pickup': return 'warning'
      case 'in_transit': return 'info'
      case 'customs': return 'warning'
      case 'delivered': return 'success'
      case 'document': return 'info'
      case 'invoiced': return 'success'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const getServiceIcon = (serviceType: string) => {
    return serviceType === 'OBC' ? '🚶‍♂️' : '✈️'
  }

  return (
    <div className="space-y-2">
      {/* Show selected shipment if available */}
      {showSelectedShipment && selectedShipment && (
        <Card className="bg-green-50 border-green-200">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  ✓ {selectedShipment.shipmentNumber}
                </div>
                <div className="text-sm text-gray-600">
                  {getServiceIcon(selectedShipment.serviceType)} {SERVICE_TYPE_LABELS[selectedShipment.serviceType]}
                </div>
                <div className="text-sm text-gray-600">
                  📍 {formatAddress(selectedShipment.origin)} → {formatAddress(selectedShipment.destination)}
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge variant={getStatusVariant(selectedShipment.currentStatus)} size="sm">
                    {SHIPMENT_STATUS_LABELS[selectedShipment.currentStatus]}
                  </Badge>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(selectedShipment.agreedPrice.amount, selectedShipment.agreedPrice.currency)}
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                ✕ Remove
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Show search input when no shipment is selected or showSelectedShipment is false */}
      {(!showSelectedShipment || !selectedShipment) && (
        <div className="relative">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            placeholder={placeholder}
          />

          {showResults && searchTerm.length >= 2 && (
        <Card className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loading size="sm" />
            </div>
          ) : hasResults ? (
            <div className="divide-y">
              {results.slice(0, limit).map((shipment) => {
                const { origin, destination } = getOriginDestination(shipment)

                return (
                  <div
                    key={shipment._id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSelect(shipment)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-medium text-gray-900">
                            {getServiceIcon(shipment.serviceType)} {shipment.shipmentNumber}
                          </div>
                          <Badge
                            variant={getStatusVariant(shipment.currentStatus)}
                            size="sm"
                          >
                            {SHIPMENT_STATUS_LABELS[shipment.currentStatus]}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 mb-1">
                          {SERVICE_TYPE_LABELS[shipment.serviceType]}
                        </div>

                        <div className="text-sm text-gray-600 mb-1">
                          🏢 {shipment.customer.companyName}
                        </div>

                        <div className="text-sm text-gray-500">
                          📍 {origin} → {destination}
                        </div>

                      {shipment.customerReference && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ref: {shipment.customerReference}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 ml-4">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(shipment.agreedPrice.amount, shipment.agreedPrice.currency)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {formatDate(shipment.sla.deadline)}
                      </div>
                      {shipment.isOverdue && (
                        <Badge variant="danger" size="sm">
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description preview */}
                  <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                    {shipment.description}
                  </div>

                  {/* Courier assignment */}
                  {shipment.courier && (
                    <div className="mt-2 text-xs text-gray-500">
                      👤 {shipment.courier.firstName} {shipment.courier.lastName}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No shipments found</div>
          )}
        </Card>
      )}
        </div>
      )}
    </div>
  )
}