// src/features/yourobc/partners/components/PartnersTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import type { PartnerListItem } from '../types'

interface PartnersTableProps {
  partners: PartnerListItem[]
  onRowClick: (partner: PartnerListItem) => void
}

type SortField = 'companyName' | 'selectionRate' | 'totalQuotes' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const PartnersTable: FC<PartnersTableProps> = ({ partners, onRowClick }) => {
  const [sortField, setSortField] = useState<SortField>('companyName')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedPartners = useMemo(() => {
    return [...partners].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'companyName':
          aValue = a.companyName.toLowerCase()
          bValue = b.companyName.toLowerCase()
          break
        case 'selectionRate':
          aValue = (a as any).selectionRate || 0
          bValue = (b as any).selectionRate || 0
          break
        case 'totalQuotes':
          aValue = (a as any).totalQuotes || 0
          bValue = (b as any).totalQuotes || 0
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
  }, [partners, sortField, sortOrder])

  const getStatusVariant = (status: string) => {
    return status === 'active' ? 'success' : 'warning'
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
                Partner Code
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('companyName')}
              >
                Company Name <SortIcon field="companyName" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coverage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('selectionRate')}
              >
                Selection Rate <SortIcon field="selectionRate" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalQuotes')}
              >
                Total Quotes <SortIcon field="totalQuotes" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPartners.map((partner) => (
              <tr
                key={partner._id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(partner)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {partner.partnerCode}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {partner.companyName}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant="primary" size="sm">
                    {partner.serviceType}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {partner.coverageStats?.countries || 0} countries
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(partner.status)} size="sm">
                    {partner.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {(partner as any).selectionRate ? `${(partner as any).selectionRate}%` : '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {(partner as any).totalQuotes || 0}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(partner)
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

      {sortedPartners.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No partners to display
        </div>
      )}
    </div>
  )
}
