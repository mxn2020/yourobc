// src/features/yourobc/customers/components/CustomersTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import { CURRENCY_SYMBOLS } from '../types'
import type { CustomerListItem } from '../types'

interface CustomersTableProps {
  customers: CustomerListItem[]
  onRowClick: (customer: CustomerListItem) => void
}

type SortField = 'companyName' | 'totalRevenue' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const CustomersTable: FC<CustomersTableProps> = ({ customers, onRowClick }) => {
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

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'companyName':
          aValue = a.companyName.toLowerCase()
          bValue = b.companyName.toLowerCase()
          break
        case 'totalRevenue':
          aValue = a.totalValue || 0
          bValue = b.totalValue || 0
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
  }, [customers, sortField, sortOrder])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'blacklisted': return 'danger'
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
                onClick={() => handleSort('companyName')}
              >
                Company Name <SortIcon field="companyName" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Short Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Terms
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalRevenue')}
              >
                Total Revenue <SortIcon field="totalRevenue" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCustomers.map((customer) => (
              <tr
                key={customer._id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(customer)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.companyName}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {customer.shortName || '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {customer.primaryContact.name}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {customer.primaryContact.email || '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(customer.status)} size="sm">
                    {customer.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    Net {customer.paymentTerms} days
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    {CURRENCY_SYMBOLS[customer.defaultCurrency]}{customer.totalValue?.toLocaleString() || 0}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(customer)
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

      {sortedCustomers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No customers to display
        </div>
      )}
    </div>
  )
}
