// src/features/yourobc/employees/components/EmployeesPageHeader.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Button, Badge } from '@/components/ui'

interface EmployeeStats {
  totalEmployees: number
  activeEmployees: number
  onlineEmployees: number
  employeesByStatus: {
    available: number
    busy: number
    offline: number
  }
  employeesByDepartment: Record<string, number>
  employeesByOffice: Record<string, number>
  avgTasksPerEmployee: number
}

interface EmployeesPageHeaderProps {
  stats: EmployeeStats | undefined
  isStatsLoading: boolean
  viewMode: 'grid' | 'table'
  onViewModeChange: (mode: 'grid' | 'table') => void
  canCreate: boolean
}

export const EmployeesPageHeader: FC<EmployeesPageHeaderProps> = ({
  stats,
  isStatsLoading,
  viewMode,
  onViewModeChange,
  canCreate,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
        <p className="text-gray-600 mt-2">
          Manage your team members and workforce
        </p>
        {!isStatsLoading && stats && (
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span>{stats.totalEmployees} total</span>
            <span>•</span>
            <Badge variant="success" size="sm">{stats.employeesByStatus.available} available</Badge>
            <span>•</span>
            <Badge variant="info" size="sm">{stats.employeesByStatus.busy} busy</Badge>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🗂️ Cards
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Table
          </button>
        </div>

        {/* Create Button */}
        {canCreate && (
          <Link to="/yourobc/employees/new">
            <Button variant="primary">
              + New Employee
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
