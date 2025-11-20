// src/features/yourobc/couriers/components/CouriersTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import type { CourierListItem } from '../types'

interface CouriersTableProps {
  couriers: CourierListItem[]
  onRowClick: (courier: CourierListItem) => void
}

type SortField = 'name' | 'location' | 'totalShipments' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const CouriersTable: FC<CouriersTableProps> = ({ couriers, onRowClick }) => {
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedCouriers = useMemo(() => {
    return [...couriers].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
          bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
          break
        case 'location':
          aValue = (a.formattedLocation || a.currentLocation?.country || '').toLowerCase()
          bValue = (b.formattedLocation || b.currentLocation?.country || '').toLowerCase()
          break
        case 'totalShipments':
          aValue = 0 // totalShipments not available on CourierListItem
          bValue = 0
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
  }, [couriers, sortField, sortOrder])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'busy': return 'info'
      case 'offline': return 'warning'
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Courier #
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon field="name" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('location')}
              >
                Location <SortIcon field="location" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Languages
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Types
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalShipments')}
              >
                Total Shipments <SortIcon field="totalShipments" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCouriers.map((courier) => (
              <tr
                key={courier._id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(courier)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {courier.courierNumber}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {courier.firstName} {courier.lastName}
                  </div>
                  {courier.email && (
                    <div className="text-xs text-gray-500">{courier.email}</div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {courier.formattedLocation || courier.currentLocation?.country || '-'}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {courier.skills?.languages?.slice(0, 3).map((lang: string, idx: number) => (
                      <Badge key={idx} variant="secondary" size="sm">
                        {lang}
                      </Badge>
                    ))}
                    {(courier.skills?.languages?.length || 0) > 3 && (
                      <Badge variant="secondary" size="sm">
                        +{(courier.skills?.languages?.length || 0) - 3}
                      </Badge>
                    )}
                    {!courier.skills?.languages?.length && <span className="text-sm text-gray-400">-</span>}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {courier.skills?.availableServices?.map((type: string, idx: number) => (
                      <Badge key={idx} variant="primary" size="sm">
                        {type}
                      </Badge>
                    ))}
                    {!courier.skills?.availableServices?.length && <span className="text-sm text-gray-400">-</span>}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(courier.status)} size="sm">
                    {courier.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    -
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(courier)
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

      {sortedCouriers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No couriers to display
        </div>
      )}
    </div>
  )
}
