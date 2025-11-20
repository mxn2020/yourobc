// src/features/yourobc/shipments/components/ShipmentsTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import type { ShipmentListItem } from '../types'
import { AssignedToDisplayCompact } from './AssignedToDisplay'
import { TimezonedDateTimeCompact, PickupDeliveryTimes } from './TimezonedDateTime'
import { CustomsBadgesCompact } from './CustomsBadges'
import { DocumentStatusIndicatorCompact } from './DocumentStatusIndicator'
import { NextTaskDisplayCompact } from '../../tasks/components/NextTaskDisplay'

interface ShipmentsTableProps {
  shipments: ShipmentListItem[]
  onRowClick: (shipment: ShipmentListItem) => void
}

type SortField = 'shipmentNumber' | 'currentStatus' | 'deadline' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const ShipmentsTable: FC<ShipmentsTableProps> = ({ shipments, onRowClick }) => {
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedShipments = useMemo(() => {
    return [...shipments].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'shipmentNumber':
          aValue = (a.shipmentNumber || '').toLowerCase()
          bValue = (b.shipmentNumber || '').toLowerCase()
          break
        case 'currentStatus':
          aValue = a.currentStatus.toLowerCase()
          bValue = b.currentStatus.toLowerCase()
          break
        case 'deadline':
          aValue = a.sla?.deadline || 0
          bValue = b.sla?.deadline || 0
          break
        case 'createdAt':
          aValue = a.createdAt || 0
          bValue = b.createdAt || 0
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }, [shipments, sortField, sortOrder])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'delivered': return 'success'
      case 'in_transit': return 'info'
      case 'quoted': return 'secondary'
      case 'booked': return 'primary'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const SortIcon: FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">⇅</span>
    return sortOrder === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('shipmentNumber')}
              >
                Shipment # <SortIcon field="shipmentNumber" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                AWB Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pickup / Delivery
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customs
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Task
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('currentStatus')}
              >
                Status <SortIcon field="currentStatus" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('deadline')}
              >
                Deadline <SortIcon field="deadline" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedShipments.map((shipment) => (
              <tr
                key={shipment._id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(shipment)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {shipment.shipmentNumber || '-'}
                  </div>
                  {shipment.customerReference && (
                    <div className="text-xs text-gray-500">
                      Ref: {shipment.customerReference}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {shipment.awbNumber || '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {shipment.customer?.companyName || '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant="primary" size="sm">
                    {shipment.serviceType === 'OBC' ? '🚶‍♂️ OBC' : '✈️ NFO'}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {shipment.origin?.city} → {shipment.destination?.city}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <AssignedToDisplayCompact assignedTo={shipment.assignedTo} showRole={true} />
                </td>
                <td className="px-4 py-4">
                  <PickupDeliveryTimes
                    pickupTime={shipment.pickupTime}
                    deliveryTime={shipment.deliveryTime}
                    showBerlinTime={true}
                    compact={true}
                  />
                </td>
                <td className="px-4 py-4">
                  <CustomsBadgesCompact customsInfo={shipment.customsInfo} />
                </td>
                <td className="px-4 py-4">
                  <DocumentStatusIndicatorCompact
                    documentStatus={shipment.documentStatus}
                    serviceType={shipment.serviceType}
                  />
                </td>
                <td className="px-4 py-4">
                  <NextTaskDisplayCompact shipmentId={shipment._id} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(shipment.currentStatus)} size="sm">
                    {shipment.currentStatus.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {shipment.sla?.deadline ? new Date(shipment.sla.deadline).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(shipment)
                    }}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedShipments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No shipments to display
        </div>
      )}
    </div>
  )
}
