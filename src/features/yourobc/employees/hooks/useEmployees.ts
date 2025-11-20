// src/features/yourobc/employees/hooks/useEmployees.ts

import { useCallback, useMemo, useState } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { employeesService } from '../services/EmployeesService'
import { parseConvexError, type ParsedError } from '@/utils/errorHandling'
import { EMPLOYEE_CONSTANTS } from '../types'
import type {
  CreateEmployeeData,
  UpdateEmployeeData,
  EmployeeFormData,
  VacationRequestFormData,
  EmployeeId,
  VacationDayId,
  EmployeeListItem,
  EmployeeInsights,
  EmployeePerformanceMetrics,
  EmployeeWithDetails,
} from '../types'
import { EmployeeListOptions } from '@/convex/lib/yourobc'

/**
 * Main hook for employee management
 */
export function useEmployees(options?: EmployeeListOptions & { autoRefresh?: boolean }) {
  const authUser = useAuthenticatedUser()

  const {
    data: employeesQuery,
    isPending,
    error,
    refetch,
  } = employeesService.useEmployees(authUser?.id!, options)

  const {
    data: stats,
    isPending: isStatsLoading,
  } = employeesService.useEmployeeStats(authUser?.id!)

  const createMutation = employeesService.useCreateEmployee()
  const updateMutation = employeesService.useUpdateEmployee()
  const deleteMutation = employeesService.useDeleteEmployee()

  // Parse error for better user experience
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null
  }, [error])

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED'

  const createEmployee = useCallback(async (employeeData: EmployeeFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = employeesService.validateEmployeeData(employeeData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const createData: CreateEmployeeData = {
      userProfileId: employeeData.userProfileId,
      authUserId: employeeData.authUserId,
      employeeNumber: employeeData.employeeNumber,
      department: employeeData.department,
      position: employeeData.position,
      managerId: employeeData.managerId,
      office: employeeData.office,
      hireDate: employeeData.hireDate,
      workPhone: employeeData.workPhone?.trim(),
      workEmail: employeeData.workEmail?.trim(),
      emergencyContact: employeeData.emergencyContact,
      timezone: employeeData.timezone || EMPLOYEE_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
    }

    return await employeesService.createEmployee(createMutation, authUser.id, createData)
  }, [authUser, createMutation])

  const updateEmployee = useCallback(async (
    employeeId: EmployeeId,
    updates: Partial<EmployeeFormData>
  ) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = employeesService.validateEmployeeData(updates)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const updateData: UpdateEmployeeData = {}
    if (updates.employeeNumber !== undefined) updateData.employeeNumber = updates.employeeNumber
    if (updates.department !== undefined) updateData.department = updates.department
    if (updates.position !== undefined) updateData.position = updates.position
    if (updates.managerId !== undefined) updateData.managerId = updates.managerId
    if (updates.office !== undefined) updateData.office = updates.office
    if (updates.hireDate !== undefined) updateData.hireDate = updates.hireDate
    if (updates.workPhone !== undefined) updateData.workPhone = updates.workPhone?.trim()
    if (updates.workEmail !== undefined) updateData.workEmail = updates.workEmail?.trim()
    if (updates.emergencyContact !== undefined) updateData.emergencyContact = updates.emergencyContact
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive
    if (updates.isOnline !== undefined) updateData.isOnline = updates.isOnline
    if (updates.timezone !== undefined) updateData.timezone = updates.timezone

    return await employeesService.updateEmployee(updateMutation, authUser.id, employeeId, updateData)
  }, [authUser, updateMutation])

  const deleteEmployee = useCallback(async (employeeId: EmployeeId) => {
    if (!authUser) throw new Error('Authentication required')
    return await employeesService.deleteEmployee(deleteMutation, authUser.id, employeeId)
  }, [authUser, deleteMutation])

  const canCreateEmployees = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canEditEmployees = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canDeleteEmployees = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const enrichedEmployees = useMemo(() => {
    const employees = employeesQuery?.employees || []
    return employees
      .filter((employee) => employee.userProfile !== null)
      .map((employee): EmployeeListItem => {
        const empWithDetails = employee as unknown as EmployeeWithDetails
        return {
          ...empWithDetails,
          userProfile: employee.userProfile!,
          displayName: employeesService.formatEmployeeName(employee),
          formattedOffice: employeesService.formatEmployeeOffice(employee.office),
          formattedDepartment: employeesService.formatEmployeeDepartment(
            employee.department,
            employee.position
          ),
          hasRecentActivity: empWithDetails.workingHours?.lastLogin
            ? (Date.now() - empWithDetails.workingHours.lastLogin) < (24 * 60 * 60 * 1000)
            : false,
          isManager: false,
        }
      })
  }, [employeesQuery])

  return {
    employees: enrichedEmployees,
    total: employeesQuery?.total || 0,
    hasMore: employeesQuery?.hasMore || false,
    stats,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    refetch,
    canCreateEmployees,
    canEditEmployees,
    canDeleteEmployees,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

/**
 * Hook for managing a single employee
 */
export function useEmployee(employeeId?: EmployeeId) {

  if (!employeeId) {
    return {
      employee: null,
      employeeInsights: null,
      employeeMetrics: null,
      isLoading: false,
      error: null,
      refetch: async () => {},
    }
  }

  const authUser = useAuthenticatedUser()

  const {
    data: employee,
    isPending,
    error,
    refetch,
  } = employeesService.useEmployee(authUser?.id!, employeeId)

  const employeeInsights = useMemo((): EmployeeInsights | null => {
    if (!employee) return null

    const empWithDetails = employee as unknown as EmployeeWithDetails
    const daysSinceCreated = Math.floor(
      (Date.now() - (employee.createdAt || Date.now())) / (24 * 60 * 60 * 1000)
    )

    const daysSinceLastActivity = empWithDetails.workingHours?.lastLogin
      ? Math.floor((Date.now() - empWithDetails.workingHours.lastLogin) / (24 * 60 * 60 * 1000))
      : null

    const upcomingVacations = empWithDetails.vacationStatus?.upcomingVacations || []

    return {
      employeeAge: daysSinceCreated,
      daysSinceLastActivity,
      needsAttention: daysSinceLastActivity !== null && daysSinceLastActivity > 7,
      isNewEmployee: daysSinceCreated <= 30,
      isManager: (employee.directReports?.length || 0) > 0,
      hasUpcomingVacation: upcomingVacations.length > 0,
    }
  }, [employee])

  // Mock employee metrics (would come from actual task/project queries)
  const employeeMetrics = useMemo((): EmployeePerformanceMetrics | null => {
    if (!employee) return null

    const empWithDetails = employee as unknown as EmployeeWithDetails
    return {
      totalWorkingDays: 0,
      averageHoursPerDay: empWithDetails.workingHours?.todayHours || 0,
      punctualityScore: 85,
      vacationDaysUsed: 0,
      vacationDaysRemaining: EMPLOYEE_CONSTANTS.DEFAULT_VALUES.ANNUAL_VACATION_DAYS,
      reportsManaged: employee.directReports?.length || 0,
    }
  }, [employee])

  return {
    employee,
    employeeInsights,
    employeeMetrics,
    isLoading: isPending,
    error,
    refetch,
  }
}

/**
 * Hook for employee search
 */
export function useEmployeeSearch(searchTerm: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: searchResults,
    isPending,
    error,
  } = employeesService.useSearchEmployees(authUser?.id!, searchTerm)

  const enrichedResults = useMemo(() => {
    const results = searchResults || []
    return results
      .filter((employee) => employee.userProfile !== null)
      .map((employee): EmployeeListItem => {
        const empWithDetails = employee as unknown as EmployeeWithDetails
        return {
          ...empWithDetails,
          userProfile: employee.userProfile!,
          displayName: employeesService.formatEmployeeName(employee),
          formattedOffice: employeesService.formatEmployeeOffice(employee.office),
          formattedDepartment: employeesService.formatEmployeeDepartment(
            employee.department,
            employee.position
          ),
          hasRecentActivity: empWithDetails.workingHours?.lastLogin
            ? (Date.now() - empWithDetails.workingHours.lastLogin) < (24 * 60 * 60 * 1000)
            : false,
          isManager: (employee.directReports?.length || 0) > 0,
        }
      })
  }, [searchResults])

  return {
    results: enrichedResults,
    isLoading: isPending,
    error,
    hasResults: enrichedResults.length > 0,
  }
}

