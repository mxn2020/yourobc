// src/features/yourobc/employees/pages/CreateEmployeePage.tsx

import { FC } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { EmployeeForm } from '../components/EmployeeForm'
import { useEmployees, useEmployee } from '../hooks/useEmployees'
import { useAvailableUserProfiles } from '../hooks/useUserProfiles'
import { useAuth } from '@/features/system/auth'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Card, Alert, AlertDescription, Loading } from '@/components/ui'
import type { EmployeeFormData, EmployeeId } from '../types'

interface CreateEmployeePageProps {
  employeeId?: EmployeeId
  mode?: 'create' | 'edit'
}

export const CreateEmployeePage: FC<CreateEmployeePageProps> = ({
  employeeId,
  mode = 'create',
}) => {
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const { employee, isLoading: isLoadingEmployee } = useEmployee(employeeId)
  const { createEmployee, updateEmployee, isCreating, isUpdating } = useEmployees()
  const { userProfiles, isLoading: isLoadingProfiles, error: profilesError } = useAvailableUserProfiles()

  const handleSubmit = async (formData: EmployeeFormData) => {
    try {
      if (mode === 'edit' && employeeId) {
        await updateEmployee(employeeId, formData)
        toast.success(`${formData.userProfileId} updated successfully!`)
        navigate({ to: '/yourobc/employees/$employeeId', params: { employeeId } })
      } else {
        const newEmployeeId = await createEmployee(formData)
        toast.success(`Employee created successfully!`)
        navigate({ to: '/yourobc/employees/$employeeId', params: { employeeId: newEmployeeId } })
      }
    } catch (error: any) {
      console.error('Employee operation error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'VALIDATION_FAILED') {
        console.warn('Form validation failed on server side')
      } else if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to create/update employees')
      } else if (code === 'DUPLICATE_EMPLOYEE') {
        toast.error('An employee record already exists for this user')
      }
    }
  }

  const handleCancel = () => {
    if (mode === 'edit' && employeeId) {
      navigate({ to: '/yourobc/employees/$employeeId', params: { employeeId } })
    } else {
      navigate({ to: '/yourobc/employees' })
    }
  }

  // Show loading state while fetching data
  if (isLoadingProfiles || (mode === 'edit' && isLoadingEmployee)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center py-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    )
  }

  // Show error if profiles failed to load
  if (profilesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">Error Loading User Profiles</div>
              <p className="text-gray-500 mb-4">
                {profilesError.message || 'Unable to load available user profiles. Please try again.'}
              </p>
              <Link
                to="/yourobc/employees"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Employees
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Show error if employee not found in edit mode
  if (mode === 'edit' && !employee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <div className="text-center py-12 p-6">
              <div className="text-red-500 text-lg mb-4">Employee Not Found</div>
              <p className="text-gray-500 mb-4">
                The employee you are trying to edit does not exist or has been deleted.
              </p>
              <Link
                to="/yourobc/employees"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Employees
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const pageTitle = mode === 'edit'
    ? `Edit ${employee?.userProfile?.name || 'Employee'}`
    : 'Add New Employee'
  const breadcrumbText = mode === 'edit'
    ? `${employee?.userProfile?.name || 'Employee'} Details`
    : 'Employees'
  const breadcrumbPath = mode === 'edit'
    ? `/yourobc/employees/${employeeId}`
    : '/yourobc/employees'

  // Prepare initial data for the form
  const initialData = mode === 'edit' && employee ? {
    userProfileId: employee.userProfileId,
    authUserId: employee.authUserId,
    employeeNumber: employee.employeeNumber,
    department: employee.department,
    position: employee.position,
    managerId: employee.managerId,
    office: employee.office,
    hireDate: employee.hireDate,
    workPhone: employee.workPhone,
    workEmail: employee.workEmail,
    emergencyContact: employee.emergencyContact,
    status: employee.status,
    isActive: employee.isActive,
    isOnline: employee.isOnline,
    timezone: employee.timezone,
  } : undefined

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            to={breadcrumbPath}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to {breadcrumbText}
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600 mt-2">
            {mode === 'edit'
              ? 'Update employee information and details'
              : 'Add a new employee to your organization'}
          </p>
        </div>

        <Card>
          <div className="p-6">
            <EmployeeForm
              initialData={initialData}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel={mode === 'edit' ? 'Update Employee' : 'Create Employee'}
              isLoading={isCreating || isUpdating}
              showAllFields={true}
              userProfiles={userProfiles}
            />
          </div>
        </Card>

        {/* Help Section */}
        <Card className="mt-8 bg-gray-50">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              💡 Employee Setup Best Practices
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Required Information:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>User Profile:</strong> Link to existing user account
                  </li>
                  <li>
                    <strong>Office Location:</strong> Primary workplace location
                  </li>
                  <li>
                    <strong>Department & Position:</strong> Organizational structure
                  </li>
                  <li>
                    <strong>Manager:</strong> Reporting relationship setup
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Optional But Recommended:</h4>
                <ul className="space-y-1">
                  <li>
                    <strong>Hire Date:</strong> For tenure tracking and reporting
                  </li>
                  <li>
                    <strong>Work Contact:</strong> Direct phone and email
                  </li>
                  <li>
                    <strong>Emergency Contact:</strong> For workplace safety
                  </li>
                  <li>
                    <strong>Timezone:</strong> For scheduling and coordination
                  </li>
                </ul>
              </div>
            </div>

            <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 text-lg">ℹ️</div>
                  <div className="text-sm text-blue-800">
                    <strong>User Account Linking:</strong> Each employee record must be linked to a user account. 
                    This enables single sign-on, permissions management, and personal dashboards. Make sure the 
                    user account exists before creating the employee record.
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <Alert variant="warning" className="mt-4">
              <AlertDescription>
                <div className="flex items-start gap-2">
                  <div className="text-yellow-600 text-lg">⚠️</div>
                  <div className="text-sm text-yellow-800">
                    <strong>Hierarchy Management:</strong> When setting up managers, ensure you don't create 
                    circular reporting relationships. An employee cannot manage themselves or their own manager.
                    The system will prevent these configurations but it's best to plan the hierarchy carefully.
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    </div>
  )
}