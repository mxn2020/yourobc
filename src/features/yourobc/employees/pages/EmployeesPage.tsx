// src/features/yourobc/employees/pages/EmployeesPage.tsx

import { FC, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { EmployeeCard } from '../components/EmployeeCard'
import { EmployeeStats } from '../components/EmployeeStats'
import { EmployeesPageHeader } from '../components/EmployeesPageHeader'
import { EmployeesFilters } from '../components/EmployeesFilters'
import { EmployeesTable } from '../components/EmployeesTable'
import { EmployeeQuickFilterBadges } from '../components/EmployeeQuickFilterBadges'
import { EmployeesHelpSection } from '../components/EmployeesHelpSection'
import { useEmployees } from '../hooks/useEmployees'
import { Button, Card, Loading, PermissionDenied, ErrorState } from '@/components/ui'
import type { EmployeeListItem } from '../types'
import { WikiSidebar } from '@/features/yourobc/supporting/wiki/components/WikiSidebar'

export const EmployeesPage: FC = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [departmentFilter, setDepartmentFilter] = useState<string>('')

  const {
    employees,
    stats,
    isLoading,
    isStatsLoading,
    error,
    isPermissionError,
    refetch,
    canCreateEmployees,
  } = useEmployees({
    limit: 50,
  })

  const handleEmployeeClick = (employee: EmployeeListItem) => {
    navigate({
      to: '/yourobc/employees/$employeeId',
      params: { employeeId: employee._id },
    })
  }

  const filteredEmployees = employees.filter((employee) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        employee.displayName?.toLowerCase().includes(searchLower) ||
        employee.employeeNumber?.toLowerCase().includes(searchLower) ||
        employee.userProfile?.email?.toLowerCase().includes(searchLower) ||
        employee.workPhone?.toLowerCase().includes(searchLower) ||
        employee.department?.toLowerCase().includes(searchLower) ||
        employee.position?.toLowerCase().includes(searchLower)

      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && employee.status !== statusFilter) return false

    // Department filter  
    if (departmentFilter && employee.department !== departmentFilter) return false

    return true
  })

  if (isLoading && employees.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" />
      </div>
    )
  }

  // Handle permission errors
  if (isPermissionError && error) {
    return (
      <PermissionDenied
        permission={error.permission}
        module="Employees"
        message={error.message}
        showDetails={true}
      />
    )
  }

  // Handle other errors
  if (error) {
    return <ErrorState error={error} onRetry={refetch} showDetails={true} />
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setDepartmentFilter('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <EmployeesPageHeader
          stats={stats}
          isStatsLoading={isStatsLoading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          canCreate={canCreateEmployees}
        />

        {/* Stats Overview */}
        {!isStatsLoading ? (
          <EmployeeStats />
        ) : (
          <div className="flex justify-center py-8 mb-8">
            <Loading size="lg" />
          </div>
        )}

        {/* Filters */}
        <EmployeesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          departmentFilter={departmentFilter}
          onDepartmentChange={setDepartmentFilter}
          onClearFilters={handleClearFilters}
          showClearButton={Boolean(searchTerm || statusFilter || departmentFilter)}
        />

        {/* Quick Filter Badges */}
        <EmployeeQuickFilterBadges
          stats={stats}
          statusFilter={statusFilter}
          departmentFilter={departmentFilter}
          onStatusFilterChange={setStatusFilter}
          onDepartmentFilterChange={setDepartmentFilter}
        />

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-600">
            Showing {filteredEmployees.length} of {employees.length} employees
            {searchTerm && (
              <span className="ml-2 text-blue-600 font-medium">
                for "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* Employees Display - Grid or Table */}
        {filteredEmployees.length === 0 ? (
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-gray-500 text-lg mb-2">
                {searchTerm || statusFilter || departmentFilter
                  ? 'No employees found matching your criteria'
                  : 'No employees yet'}
              </div>
              <p className="text-gray-400 mb-4">
                {searchTerm || statusFilter || departmentFilter
                  ? 'Try adjusting your search or filters'
                  : canCreateEmployees
                  ? 'Create your first employee record to get started!'
                  : 'Employee records will appear here once created.'}
              </p>
            </div>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee._id}
                employee={employee}
                onClick={handleEmployeeClick}
                showWorkStatus={true}
                compact={false}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <EmployeesTable
            employees={filteredEmployees}
            onRowClick={handleEmployeeClick}
          />
        )}

        {/* Quick Actions (Fixed Position) */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          {canCreateEmployees && (
            <Link to="/yourobc/employees/new">
              <button
                className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
                title="Add New Employee"
              >
                ➕
              </button>
            </Link>
          )}

          <Link to="/yourobc/employees/vacations">
            <button
              className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center text-xl hover:scale-110 transition-all"
              title="Vacation Requests"
            >
              🏖️
            </button>
          </Link>
        </div>

        {/* Help Section */}
        <EmployeesHelpSection />

        {/* Wiki Sidebar */}
        <WikiSidebar category="Employees" title="Employee Wiki Helper" />
      </div>
    </div>
  )
}