/**
 * Hook for employee form management
 */
export function useEmployeeForm(initialData?: Partial<EmployeeFormData>) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    userProfileId: '' as any,
    authUserId: '',
    office: {
      location: '',
      country: '',
      countryCode: '',
    },
    timezone: EMPLOYEE_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
    ...initialData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const validationErrors = employeesService.validateEmployeeData(formData)
    const errorMap: Record<string, string> = {}

    validationErrors.forEach((error) => {
      if (error.includes('Employee number')) errorMap.employeeNumber = error
      else if (error.includes('Department')) errorMap.department = error
      else if (error.includes('Position')) errorMap.position = error
      else if (error.includes('work phone')) errorMap.workPhone = error
      else if (error.includes('work email')) errorMap.workEmail = error
      else if (error.includes('Office location')) errorMap['office.location'] = error
      else if (error.includes('Office country')) errorMap['office.country'] = error
      else if (error.includes('Emergency contact')) errorMap['emergencyContact'] = error
      else errorMap.general = error
    })

    setErrors(errorMap)
    return Object.keys(errorMap).length === 0
  }, [formData])

  const resetForm = useCallback(() => {
    const defaultFormData: EmployeeFormData = {
      userProfileId: '' as any,
      authUserId: '',
      office: { location: '', country: '', countryCode: '' },
      timezone: EMPLOYEE_CONSTANTS.DEFAULT_VALUES.TIMEZONE,
    }
    setFormData(initialData ? { ...defaultFormData, ...initialData } : defaultFormData)
    setErrors({})
    setIsDirty(false)
  }, [initialData])

  return {
    formData,
    errors,
    isDirty,
    updateField,
    validateForm,
    resetForm,
    setFormData,
  }
}

