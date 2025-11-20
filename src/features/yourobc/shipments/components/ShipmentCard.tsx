// src/features/yourobc/shipments/components/ShipmentCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import { SHIPMENT_STATUS_LABELS, PRIORITY_LABELS, SLA_STATUS_LABELS, SERVICE_TYPE_LABELS } from '../types'
import type { ShipmentCardProps } from '../types'
import { AssignedToDisplay } from './AssignedToDisplay'
import { PickupDeliveryTimes } from './TimezonedDateTime'
import { CustomsBadges } from './CustomsBadges'
import { DocumentStatusIndicator } from './DocumentStatusIndicator'
import { NextTaskDisplay } from '../../tasks/components/NextTaskDisplay'

export const ShipmentCard: FC<ShipmentCardProps> = ({
  shipment,
  onClick,
  showCustomer = true,
  showCourier = true,
  compact = false,
  showActions = true,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
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

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'standard': return 'secondary'
      case 'urgent': return 'warning'
      case 'critical': return 'danger'
      default: return 'secondary'
    }
  }

  const getSLAVariant = (slaStatus: string) => {
    switch (slaStatus) {
      case 'on_time': return 'success'
      case 'warning': return 'warning'
      case 'overdue': return 'danger'
      default: return 'secondary'
    }
  }

  const getServiceIcon = (serviceType: string) => {
    return serviceType === 'OBC' ? '🚶‍♂️' : '✈️'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  return (
    <Card
      hover={!!onClick}
      onClick={onClick ? () => onClick(shipment) : undefined}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {getServiceIcon(shipment.serviceType)} {shipment.shipmentNumber}
              </h3>

              <Badge variant={getStatusVariant(shipment.currentStatus)} size="sm">
                {SHIPMENT_STATUS_LABELS[shipment.currentStatus]}
              </Badge>

              {shipment.priority !== 'standard' && (
                <Badge variant={getPriorityVariant(shipment.priority)} size="sm">
                  {PRIORITY_LABELS[shipment.priority]}
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-1">
              {SERVICE_TYPE_LABELS[shipment.serviceType]}
            </div>

            {shipment.customerReference && (
              <div className="text-sm text-gray-600 mb-1">
                Ref: {shipment.customerReference}
              </div>
            )}

            <div className="text-sm text-gray-600">
              📍 {shipment.formattedOrigin} → {shipment.formattedDestination}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getSLAVariant(shipment.sla.status)} size="sm">
              {SLA_STATUS_LABELS[shipment.sla.status]}
            </Badge>

            {shipment.isOverdue && shipment.overdueHours && (
              <Badge variant="danger" size="sm">
                {shipment.overdueHours}h overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Customer Info */}
        {showCustomer && (
          <div className="mb-4">
            <Link
              to="/yourobc/customers/$customerId"
              params={{ customerId: shipment.customer._id }}
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              🏢 {shipment.customer.companyName}
            </Link>
          </div>
        )}

        {/* Assigned To (Partner/Courier) */}
        {shipment.assignedTo && (
          <div className="mb-4">
            <AssignedToDisplay assignedTo={shipment.assignedTo} showRole={true} />
          </div>
        )}

        {/* Pickup/Delivery Times */}
        {(shipment.pickupTime || shipment.deliveryTime) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <PickupDeliveryTimes
              pickupTime={shipment.pickupTime}
              deliveryTime={shipment.deliveryTime}
              showBerlinTime={true}
            />
          </div>
        )}

        {/* Customs Information */}
        {shipment.customsInfo && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">Customs:</div>
            <CustomsBadges customsInfo={shipment.customsInfo} />
          </div>
        )}

        {/* Document Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <DocumentStatusIndicator
            documentStatus={shipment.documentStatus}
            serviceType={shipment.serviceType}
          />
        </div>

        {/* Next Task */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <NextTaskDisplay shipmentId={shipment._id} />
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-2">
            {shipment.description}
          </p>
        </div>

        {/* Shipment Details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
          <div>
            <div className="font-medium">AWB Number</div>
            <div>{shipment.awbNumber || 'Not assigned'}</div>
          </div>
          <div>
            <div className="font-medium">Deadline</div>
            <div>{formatDate(shipment.sla.deadline)}</div>
          </div>
          <div>
            <div className="font-medium">Dimensions</div>
            <div>
              {shipment.dimensions.length}×{shipment.dimensions.width}×{shipment.dimensions.height} {shipment.dimensions.unit}
            </div>
          </div>
          <div>
            <div className="font-medium">Weight</div>
            <div>{shipment.dimensions.weight} {shipment.dimensions.weightUnit}</div>
          </div>
        </div>

        {/* Pricing */}
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Agreed Price</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(shipment.agreedPrice.amount, shipment.agreedPrice.currency)}
            </span>
          </div>
          {shipment.actualCosts && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">Actual Costs</span>
              <span className="text-sm text-gray-700">
                {formatCurrency(shipment.actualCosts.amount, shipment.actualCosts.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Next Task */}
        {shipment.nextTask && (
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-blue-900">Next Task:</div>
            <div className="text-xs text-blue-800">{shipment.nextTask.description}</div>
            {shipment.nextTask.dueDate && (
              <div className="text-xs text-blue-600 mt-1">
                Due: {formatDateTime(shipment.nextTask.dueDate)}
              </div>
            )}
          </div>
        )}

        {/* Timestamps */}
        <div className="text-xs text-gray-500 mt-4">
          <div className="flex justify-between">
            <span>Created: {formatDate(shipment.createdAt)}</span>
            {shipment.updatedAt && <span>Updated: {formatDate(shipment.updatedAt)}</span>}
          </div>
          {shipment.completedAt && (
            <div className="text-center mt-1 text-green-600">
              Completed: {formatDate(shipment.completedAt)}
            </div>
          )}
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Link
                to="/yourobc/shipments/$shipmentId/status"
                params={{ shipmentId: shipment._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="primary">
                  📋 Update Status
                </Button>
              </Link>

              <Link
                to="/yourobc/shipments/$shipmentId"
                params={{ shipmentId: shipment._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="secondary">
                  View Details
                </Button>
              </Link>
            </div>

            {/* Quick Status Actions */}
            <div className="flex items-center gap-1">
              {shipment.currentStatus === 'quoted' && (
                <button
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Quick book action
                  }}
                >
                  📋 Book
                </button>
              )}
              {shipment.currentStatus === 'booked' && (
                <button
                  className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Quick pickup action
                  }}
                >
                  📦 Pickup
                </button>
              )}
              {shipment.currentStatus === 'in_transit' && (
                <button
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Quick delivery action
                  }}
                >
                  ✅ Deliver
                </button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}