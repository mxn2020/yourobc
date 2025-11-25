import { useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import type { CustomerId } from '../types'

/**
 * Customer permissions hook
 * Centralizes all permission checking logic for customers
 */
export function useCustomerPermissions() {
  const authUser = useAuthenticatedUser()

  const canCreateCustomers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canViewCustomers = useMemo(() => {
    if (!authUser) return false
    // All authenticated users can view customers in this system
    return true
  }, [authUser])

  const canEditCustomers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canDeleteCustomers = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canManageCustomerTags = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  const canViewCustomerAnalytics = useMemo(() => {
    if (!authUser) return false
    return authUser.role === 'admin' || authUser.role === 'superadmin'
  }, [authUser])

  return {
    canCreateCustomers,
    canViewCustomers,
    canEditCustomers,
    canDeleteCustomers,
    canManageCustomerTags,
    canViewCustomerAnalytics,
  }
}

/**
 * Convenience hooks for specific permission checks
 */
export function useCanCreateCustomers() {
  const { canCreateCustomers } = useCustomerPermissions()
  return canCreateCustomers
}

export function useCanEditCustomers() {
  const { canEditCustomers } = useCustomerPermissions()
  return canEditCustomers
}

export function useCanDeleteCustomers() {
  const { canDeleteCustomers } = useCustomerPermissions()
  return canDeleteCustomers
}
