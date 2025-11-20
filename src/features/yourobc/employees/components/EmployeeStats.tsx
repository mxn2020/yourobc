// src/features/yourobc/employees/components/EmployeeStats.tsx

import { FC } from 'react'
import { Card, Badge, Loading } from '@/components/ui'
import { useEmployees } from '../hooks/useEmployees'

export const EmployeeStats: FC = () => {
  const { stats, isStatsLoading } = useEmployees()

  if (isStatsLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="md" />
      </div>
    )
  }

  if (!stats) {
    return null
  }

  // Calculate additional metrics
  const totalDepartments = Object.keys(stats.employeesByDepartment).length
  const totalOffices = Object.keys(stats.employeesByOffice).length
  const onlinePercentage = stats.totalEmployees > 0
    ? Math.round((stats.onlineEmployees / stats.totalEmployees) * 100)
    : 0
  const availabilityRate = stats.totalEmployees > 0
    ? Math.round((stats.employeesByStatus.available / stats.totalEmployees) * 100)
    : 0

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: 4 Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              <div className="text-3xl">👥</div>
            </div>
            <div className="mt-2">
              <Badge variant="primary" size="sm">
                {stats.activeEmployees} active
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.employeesByStatus.available}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-3xl">✅</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {stats.employeesByStatus.busy} busy, {stats.employeesByStatus.offline} offline
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.onlineEmployees}</div>
                <div className="text-sm text-gray-600">Online Now</div>
              </div>
              <div className="text-3xl">🟢</div>
            </div>
            <div className="mt-2">
              <Badge variant="success" size="sm">
                {onlinePercentage}% online
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalDepartments}</div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
              <div className="text-3xl">🏢</div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {totalOffices} office{totalOffices !== 1 ? 's' : ''}
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: 3 List Metrics + Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* List Metric 1: By Department */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Department</h3>
            <div className="space-y-2">
              {Object.entries(stats.employeesByDepartment)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([department, count]) => (
                  <div key={department} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{department}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* List Metric 2: By Office */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Office</h3>
            <div className="space-y-2">
              {Object.entries(stats.employeesByOffice)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([office, count]) => (
                  <div key={office} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{office}</span>
                    <Badge variant="secondary" size="sm">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* List Metric 3: By Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">By Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Available</span>
                <Badge variant="success" size="sm">
                  {stats.employeesByStatus.available}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Busy</span>
                <Badge variant="info" size="sm">
                  {stats.employeesByStatus.busy}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Offline</span>
                <Badge variant="warning" size="sm">
                  {stats.employeesByStatus.offline}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Workforce Summary</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-blue-700 mb-1">Availability Rate</div>
                <div className="text-lg font-bold text-blue-900">
                  {availabilityRate}%
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Avg Tasks per Employee</div>
                <div className="text-lg font-bold text-blue-900">
                  {stats.avgTasksPerEmployee.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs text-blue-700 mb-1">Total Capacity</div>
                <div className="text-sm font-semibold text-blue-900">
                  {stats.totalEmployees} members
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}