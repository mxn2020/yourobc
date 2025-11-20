// src/features/yourobc/employees/components/EmployeeQuickFilterBadges.tsx

import { FC } from 'react'
import { Badge } from '@/components/ui'

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

interface EmployeeQuickFilterBadgesProps {
  stats: EmployeeStats | undefined
  statusFilter: string
  departmentFilter: string
  onStatusFilterChange: (status: string) => void
  onDepartmentFilterChange: (department: string) => void
}

export const EmployeeQuickFilterBadges: FC<EmployeeQuickFilterBadgesProps> = ({
  stats,
  statusFilter,
  departmentFilter,
  onStatusFilterChange,
  onDepartmentFilterChange,
}) => {
  if (!stats) return null

  const handleStatusClick = (status: string) => {
    onStatusFilterChange(statusFilter === status ? '' : status)
  }

  const handleDepartmentClick = (department: string) => {
    onDepartmentFilterChange(departmentFilter === department ? '' : department)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {/* Status Filters */}
      <Badge
        variant={statusFilter === 'available' ? 'success' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('available')}
      >
        ✅ Available ({stats.employeesByStatus.available})
      </Badge>

      <Badge
        variant={statusFilter === 'busy' ? 'info' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('busy')}
      >
        📋 Busy ({stats.employeesByStatus.busy})
      </Badge>

      <Badge
        variant={statusFilter === 'offline' ? 'warning' : 'secondary'}
        className="cursor-pointer"
        onClick={() => handleStatusClick('offline')}
      >
        ⏸️ Offline ({stats.employeesByStatus.offline})
      </Badge>

      {/* Department Filters */}
      {Object.entries(stats.employeesByDepartment)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([department, count]) => (
          <Badge
            key={department}
            variant={departmentFilter === department ? 'primary' : 'secondary'}
            className="cursor-pointer"
            onClick={() => handleDepartmentClick(department)}
          >
            {department} ({count})
          </Badge>
        ))}
    </div>
  )
}
