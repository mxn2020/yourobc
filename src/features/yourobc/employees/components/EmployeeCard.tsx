// src/features/yourobc/employees/components/EmployeeCard.tsx

import { FC } from 'react'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import type { EmployeeCardProps } from '../types'

export const EmployeeCard: FC<EmployeeCardProps> = ({
  employee,
  onClick,
  showWorkStatus = true,
  compact = false,
  showActions = true,
}) => {
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp).toLocaleDateString()
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success'
      case 'busy': return 'warning'
      case 'offline': return 'secondary'
      default: return 'secondary'
    }
  }

  const getDepartmentColor = (department?: string) => {
    const colors: Record<string, string> = {
      'Operations': 'bg-blue-50 text-blue-700',
      'Sales': 'bg-green-50 text-green-700',
      'Customer Service': 'bg-purple-50 text-purple-700',
      'Finance': 'bg-yellow-50 text-yellow-700',
      'IT': 'bg-indigo-50 text-indigo-700',
      'HR': 'bg-pink-50 text-pink-700',
      'Management': 'bg-red-50 text-red-700',
      'Administration': 'bg-gray-50 text-gray-700',
    }
    return colors[department || ''] || 'bg-gray-50 text-gray-700'
  }

  return (
    <Card
      hover={!!onClick}
      onClick={onClick ? () => onClick(employee) : undefined}
      className="h-full"
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className={`font-semibold text-gray-900 truncate ${
                compact ? 'text-base' : 'text-lg'
              }`}>
                {employee.displayName || employee.userProfile?.name || 'Unknown'}
              </h3>

              {employee.isManager && (
                <Badge variant="primary" size="sm">
                  👑 Manager
                </Badge>
              )}

              {employee.vacationStatus?.onVacation && (
                <Badge variant="warning" size="sm">
                  🏖️ On Vacation
                </Badge>
              )}
            </div>

            <div className="text-sm text-gray-600 mb-1">
              ID: {employee.employeeNumber}
            </div>

            <div className="text-sm text-gray-600">
              📍 {employee.formattedOffice}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge variant={getStatusVariant(employee.status)} size="sm">
              {employee.status.toUpperCase()}
            </Badge>

            {employee.isOnline && (
              <Badge variant="success" size="sm">
                🟢 Online
              </Badge>
            )}

            {!employee.isActive && (
              <Badge variant="danger" size="sm">
                ⚠️ Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Department & Position */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {employee.department && (
              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getDepartmentColor(employee.department)}`}>
                {employee.department}
              </span>
            )}
            
            {employee.position && (
              <span className="text-sm text-gray-600">
                {employee.position}
              </span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-4">
          <div className="space-y-1">
            {employee.userProfile?.email && (
              <a
                href={`mailto:${employee.userProfile.email}`}
                className="text-sm text-blue-600 hover:text-blue-800 block"
                onClick={(e) => e.stopPropagation()}
              >
                📧 {employee.userProfile.email}
              </a>
            )}

            {employee.workPhone && (
              <a
                href={`tel:${employee.workPhone}`}
                className="text-sm text-blue-600 hover:text-blue-800 block"
                onClick={(e) => e.stopPropagation()}
              >
                📞 {employee.workPhone}
              </a>
            )}
          </div>
        </div>

        {/* Manager Info */}
        {employee.manager && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Reports to:</div>
            <div className="text-sm text-gray-700">
              {employee.manager.name} ({employee.manager.employeeNumber})
            </div>
          </div>
        )}

        {/* Direct Reports */}
        {employee.directReports && employee.directReports.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-1">Manages:</div>
            <div className="text-sm text-gray-700">
              {employee.directReports.length} employee{employee.directReports.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Work Status */}
        {showWorkStatus && employee.workingHours && (
          <div className="p-3 bg-gray-50 rounded-lg mb-4">
            <div className="text-xs font-medium text-gray-900 mb-2">
              {employee.workingHours?.isWorking ? '🟢 Currently Working' : '⭕ Not Working'}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <div className="font-medium">Today's Hours</div>
                <div>{formatHours(employee.workingHours?.todayHours || 0)}</div>
              </div>

              <div>
                <div className="font-medium">Last Activity</div>
                <div>
                  {employee.workingHours?.lastLogin
                    ? formatDate(employee.workingHours?.lastLogin)
                    : 'Never'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vacation Status */}
        {employee.vacationStatus && (
          <div className="mb-4">
            {employee.vacationStatus.onVacation && (
              <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                🏖️ Currently on vacation
              </div>
            )}

            {employee.vacationStatus.upcomingVacations.length > 0 && !employee.vacationStatus.onVacation && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                📅 Upcoming vacation: {formatDate(employee.vacationStatus.upcomingVacations[0].startDate)}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className="text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Joined: {formatDate(employee.createdAt)}</span>
            <span>Updated: {formatDate(employee.updatedAt)}</span>
          </div>
        </div>
      </CardContent>

      {/* Actions */}
      {showActions && (
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Link
                to="/yourobc/employees/$employeeId"
                params={{ employeeId: employee._id }}
                onClick={(e) => e.stopPropagation()}
              >
                <Button size="sm" variant="primary">
                  View Details
                </Button>
              </Link>

              {employee.isManager && (
                <Button size="sm" variant="secondary">
                  👥 Team
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
              <span>{employee.timezone}</span>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}