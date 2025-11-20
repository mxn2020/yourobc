// src/features/yourobc/employees/hooks/useUserProfiles.ts

import { useAuthenticatedUser } from '@/features/system/auth'
import { employeesService } from '../services/EmployeesService'

/**
 * Hook for fetching available user profiles for employee creation
 * Returns active user profiles that don't already have employee records
 */
export function useAvailableUserProfiles() {
  const authUser = useAuthenticatedUser()

  const {
    data: userProfiles,
    isPending: isLoading,
    error,
    refetch,
  } = employeesService.useAvailableUserProfiles(authUser?.id!)

  return {
    userProfiles: userProfiles || [],
    isLoading,
    error,
    refetch,
  }
}
