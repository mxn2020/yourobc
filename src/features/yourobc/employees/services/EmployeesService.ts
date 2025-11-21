// src/features/yourobc/employees/services/EmployeesService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import type {
  CreateEmployeeData,
  UpdateEmployeeData,
  VacationRequestFormData,
} from '../types'
import { EmployeeListOptions } from '@/convex/lib/yourobc'

export class EmployeesService {
  // Query hooks for employee data fetching
  useEmployees(authUserId: string, options?: EmployeeListOptions) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getEmployees, {
        authUserId,
        options,
      }),
      staleTime: 300000, // 5 minutes
      enabled: !!authUserId,
    })
  }

  useEmployee(authUserId: string, employeeId?: Id<'yourobcEmployees'>) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getEmployee, {
        employeeId,
        authUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId && !!employeeId,
    })
  }

  useEmployeeByAuthId(authUserId: string, targetAuthUserId?: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getEmployeeByAuthId, {
        authUserId,
        targetAuthUserId,
      }),
      staleTime: 300000,
      enabled: !!authUserId,
    })
  }

  useEmployeeStats(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getEmployeeStats, {
        authUserId,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useEmployeeTimeEntries(
    authUserId: string,
    employeeId?: Id<'yourobcEmployees'>,
    dateRange?: { start: number; end: number }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getEmployeeTimeEntries, {
        authUserId,
        employeeId,
        dateRange,
      }),
      staleTime: 30000,
      enabled: !!authUserId,
    })
  }

  useSearchEmployees(
    authUserId: string,
    searchTerm: string,
    limit = 20,
    includeInactive = false
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.searchEmployees, {
        authUserId,
        searchTerm,
        limit,
        includeInactive,
      }),
      staleTime: 30000,
      enabled: !!authUserId && searchTerm.length >= 2,
    })
  }

  // Vacation query hooks
  useEmployeeVacations(
    authUserId: string,
    employeeId?: Id<'yourobcEmployees'>,
    year?: number
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getEmployeeVacations, {
        authUserId,
        employeeId,
        year,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useVacationRequests(
    authUserId: string,
    filters?: {
      employeeId?: Id<'yourobcEmployees'>
      year?: number
      status?: string[]
      limit?: number
      offset?: number
    }
  ) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getVacationRequests, {
        authUserId,
        filters,
      }),
      staleTime: 60000,
      enabled: !!authUserId,
    })
  }

  useAvailableUserProfiles(authUserId: string) {
    return useQuery({
      ...convexQuery(api.lib.yourobc.employees.queries.getAvailableUserProfiles, {
        authUserId,
      }),
      staleTime: 300000, // 5 minutes - user profiles don't change frequently
      enabled: !!authUserId,
    })
  }

  // Mutation hooks for employee modifications
  useCreateEmployee() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.employees.mutations.createEmployee),
    })
  }

  useUpdateEmployee() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.employees.mutations.updateEmployee),
    })
  }

  useRecordTimeEntry() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.employees.mutations.recordEmployeeTimeEntry),
    })
  }

  useDeleteEmployee() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.employees.mutations.deleteEmployee),
    })
  }

  // Vacation mutation hooks
  useRequestVacation() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.employees.mutations.requestVacation),
    })
  }

  useApproveVacation() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.yourobc.employees.mutations.approveVacation),
    })
  }

  // Business operations using mutations
  async createEmployee(
    mutation: ReturnType<typeof this.useCreateEmployee>,
    authUserId: string,
    data: CreateEmployeeData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, data })
    } catch (error: any) {
      throw new Error(`Failed to create employee: ${error.message}`)
    }
  }

  async updateEmployee(
    mutation: ReturnType<typeof this.useUpdateEmployee>,
    authUserId: string,
    employeeId: Id<'yourobcEmployees'>,
    data: UpdateEmployeeData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, employeeId, data })
    } catch (error: any) {
      throw new Error(`Failed to update employee: ${error.message}`)
    }
  }

  async deleteEmployee(
    mutation: ReturnType<typeof this.useDeleteEmployee>,
    authUserId: string,
    employeeId: Id<'yourobcEmployees'>
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, employeeId })
    } catch (error: any) {
      throw new Error(`Failed to delete employee: ${error.message}`)
    }
  }

  async requestVacation(
    mutation: ReturnType<typeof this.useRequestVacation>,
    authUserId: string,
    employeeId: Id<'yourobcEmployees'> | undefined,
    data: VacationRequestFormData
  ) {
    try {
      return await mutation.mutateAsync({ authUserId, employeeId, data })
    } catch (error: any) {
      throw new Error(`Failed to request vacation: ${error.message}`)
    }
  }

  async approveVacation(
    mutation: ReturnType<typeof this.useApproveVacation>,
    authUserId: string,
    vacationDayId: Id<'yourobcVacationDays'>,
    entryIndex: number,
    approved: boolean,
    reason?: string
  ) {
    try {
      return await mutation.mutateAsync({
        authUserId,
        vacationDayId,
        entryIndex,
        approved,
        reason,
      })
    } catch (error: any) {
      throw new Error(`Failed to approve vacation: ${error.message}`)
    }
  }

  // Utility functions for data processing
  formatEmployeeName(employee: {
    userProfile?: { name?: string } | null
    employeeNumber?: string
  }): string {
    if (employee.userProfile?.name) {
      return employee.userProfile.name
    }
    return `Employee ${employee.employeeNumber || 'Unknown'}`
  }

  formatEmployeeOffice(office: {
    location: string
    country: string
    countryCode: string
  }): string {
    return `${office.location}, ${office.country}`
  }

  formatEmployeeDepartment(department?: string, position?: string): string {
    if (department && position) {
      return `${position} - ${department}`
    }
    return department || position || 'No department'
  }

  calculateVacationDays(startDate: number, endDate: number, includeWeekends = true): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    let days = 0
    
    const currentDate = new Date(start)
    while (currentDate <= end) {
      if (includeWeekends) {
        days++
      } else {
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
          days++
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  isEmployeeOnVacation(vacationEntries: any[], checkDate: number = Date.now()): boolean {
    return vacationEntries.some(entry => 
      entry.approved && 
      checkDate >= entry.startDate && 
      checkDate <= entry.endDate
    )
  }

  getUpcomingVacations(vacationEntries: any[], daysAhead = 30): any[] {
    const now = Date.now()
    const futureDate = now + (daysAhead * 24 * 60 * 60 * 1000)
    
    return vacationEntries.filter(entry => 
      entry.approved && 
      entry.startDate > now && 
      entry.startDate <= futureDate
    ).sort((a, b) => a.startDate - b.startDate)
  }

  validateEmployeeData(data: Partial<CreateEmployeeData | UpdateEmployeeData>): string[] {
    const errors: string[] = []

    // Employee number validation
    if (data.employeeNumber && data.employeeNumber.length > 20) {
      errors.push('Employee number must be less than 20 characters')
    }

    // Department validation
    if (data.department && data.department.length > 50) {
      errors.push('Department must be less than 50 characters')
    }

    // Position validation
    if (data.position && data.position.length > 100) {
      errors.push('Position must be less than 100 characters')
    }

    // Contact validation
    if (data.workPhone && !this.isValidPhone(data.workPhone)) {
      errors.push('Invalid work phone number format')
    }

    if (data.workEmail && !this.isValidEmail(data.workEmail)) {
      errors.push('Invalid work email address')
    }

    // Office validation
    if (data.office) {
      if (!data.office.location?.trim()) {
        errors.push('Office location is required')
      }

      if (data.office.location && data.office.location.length > 100) {
        errors.push('Office location must be less than 100 characters')
      }

      if (!data.office.country?.trim()) {
        errors.push('Office country is required')
      }

      if (!data.office.countryCode?.trim()) {
        errors.push('Office country code is required')
      }
    }

    // Emergency contact validation
    if (data.emergencyContact) {
      if (!data.emergencyContact.name?.trim()) {
        errors.push('Emergency contact name is required')
      }

      if (!data.emergencyContact.phone?.trim()) {
        errors.push('Emergency contact phone is required')
      }

      if (data.emergencyContact.phone && !this.isValidPhone(data.emergencyContact.phone)) {
        errors.push('Emergency contact phone format is invalid')
      }

      if (!data.emergencyContact.relationship?.trim()) {
        errors.push('Emergency contact relationship is required')
      }
    }

    return errors
  }

  validateVacationData(data: VacationRequestFormData): string[] {
    const errors: string[] = []

    if (data.startDate >= data.endDate) {
      errors.push('End date must be after start date')
    }

    if (data.days <= 0) {
      errors.push('Vacation days must be greater than 0')
    }

    if (data.days > 50) {
      errors.push('Vacation days cannot exceed 50 days')
    }

    // Basic validation for calculated days vs date range
    const daysBetweenDates = Math.ceil((data.endDate - data.startDate) / (1000 * 60 * 60 * 24))
    if (data.days > daysBetweenDates + 1) {
      errors.push('Vacation days cannot exceed the date range')
    }

    return errors
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }
}

export const employeesService = new EmployeesService()