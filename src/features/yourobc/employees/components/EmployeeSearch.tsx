// src/features/yourobc/employees/components/EmployeeSearch.tsx

import { FC, useState } from 'react'
import { Input, Card, Badge, Loading } from '@/components/ui'
import { useEmployeeSearch } from '../hooks/useEmployees'
import type { EmployeeListItem } from '../types'

interface EmployeeSearchProps {
  onSelect?: (employee: EmployeeListItem) => void
  placeholder?: string
  limit?: number
}

export const EmployeeSearch: FC<EmployeeSearchProps> = ({
  onSelect,
  placeholder = 'Search employees...',
  limit = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { results, isLoading, hasResults } = useEmployeeSearch(searchTerm)

  const handleSelect = (employee: EmployeeListItem) => {
    onSelect?.(employee)
    setSearchTerm('')
    setShowResults(false)
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'success'
      case 'busy':
        return 'warning'
      case 'offline':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setShowResults(true)
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 200)}
        placeholder={placeholder}
      />

      {showResults && searchTerm.length >= 2 && (
        <Card className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loading size="sm" />
            </div>
          ) : hasResults ? (
            <div className="divide-y">
              {results.slice(0, limit).map((employee) => (
                <div
                  key={employee._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelect(employee)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {employee.displayName || employee.userProfile?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{employee.employeeNumber}</span>
                        {employee.department && (
                          <>
                            <span>•</span>
                            <span>{employee.department}</span>
                          </>
                        )}
                        {employee.position && (
                          <>
                            <span>•</span>
                            <span>{employee.position}</span>
                          </>
                        )}
                      </div>
                      {employee.formattedOffice && (
                        <div className="text-xs text-gray-400 mt-1">
                          📍 {employee.formattedOffice}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        variant={getStatusVariant(employee.status)}
                        size="sm"
                      >
                        {employee.status}
                      </Badge>
                      {employee.isManager && (
                        <Badge variant="primary" size="sm">
                          👑 Manager
                        </Badge>
                      )}
                      {employee.vacationStatus?.onVacation && (
                        <Badge variant="warning" size="sm">
                          🏖️ Vacation
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">No employees found</div>
          )}
        </Card>
      )}
    </div>
  )
}