/**
 * Hook for vacation management
 */
export function useEmployeeVacations(
  employeeId?: EmployeeId,
  year?: number
) {
  const authUser = useAuthenticatedUser()

  const {
    data: vacationsData,
    isPending,
    error,
    refetch,
  } = employeesService.useEmployeeVacations(authUser?.id!, employeeId, year)

  const requestMutation = employeesService.useRequestVacation()
  const approveMutation = employeesService.useApproveVacation()

  const requestVacation = useCallback(async (vacationData: VacationRequestFormData) => {
    if (!authUser) throw new Error('Authentication required')

    const errors = employeesService.validateVacationData(vacationData)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    return await employeesService.requestVacation(
      requestMutation,
      authUser.id,
      employeeId,
      vacationData
    )
  }, [authUser, requestMutation, employeeId])

  const approveVacation = useCallback(async (
    vacationDayId: VacationDayId,
    entryIndex: number,
    approved: boolean,
    reason?: string
  ) => {
    if (!authUser) throw new Error('Authentication required')

    return await employeesService.approveVacation(
      approveMutation,
      authUser.id,
      vacationDayId,
      entryIndex,
      approved,
      reason
    )
  }, [authUser, approveMutation])

  return {
    vacations: vacationsData,
    isLoading: isPending,
    error,
    refetch,
    requestVacation,
    approveVacation,
    isRequesting: requestMutation.isPending,
    isApproving: approveMutation.isPending,
  }
}

/**
 * Hook for vacation requests management (for managers/HR)
 */
export function useVacationRequests(filters?: {
  employeeId?: EmployeeId
  year?: number
  status?: string[]
  limit?: number
  offset?: number
}) {
  const authUser = useAuthenticatedUser()

  const {
    data: requestsData,
    isPending,
    error,
    refetch,
  } = employeesService.useVacationRequests(authUser?.id!, filters)

  return {
    requests: requestsData?.vacationRequests || [],
    total: requestsData?.total || 0,
    hasMore: requestsData?.hasMore || false,
    isLoading: isPending,
    error,
    refetch,
  }
}