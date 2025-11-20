// src/features/yourobc/employees/pages/CreateVacationRequestPage.tsx

import { FC, useState, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { VacationRequestForm } from '../components/VacationRequestForm'
import { EmployeeSearch } from '../components/EmployeeSearch'
import { useEmployees, useEmployeeVacations } from '../hooks/useEmployees'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import {
  Card,
  Alert,
  AlertDescription,
  Loading,
  Badge,
  Button,
} from '@/components/ui'
import type { VacationRequestFormData, EmployeeListItem, EmployeeId } from '../types'

interface CreateVacationRequestPageProps {
  preselectedEmployeeId?: EmployeeId
}

export const CreateVacationRequestPage: FC<CreateVacationRequestPageProps> = ({
  preselectedEmployeeId,
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItem | null>(null)
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(!preselectedEmployeeId)

  const { employees } = useEmployees({
    filters: preselectedEmployeeId ? { search: preselectedEmployeeId } : undefined,
    limit: 1,
  })

  const {
    vacations,
    isLoading: isLoadingVacations,
    requestVacation,
    isRequesting,
  } = useEmployeeVacations(selectedEmployee?._id)

  // Load preselected employee if provided
  useEffect(() => {
    if (preselectedEmployeeId && employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0])
      setShowEmployeeSearch(false)
    }
  }, [preselectedEmployeeId, employees, selectedEmployee])

  const handleEmployeeSelect = (employee: EmployeeListItem) => {
    setSelectedEmployee(employee)
    setShowEmployeeSearch(false)
  }

  const handleChangeEmployee = () => {
    setSelectedEmployee(null)
    setShowEmployeeSearch(true)
  }

  const handleSubmit = async (formData: VacationRequestFormData) => {
    if (!selectedEmployee) {
      toast.error('Please select an employee first')
      return
    }

    try {
      await requestVacation(formData)
      toast.success('Vacation request submitted successfully!')
      
      // Navigate to the employee's vacation page
      navigate({
        to: '/yourobc/employees/$employeeId',
        params: { employeeId: selectedEmployee._id },
        hash: 'vacations',
      })
    } catch (error: any) {
      console.error('Vacation request error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to request vacation')
      } else if (code === 'OVERLAPPING_VACATION') {
        toast.error('This vacation request overlaps with an existing vacation')
      }
    }
  }

  const handleCancel = () => {
    if (selectedEmployee) {
      navigate({
        to: '/yourobc/employees/$employeeId',
        params: { employeeId: selectedEmployee._id },
      })
    } else {
      navigate({ to: '/yourobc/employees/vacations' })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString()
  }

  // Calculate employee vacation stats
  const vacationStats = vacations
    ? {
        available: vacations.available,
        used: vacations.used,
        pending: vacations.pending,
        remaining: vacations.remaining,
        upcomingVacations: vacations.entries
          .filter(entry => entry.status === 'approved' && entry.startDate > Date.now())
          .slice(0, 3),
      }
    : null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            to="/yourobc/employees/vacations"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Vacation Management
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Request Vacation</h1>
          <p className="text-gray-600 mt-2">
            Submit a new vacation request for an employee
          </p>
        </div>

        {/* Employee Selection */}
        {showEmployeeSearch ? (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Step 1: Select Employee
              </h3>
              <EmployeeSearch
                onSelect={handleEmployeeSelect}
                placeholder="Search for employee by name, ID, or department..."
                limit={10}
              />
              <p className="text-sm text-gray-500 mt-3">
                Type at least 2 characters to search for an employee
              </p>
            </div>
          </Card>
        ) : selectedEmployee ? (
          <Card>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Selected Employee</h3>
                    <Badge
                      variant={
                        selectedEmployee.workStatus === 'available'
                          ? 'success'
                          : selectedEmployee.workStatus === 'busy'
                          ? 'warning'
                          : 'secondary'
                      }
                      size="sm"
                    >
                      {selectedEmployee.status}
                    </Badge>
                    {selectedEmployee.isManager && (
                      <Badge variant="primary" size="sm">
                        👑 Manager
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xl font-medium text-gray-900">
                      {selectedEmployee.displayName || selectedEmployee.userProfile?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      ID: {selectedEmployee.employeeNumber} • {selectedEmployee.department} • {selectedEmployee.position}
                    </div>
                    <div className="text-sm text-gray-600">
                      📧 {selectedEmployee.userProfile?.email} • 📍 {selectedEmployee.formattedOffice}
                    </div>
                  </div>

                  {/* Employee Vacation Stats */}
                  {isLoadingVacations ? (
                    <div className="mt-4">
                      <Loading size="sm" />
                    </div>
                  ) : vacationStats ? (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Available</div>
                        <div className="text-lg font-bold text-gray-900">
                          {vacationStats.available}
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-gray-600">Used</div>
                        <div className="text-lg font-bold text-orange-600">
                          {vacationStats.used}
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="text-sm text-gray-600">Pending</div>
                        <div className="text-lg font-bold text-yellow-600">
                          {vacationStats.pending}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-gray-600">Remaining</div>
                        <div className="text-lg font-bold text-green-600">
                          {vacationStats.remaining}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Upcoming Vacations */}
                  {vacationStats && vacationStats.upcomingVacations && vacationStats.upcomingVacations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Upcoming Vacations</h4>
                      <div className="space-y-1">
                        {vacationStats.upcomingVacations.map((vacation, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            📅 {formatDate(vacation.startDate)} - {formatDate(vacation.endDate)} 
                            ({vacation.days} days, {vacation.type})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button variant="ghost" onClick={handleChangeEmployee} size="sm">
                  Change
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Vacation Request Form */}
        {selectedEmployee && (
          <>
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Step 2: Vacation Request Details
                </h3>

                <Alert variant="default" className="mb-6 bg-blue-50 border-blue-200">
                  <AlertDescription>
                    <div className="text-sm text-blue-800">
                      <strong>Note:</strong> Vacation requests require manager approval except for sick leave. 
                      Please ensure adequate notice is provided for proper coverage planning.
                    </div>
                  </AlertDescription>
                </Alert>

                <VacationRequestForm
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  submitLabel="Submit Vacation Request"
                  isLoading={isRequesting}
                  remainingDays={vacationStats?.remaining || 0}
                  currentYear={new Date().getFullYear()}
                />
              </div>
            </Card>

            {/* Important Information */}
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Important:</strong>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li>Annual leave requests should be submitted at least 2 weeks in advance</li>
                      <li>Weekend days are automatically excluded from annual leave calculations</li>
                      <li>Emergency contact information is required for vacations of 5+ days</li>
                      <li>Sick leave may require medical documentation for extended periods</li>
                      <li>Vacation requests are subject to business needs and manager approval</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </>
        )}

        {/* Help Section */}
        <Card className="bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Vacation Request Guide
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Vacation Types:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Annual Leave:</strong> Regular vacation time that counts against annual allowance
                  </li>
                  <li>
                    <strong>Sick Leave:</strong> Medical leave for illness or injury
                  </li>
                  <li>
                    <strong>Personal Leave:</strong> Time off for personal or family matters
                  </li>
                  <li>
                    <strong>Maternity/Paternity:</strong> Leave for new parents
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Planning Tips:</h4>
                <ul className="space-y-1">
                  <li>• Check team calendar for conflicts before requesting</li>
                  <li>• Consider business peak periods and deadlines</li>
                  <li>• Arrange coverage for your responsibilities</li>
                  <li>• Submit requests early for better approval chances</li>
                  <li>• Keep emergency contact information updated</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Approval Process:</h4>
                <ul className="space-y-1">
                  <li>• Manager will review request within 48 hours</li>
                  <li>• Email notification sent upon approval/denial</li>
                  <li>• Calendar automatically updated for approved requests</li>
                  <li>• HR notified for extended leave periods</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Common Issues:</h4>
                <ul className="space-y-1">
                  <li>• Insufficient vacation balance remaining</li>
                  <li>• Overlapping with existing vacation requests</li>
                  <li>• Too short notice for coverage arrangement</li>
                  <li>• Peak business period conflicts</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}