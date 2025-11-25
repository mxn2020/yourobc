// filepath: src/features/system/admin/services/UserManagementService.ts

import { authClient } from '../../auth/lib/auth-client'
import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api'
import { UserRole, AuthUserId } from '@/features/system/auth'
import type {
  BetterAuthUser,
  UserSession,
  BanUserRequest,
  SetPasswordRequest,
  ListUsersOptions,
  ListUsersResponse,
  AdminOperationResponse,
  UserCreationRequest,
  RoleUpdateRequest,
  UserWithRole
} from '../types/admin.types'
import { UserProfileId } from '@/types'

// Better Auth supported roles (subset of our UserRole)
type BetterAuthRole = 'user' | 'superadmin' | 'admin' | 'moderator' | 'editor' | 'analyst' | 'guest'

// Convert our UserRole to BetterAuthRole
function toBetterAuthRole(role: UserRole): BetterAuthRole {
  const betterAuthRoles: BetterAuthRole[] = ['user', 'superadmin', 'admin', 'moderator', 'editor', 'analyst', 'guest']

  if (betterAuthRoles.includes(role as BetterAuthRole)) {
    return role as BetterAuthRole
  }

  // Map CRM-specific roles to closest Better Auth equivalent
  const roleMapping: Record<string, BetterAuthRole> = {
    'manager': 'admin',
    'hr': 'moderator',
    'sales': 'user',
    'operations': 'user',
    'marketing': 'editor',
    'viewer': 'guest',
    'finance': 'analyst'
  }

  return roleMapping[role] || 'user'
}

/**
 * User management service - handles admin operations on users
 * Uses Better Auth admin plugin for user management
 */
class UserManagementService {

  // === User Queries ===
  useUserList(options?: ListUsersOptions) {
    return useQuery({
      queryKey: ['admin', 'users', 'list', options],
      queryFn: async () => {
        return await authClient.admin.listUsers({
          query: options || {},
        })
      },
      staleTime: 30000, // 30 seconds
    })
  }

  useUserSessions(userId: AuthUserId) {
    return useQuery({
      queryKey: ['admin', 'users', 'sessions', userId],
      queryFn: async () => {
        return await authClient.admin.listUserSessions({ userId })
      },
      enabled: !!userId,
      staleTime: 60000, // 1 minute
    })
  }

  useConvexUserProfiles(filters?: {
    limit?: number
    offset?: number
    role?: UserRole
    isActive?: boolean
    search?: string
  }) {
    return useQuery({
      ...convexQuery(api.lib.system.user.user_profiles.queries.getAllProfiles, {
        options: filters,
      }),
      staleTime: 30000,
    })
  }

  useUserStats() {
    return useQuery({
      ...convexQuery(api.lib.system.user.user_profiles.queries.getProfileStats, {}),
      staleTime: 60000,
    })
  }

  // === User Management Mutations ===
  useCreateUser() {
    return useMutation({
      mutationFn: async (data: UserCreationRequest) => {
        return await authClient.admin.createUser({
          email: data.email,
          password: data.password,
          name: data.name,
          role: toBetterAuthRole(data.role || 'user'),
        })
      }
    })
  }

  useSetUserRole() {
    return useMutation({
      mutationFn: async (data: RoleUpdateRequest) => {
        return await authClient.admin.setRole({
          userId: data.authUserId,
          role: toBetterAuthRole(data.newRole),
        })
      }
    })
  }

  useBanUser() {
    return useMutation({
      mutationFn: async (data: BanUserRequest) => {
        return await authClient.admin.banUser(data)
      }
    })
  }

  useUnbanUser() {
    return useMutation({
      mutationFn: async (data: { userId: AuthUserId }) => {
        return await authClient.admin.unbanUser(data)
      }
    })
  }

  useImpersonateUser() {
    return useMutation({
      mutationFn: async (data: { userId: AuthUserId }) => {
        return await authClient.admin.impersonateUser(data)
      }
    })
  }

  useStopImpersonating() {
    return useMutation({
      mutationFn: async () => {
        return await authClient.admin.stopImpersonating({})
      }
    })
  }

