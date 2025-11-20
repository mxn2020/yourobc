// filepath: src/features/boilerplate/admin/hooks/useUserManagement.ts
import { useState, useCallback, useMemo } from 'react'
import { userManagementService } from '../services/UserManagementService'
import type {
  UserManagementFilters,
  BulkUserAction,
  UserCreationRequest,
  RoleUpdateRequest,
  BanUserRequest,
  SetPasswordRequest,
  ListUsersOptions
} from '../types/admin.types'
import { useAuth, UserRole, AuthUserId, UserProfileId } from '@/features/boilerplate/auth'

/**
 * User management hook - handles admin operations on users
 */
export function useUserManagement() {
  const [filters, setFilters] = useState<UserManagementFilters>({
    limit: 25,
    offset: 0,
  })
  const [selectedUsers, setSelectedUsers] = useState<Set<AuthUserId>>(new Set())

  // === Queries ===
  const { data: usersList, isPending: isLoadingUsers, error: usersError } =
    userManagementService.useUserList(filters as ListUsersOptions)

  const { data: userStats, isPending: isLoadingStats } =
    userManagementService.useUserStats()

  // === Mutations ===
  const createUserMutation = userManagementService.useCreateUser()
  const setUserRoleMutation = userManagementService.useSetUserRole()
  const updateUserRoleMutation = userManagementService.useUpdateUserRole()
  const banUserMutation = userManagementService.useBanUser()
  const unbanUserMutation = userManagementService.useUnbanUser()
  const impersonateUserMutation = userManagementService.useImpersonateUser()
  const stopImpersonatingMutation = userManagementService.useStopImpersonating()
  const removeUserMutation = userManagementService.useRemoveUser()
  const deactivateUserMutation = userManagementService.useDeactivateUser()
  const setPasswordMutation = userManagementService.useSetUserPassword()
  const revokeSessionMutation = userManagementService.useRevokeUserSession()
  const revokeAllSessionsMutation = userManagementService.useRevokeUserSessions()

  // === User Actions ===
  const createUser = useCallback(async (userData: UserCreationRequest) => {
    const validation = userManagementService.validateUserCreation(userData)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    return await userManagementService.createUser(createUserMutation, userData)
  }, [createUserMutation])

  const updateUserRole = useCallback(async (request: RoleUpdateRequest) => {
    return await userManagementService.updateUserRole(
      setUserRoleMutation,
      updateUserRoleMutation,
      request
    )
  }, [setUserRoleMutation, updateUserRoleMutation])

  const banUser = useCallback(async (userId: AuthUserId, banReason?: string, banExpiresIn?: number) => {
    const request: BanUserRequest = {
      userId,
      banReason,
      banExpiresIn
    }
    return await userManagementService.banUser(banUserMutation, request)
  }, [banUserMutation])

  const unbanUser = useCallback(async (userId: AuthUserId) => {
    return await userManagementService.unbanUser(unbanUserMutation, userId)
  }, [unbanUserMutation])

  const impersonateUser = useCallback(async (userId: AuthUserId) => {
    return await userManagementService.impersonateUser(impersonateUserMutation, userId)
  }, [impersonateUserMutation])

  const stopImpersonating = useCallback(async () => {
    return await userManagementService.stopImpersonating(stopImpersonatingMutation)
  }, [stopImpersonatingMutation])

  const removeUser = useCallback(async (authUserId: AuthUserId, userProfileId: UserProfileId) => {
    if (!window.confirm('Are you sure? This action cannot be undone.')) {
      return { success: false, error: { message: 'Action cancelled' } }
    }

    return await userManagementService.removeUser(
      removeUserMutation,
      deactivateUserMutation,
      authUserId,
      userProfileId
    )
  }, [removeUserMutation, deactivateUserMutation])

  const setUserPassword = useCallback(async (request: SetPasswordRequest) => {
    return await userManagementService.setUserPassword(setPasswordMutation, request)
  }, [setPasswordMutation])

  const toggleUserStatus = useCallback(async (userProfileId: UserProfileId, isActive: boolean) => {
    return await userManagementService.toggleUserStatus(
      deactivateUserMutation,
      userManagementService.useReactivateUser(),
      userProfileId,
      isActive
    )
  }, [deactivateUserMutation])

  // === Session Management ===
  const revokeUserSession = useCallback(async (sessionToken: string) => {
    return await userManagementService.revokeUserSession(revokeSessionMutation, sessionToken)
  }, [revokeSessionMutation])

  const revokeAllUserSessions = useCallback(async (userId: AuthUserId) => {
    return await userManagementService.revokeAllUserSessions(revokeAllSessionsMutation, userId)
  }, [revokeAllSessionsMutation])

  // === Bulk Operations ===
  const performBulkAction = useCallback(async (action: BulkUserAction) => {
    if (action.userIds.length === 0) {
      throw new Error('No users selected')
    }

    const metadata = {
      role: action.metadata?.newRole,
      banReason: action.metadata?.banReason,
      banExpiresIn: action.metadata?.banExpiresIn,
    }

    const result = await userManagementService.bulkUserOperation(
      action.userIds,
      action.type,
      metadata
    )

    // Clear selection after bulk action
    setSelectedUsers(new Set())

    return result
  }, [])

  // === Filter Management ===
  const updateFilters = useCallback((newFilters: Partial<UserManagementFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, offset: 0 }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({ limit: 25, offset: 0 })
  }, [])

  // === Pagination ===
  const nextPage = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 25)
    }))
  }, [])

  const previousPage = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 25))
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    const limit = filters.limit || 25
    setFilters(prev => ({ ...prev, offset: page * limit }))
  }, [filters.limit])

  // === Selection Management ===
  const toggleUserSelection = useCallback((userId: AuthUserId) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }, [])

  const selectAllUsers = useCallback(() => {
    if (usersList?.data?.users) {
      setSelectedUsers(new Set(usersList.data.users.map(user => user.id)))
    }
  }, [usersList])

  const clearSelection = useCallback(() => {
    setSelectedUsers(new Set())
  }, [])

  // === Computed Values ===
  const currentPage = useMemo(() => {
    const limit = filters.limit || 25
    return Math.floor((filters.offset || 0) / limit)
  }, [filters])

  const hasNextPage = useMemo(() => {
    if (!usersList?.data) return false
    return (usersList.data.users?.length || 0) >= (filters.limit || 25)
  }, [usersList, filters.limit])

  const hasPreviousPage = useMemo(() => {
    return (filters.offset || 0) > 0
  }, [filters.offset])

  const selectedUsersList = useMemo(() => {
    if (!usersList?.data?.users) return []
    return usersList.data.users.filter(user => selectedUsers.has(user.id))
  }, [usersList, selectedUsers])

  const isUpdating = useMemo(() => {
    return (
      createUserMutation.isPending ||
      setUserRoleMutation.isPending ||
      updateUserRoleMutation.isPending ||
      banUserMutation.isPending ||
      unbanUserMutation.isPending ||
      impersonateUserMutation.isPending ||
      stopImpersonatingMutation.isPending ||
      removeUserMutation.isPending ||
      deactivateUserMutation.isPending ||
      setPasswordMutation.isPending ||
      revokeSessionMutation.isPending ||
      revokeAllSessionsMutation.isPending
    )
  }, [
    createUserMutation.isPending,
    setUserRoleMutation.isPending,
    updateUserRoleMutation.isPending,
    banUserMutation.isPending,
    unbanUserMutation.isPending,
    impersonateUserMutation.isPending,
    stopImpersonatingMutation.isPending,
    removeUserMutation.isPending,
    deactivateUserMutation.isPending,
    setPasswordMutation.isPending,
    revokeSessionMutation.isPending,
    revokeAllSessionsMutation.isPending,
  ])

  return {
    // === Data ===
    users: usersList?.data?.users || [],
    total: usersList?.data?.total || 0,
    userStats,
    isLoadingUsers,
    isLoadingStats,
    error: usersError,

    // === Filters and Pagination ===
    filters,
    updateFilters,
    resetFilters,
    currentPage,
    nextPage,
    previousPage,
    setPage,
    hasNextPage,
    hasPreviousPage,

    // === Selection ===
    selectedUsers,
    selectedUsersList,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,

    // === User Actions ===
    createUser,
    updateUserRole,
    banUser,
    unbanUser,
    impersonateUser,
    stopImpersonating,
    removeUser,
    setUserPassword,
    toggleUserStatus,

    // === Session Management ===
    revokeUserSession,
    revokeAllUserSessions,

    // === Bulk Operations ===
    performBulkAction,

    // === Loading States ===
    isUpdating,
    isCreatingUser: createUserMutation.isPending,
    isUpdatingRole: setUserRoleMutation.isPending || updateUserRoleMutation.isPending,
    isBanning: banUserMutation.isPending,
    isUnbanning: unbanUserMutation.isPending,
    isImpersonating: impersonateUserMutation.isPending,
    isStoppingImpersonation: stopImpersonatingMutation.isPending,
    isRemovingUser: removeUserMutation.isPending,
    isSettingPassword: setPasswordMutation.isPending,
    isRevokingSession: revokeSessionMutation.isPending || revokeAllSessionsMutation.isPending,
    isTogglingStatus: deactivateUserMutation.isPending,

    // === Utilities ===
    canManageUser: userManagementService.canManageUser,
    formatUserDisplayName: userManagementService.formatUserDisplayName,
    getUserStatusColor: userManagementService.getUserStatusColor,
    getUserStatusText: userManagementService.getUserStatusText,
    validateUserCreation: userManagementService.validateUserCreation,

    // === Raw Mutations (for advanced usage) ===
    mutations: {
      createUser: createUserMutation,
      setUserRole: setUserRoleMutation,
      updateUserRole: updateUserRoleMutation,
      banUser: banUserMutation,
      unbanUser: unbanUserMutation,
      impersonateUser: impersonateUserMutation,
      stopImpersonating: stopImpersonatingMutation,
      removeUser: removeUserMutation,
      deactivateUser: deactivateUserMutation,
      setPassword: setPasswordMutation,
      revokeSession: revokeSessionMutation,
      revokeAllSessions: revokeAllSessionsMutation,
    }
  }
}