// src/features/yourobc/employees/components/EmployeeList.tsx

import { FC, useState, useMemo } from 'react'
import { EmployeeCard } from './EmployeeCard'
import { useEmployees } from '../hooks/useEmployees'
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
} from '@/components/ui'
import { EMPLOYEE_CONSTANTS, COMMON_DEPARTMENTS, COMMON_POSITIONS } from '../types'
import type { EmployeeSearchFilters, EmployeeListItem } from '../types'

interface EmployeeListProps {
  filters?: EmployeeSearchFilters
  showFilters?: boolean
  onEmployeeClick?: (employee: EmployeeListItem) => void
  limit?: number
  compact?: boolean
  viewMode?: 'grid' | 'table'
}

export const EmployeeList: FC<EmployeeListProps> = ({
  filters: initialFilters,
  showFilters = true,
  onEmployeeClick,
  limit = 20,
  compact = false,
  viewMode = 'grid',
}) => {
  const [filters, setFilters] = useState<EmployeeSearchFilters>(initialFilters || {})
  const [searchTerm, setSearchTerm] = useState('')

  const {
    employees,
    total,
    hasMore,
    isLoading,
    error,
    refetch,
    canCreateEmployees,
  } = useEmployees({
    limit,
    filters: {
      ...filters,
      search: searchTerm,
    },
  })

  const filteredEmployees = useMemo(() => {
    let filtered = employees

    if (searchTerm && searchTerm.length >= 2) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (employee) =>
          employee.displayName?.toLowerCase().includes(searchLower) ||
          employee.employeeNumber?.toLowerCase().includes(searchLower) ||
          employee.userProfile?.email?.toLowerCase().includes(searchLower) ||
          employee.workPhone?.toLowerCase().includes(searchLower) ||
          employee.department?.toLowerCase().includes(searchLower) ||
          employee.position?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [employees, searchTerm])

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilters((prev) => ({ ...prev, status: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        status: [status as 'active' | 'inactive' | 'terminated' | 'on_leave'],
      }))
    }
  }

  const handleDepartmentFilter = (department: string) => {
    if (!department) {
      setFilters((prev) => ({ ...prev, department: undefined }))
    } else {
      setFilters((prev) => ({
        ...prev,
        department: [department],
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  if (isLoading && employees.length === 0) {
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
          <div className="text-red-500 mb-2">Error loading employees</div>
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
      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search employees by name, ID, email, or department..."
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
                    <SelectItem value={EMPLOYEE_CONSTANTS.STATUS.AVAILABLE}>
                      Available
                    </SelectItem>
                    <SelectItem value={EMPLOYEE_CONSTANTS.STATUS.BUSY}>Busy</SelectItem>
                    <SelectItem value={EMPLOYEE_CONSTANTS.STATUS.OFFLINE}>
                      Offline
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.department?.[0] || ''}
                  onValueChange={handleDepartmentFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {COMMON_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.isActive !== undefined ? filters.isActive.toString() : ''}
                  onValueChange={(value) => {
                    if (value === '') {
                      setFilters((prev) => ({ ...prev, isActive: undefined }))
                    } else {
                      setFilters((prev) => ({ ...prev, isActive: value === 'true' }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Employees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Employees</SelectItem>
                    <SelectItem value="true">Active Only</SelectItem>
                    <SelectItem value="false">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.isOnline !== undefined ? filters.isOnline.toString() : ''}
                  onValueChange={(value) => {
                    if (value === '') {
                      setFilters((prev) => ({ ...prev, isOnline: undefined }))
                    } else {
                      setFilters((prev) => ({ ...prev, isOnline: value === 'true' }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Online Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="true">Online Only</SelectItem>
                    <SelectItem value="false">Offline Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    filters.status?.[0] === 'active'
                      ? 'success'
                      : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() => handleStatusFilter('active')}
                >
                  ✅ Active Employees
                </Badge>

                <Badge
                  variant={filters.isOnline ? 'primary' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, isOnline: !prev.isOnline }))
                  }
                >
                  🟢 Online Only
                </Badge>

                <Badge
                  variant={filters.isActive === true ? 'success' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, isActive: prev.isActive !== true ? true : undefined }))
                  }
                >
                  👤 Active Only
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
          </div>
        </Card>
      )}

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {filteredEmployees.length} of {total} employees
          {searchTerm && (
            <span className="ml-2 text-blue-600 font-medium">
              for "{searchTerm}"
            </span>
          )}
        </div>

        {/* Department Statistics */}
        {filteredEmployees.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Departments:</span>
            {Array.from(new Set(filteredEmployees.map(e => e.department).filter(Boolean)))
              .slice(0, 3)
              .map((dept) => (
                <Badge key={dept} variant="secondary" size="sm">
                  {dept}
                </Badge>
              ))}
          </div>
        )}
      </div>

      {/* Employees Display */}
      {filteredEmployees.length === 0 ? (
        <Card>
          <div className="text-center py-12 p-6">
            <div className="text-gray-500 text-lg mb-2">
              {searchTerm || Object.keys(filters).length > 0
                ? 'No employees found matching your criteria'
                : 'No employees yet'}
            </div>
            <p className="text-gray-400 mb-4">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : canCreateEmployees
                ? 'Create your first employee to get started!'
                : 'Employees will appear here once created.'}
            </p>
            {(searchTerm || Object.keys(filters).length > 0) && (
              <Button onClick={clearAllFilters} variant="primary" size="sm">
                Clear all filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div
          className={`grid gap-6 ${
            compact
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onClick={onEmployeeClick}
              compact={compact}
              showWorkStatus={true}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && filteredEmployees.length > 0 && (
        <div className="text-center">
          <Button onClick={() => refetch()} variant="primary">
            Load More Employees
          </Button>
        </div>
      )}

      {/* Quick Stats Summary */}
      {filteredEmployees.length > 0 && (
        <Card className="bg-gray-50">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Quick Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEmployees.filter(e => e.workStatus === 'available').length}
                </div>
                <div className="text-gray-600">Available</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEmployees.filter(e => e.isOnline).length}
                </div>
                <div className="text-gray-600">Online</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEmployees.filter(e => e.isManager).length}
                </div>
                <div className="text-gray-600">Managers</div>
              </div>

              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEmployees.filter(e => e.vacationStatus?.onVacation).length}
                </div>
                <div className="text-gray-600">On Vacation</div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}