  useRemoveUser() {
    return useMutation({
      mutationFn: async (data: { userId: AuthUserId }) => {
        return await authClient.admin.removeUser(data)
      }
    })
  }

  useSetUserPassword() {
    return useMutation({
      mutationFn: async (data: SetPasswordRequest) => {
        return await authClient.admin.setUserPassword(data)
      }
    })
  }

  useRevokeUserSession() {
    return useMutation({
      mutationFn: async (data: { sessionToken: string }) => {
        return await authClient.admin.revokeUserSession(data)
      }
    })
  }

  useRevokeUserSessions() {
    return useMutation({
      mutationFn: async (data: { userId: AuthUserId }) => {
        return await authClient.admin.revokeUserSessions(data)
      }
    })
  }

  // === Convex Profile Mutations ===
  useDeactivateUser() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.user.user_profiles.mutations.deactivateUser),
    })
  }

  useReactivateUser() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.user.user_profiles.mutations.reactivateUser),
    })
  }

  useUpdateUserRole() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.user.user_profiles.mutations.updateUserRole),
    })
  }

  // === User Management Operations ===
  async createUser(
    createMutation: ReturnType<typeof this.useCreateUser>,
    userData: UserCreationRequest
  ): Promise<AdminOperationResponse> {
    try {
      const result = await createMutation.mutateAsync(userData)
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to create user' }
      }
    }
  }

  async updateUserRole(
    setRoleMutation: ReturnType<typeof this.useSetUserRole>,
    updateRoleMutation: ReturnType<typeof this.useUpdateUserRole>,
    request: RoleUpdateRequest
  ): Promise<AdminOperationResponse> {
    try {
      // Update role in Better Auth (uses AuthUserId)
      await setRoleMutation.mutateAsync(request)

      // Update role in Convex profile (uses UserProfileId)
      await updateRoleMutation.mutateAsync({
        targetUserId: request.userProfileId,
        newRole: request.newRole,
        permissions: request.permissions,
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to update user role' }
      }
    }
  }

  async banUser(
    banMutation: ReturnType<typeof this.useBanUser>,
    request: BanUserRequest
  ): Promise<AdminOperationResponse> {
    try {
      await banMutation.mutateAsync(request)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to ban user' }
      }
    }
  }

  async unbanUser(
    unbanMutation: ReturnType<typeof this.useUnbanUser>,
    userId: AuthUserId
  ): Promise<AdminOperationResponse> {
    try {
      await unbanMutation.mutateAsync({ userId })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to unban user' }
      }
    }
  }

  async impersonateUser(
    impersonateMutation: ReturnType<typeof this.useImpersonateUser>,
    userId: AuthUserId
  ): Promise<AdminOperationResponse> {
    try {
      const result = await impersonateMutation.mutateAsync({ userId })
      return { success: true, data: result }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to impersonate user' }
      }
    }
  }

  async stopImpersonating(
    stopMutation: ReturnType<typeof this.useStopImpersonating>
  ): Promise<AdminOperationResponse> {
    try {
      await stopMutation.mutateAsync()
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to stop impersonating' }
      }
    }
  }

  async removeUser(
    removeMutation: ReturnType<typeof this.useRemoveUser>,
    deactivateMutation: ReturnType<typeof this.useDeactivateUser>,
    authUserId: AuthUserId,
    userProfileId: UserProfileId
  ): Promise<AdminOperationResponse> {
    try {
      // Remove from Better Auth (uses AuthUserId)
      await removeMutation.mutateAsync({ userId: authUserId })

      // Deactivate in Convex (soft delete - uses UserProfileId)
      await deactivateMutation.mutateAsync({
        targetUserId: userProfileId,
      })

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to remove user' }
      }
    }
  }

  async setUserPassword(
    passwordMutation: ReturnType<typeof this.useSetUserPassword>,
    request: SetPasswordRequest
  ): Promise<AdminOperationResponse> {
    try {
      await passwordMutation.mutateAsync(request)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to set user password' }
      }
    }
  }

  async toggleUserStatus(
    deactivateMutation: ReturnType<typeof this.useDeactivateUser>,
    reactivateMutation: ReturnType<typeof this.useReactivateUser>,
    userId: UserProfileId,
    isActive: boolean
  ): Promise<AdminOperationResponse> {
    try {
      if (isActive) {
        await deactivateMutation.mutateAsync({
          targetUserId: userId,
        })
      } else {
        await reactivateMutation.mutateAsync({
          targetUserId: userId,
        })
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to toggle user status' }
      }
    }
  }

  // === Session Management Operations ===
  async revokeUserSession(
    revokeMutation: ReturnType<typeof this.useRevokeUserSession>,
    sessionToken: string
  ): Promise<AdminOperationResponse> {
    try {
      await revokeMutation.mutateAsync({ sessionToken })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to revoke session' }
      }
    }
  }

  async revokeAllUserSessions(
    revokeAllMutation: ReturnType<typeof this.useRevokeUserSessions>,
    userId: AuthUserId
  ): Promise<AdminOperationResponse> {
    try {
      await revokeAllMutation.mutateAsync({ userId })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Failed to revoke all sessions' }
      }
    }
  }

  // === Bulk Operations ===
  async bulkUserOperation(
    userIds: AuthUserId[],
    operation: 'ban' | 'unban' | 'setRole' | 'revokeAllSessions' | 'activate' | 'deactivate',
    metadata?: {
      role?: UserRole
      banReason?: string
      banExpiresIn?: number
      adminAuthUserId?: AuthUserId
    }
  ): Promise<{ successful: AuthUserId[]; failed: Array<{ userId: AuthUserId; error: string }> }> {
    const successful: AuthUserId[] = []
    const failed: Array<{ userId: AuthUserId, error: string }> = []

    for (const userId of userIds) {
      try {
        switch (operation) {
          case 'ban':
            await authClient.admin.banUser({
              userId,
              banReason: metadata?.banReason,
              banExpiresIn: metadata?.banExpiresIn
            })
            break
          case 'unban':
            await authClient.admin.unbanUser({ userId })
            break
          case 'setRole':
            if (!metadata?.role) throw new Error('Role is required for setRole operation')
            await authClient.admin.setRole({ userId, role: toBetterAuthRole(metadata.role) })
            break
          case 'revokeAllSessions':
            await authClient.admin.revokeUserSessions({ userId })
            break
          case 'activate':
          case 'deactivate':
            // These would be handled via Convex mutations
            console.warn(`Bulk ${operation} not implemented for Convex profiles`)
            break
          default:
            throw new Error(`Unknown operation: ${operation}`)
        }
        successful.push(userId)
      } catch (error) {
        failed.push({
          userId: userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return { successful, failed }
  }

  // === Utility Functions ===
  validateUserCreation(userData: UserCreationRequest): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!userData.email?.trim()) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Invalid email format')
    }

    if (!userData.name?.trim()) {
      errors.push('Name is required')
    }

    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (userData.role && !['superadmin', 'admin', 'moderator', 'editor', 'analyst', 'user', 'guest'].includes(userData.role)) {
      errors.push('Invalid role specified')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  canManageUser(adminRole: UserRole, targetRole: UserRole): boolean {
    const roleHierarchy: Record<UserRole, number> = {
      guest: 0,
      user: 1,
      analyst: 2,
      editor: 2,
      moderator: 3,
      admin: 4,
      superadmin: 5
    }

    const adminLevel = roleHierarchy[adminRole]
    const targetLevel = roleHierarchy[targetRole]

    // Superadmin can manage anyone
    if (adminRole === 'superadmin') return true

    // Admin can manage roles below admin level
    if (adminRole === 'admin' && targetLevel < roleHierarchy.admin) return true

    // No one else can manage roles
    return false
  }

  formatUserDisplayName(user: UserWithRole): string {
    return user.name || user.email || 'Unknown User'
  }

  getUserStatusColor(user: UserWithRole): string {
    if (user.banned) return 'text-red-600 bg-red-50'
    if (!user.emailVerified) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  getUserStatusText(user: UserWithRole): string {
    if (user.banned) return 'Banned'
    if (!user.emailVerified) return 'Unverified'
    return 'Active'
  }
}

export const userManagementService = new UserManagementService()