// src/features/yourobc/employees/components/EmployeesTable.tsx

import { FC, useState, useMemo } from 'react'
import { Badge } from '@/components/ui'
import type { EmployeeListItem } from '../types'

interface EmployeesTableProps {
  employees: EmployeeListItem[]
  onRowClick: (employee: EmployeeListItem) => void
}

type SortField = 'name' | 'department' | 'position' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export const EmployeesTable: FC<EmployeesTableProps> = ({ employees, onRowClick }) => {
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

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'name':
          aValue = (a.displayName || a.userProfile?.name || '').toLowerCase()
          bValue = (b.displayName || b.userProfile?.name || '').toLowerCase()
          break
        case 'department':
          aValue = (a.department || a.formattedDepartment || '').toLowerCase()
          bValue = (b.department || b.formattedDepartment || '').toLowerCase()
          break
        case 'position':
          aValue = (a.position || '').toLowerCase()
          bValue = (b.position || '').toLowerCase()
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
  }, [employees, sortField, sortOrder])

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
                Employee #
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Name <SortIcon field="name" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                Department <SortIcon field="department" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('position')}
              >
                Position <SortIcon field="position" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Office Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Manager
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEmployees.map((employee) => (
              <tr
                key={employee._id}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onRowClick(employee)}
              >
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {employee.employeeNumber}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {employee.displayName || employee.userProfile?.name || '-'}
                  </div>
                  {employee.userProfile?.email && (
                    <div className="text-xs text-gray-500">{employee.userProfile.email}</div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant="primary" size="sm">
                    {employee.formattedDepartment || employee.department || '-'}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {employee.position || '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {employee.formattedOffice || employee.office?.location || '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Badge variant={getStatusVariant(employee.status)} size="sm">
                    {employee.status}
                  </Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {employee.managerId ? 'Yes' : '-'}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRowClick(employee)
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

      {sortedEmployees.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No employees to display
        </div>
      )}
    </div>
  )
}
