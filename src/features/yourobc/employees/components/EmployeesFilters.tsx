// src/features/yourobc/employees/components/EmployeesFilters.tsx

import { FC } from 'react'
import { Card, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Button } from '@/components/ui'

interface EmployeesFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusChange: (value: string) => void
  departmentFilter: string
  onDepartmentChange: (value: string) => void
  onClearFilters: () => void
  showClearButton: boolean
}

export const EmployeesFilters: FC<EmployeesFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  departmentFilter,
  onDepartmentChange,
  onClearFilters,
  showClearButton,
}) => {
  return (
    <Card className="mb-6">
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employees by name, email, or employee number..."
          />

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>

          <Select value={departmentFilter} onValueChange={onDepartmentChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Customer Service">Customer Service</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
            </SelectContent>
          </Select>

          {showClearButton && (
            <Button variant="ghost" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
