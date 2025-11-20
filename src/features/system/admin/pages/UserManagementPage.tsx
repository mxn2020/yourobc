// src/features/admin/pages/UserManagementPage.tsx

import React, { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  MoreHorizontal,
  Edit,
  Shield,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  Mail,
  Ban,
  Key,
  LogOut,
  UserCog,
  Settings,
  AlertTriangle
} from 'lucide-react'
import { Badge, Button, Card, CardContent, Checkbox, Input, RadioGroup, RadioGroupItem, SimpleSelect } from '@/components/ui'
import { AdminLayout } from '../components/AdminLayout'
import { AdminGuard } from '../components/AdminGuard'
import { UserRole, AuthUserId, UserProfileId } from '@/features/system/auth'
import { useUserManagement } from '../hooks/useUserManagement'
import { useAdminPermissions } from '../hooks/useAdmin'
import { userManagementService } from '../services/UserManagementService'
import { ROLE_DEFINITIONS } from '../types/admin.types'
import type { RoleUpdateRequest, BanUserRequest, SetPasswordRequest, UserWithRole } from '../types/admin.types'
import { useToast } from '@/features/system/notifications'
import { parseConvexError } from '@/utils/errorHandling'
import { Id } from "@/convex/_generated/dataModel";
import { useTranslation } from '@/features/system/i18n'

export function UserManagementPage() {
  const { t } = useTranslation('admin')
  const toast = useToast()
  const { adminProfile } = useAdminPermissions()

  // Early return if admin profile is not loaded yet
  if (!adminProfile) {
    return (
      <AdminGuard requiredPermission="users.manage">
        <AdminLayout title={t('userManagement.title')} subtitle={t('userManagement.subtitle')}>
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">{t('userManagement.states.loadingProfile')}</p>
          </div>
        </AdminLayout>
      </AdminGuard>
    )
  }

  const adminUserId = adminProfile.authUserId

  // Map to store authUserId -> userProfileId for ID conversion
  const [userIdMap, setUserIdMap] = useState<Map<AuthUserId, UserProfileId>>(new Map())

  // Fetch Convex profiles to build ID map
  const { data: convexProfiles } = userManagementService.useConvexUserProfiles({
    limit: 1000  // Get all profiles to build map
  })

  // Build ID map when convex profiles load
  useEffect(() => {
    if (convexProfiles?.profiles) {
      const map = new Map<AuthUserId, UserProfileId>()
      convexProfiles.profiles.forEach(profile => {
        map.set(profile.authUserId, profile._id)
      })
      setUserIdMap(map)
    }
  }, [convexProfiles])

  // Helper to get UserProfileId from AuthUserId
  const getUserProfileId = (authUserId: AuthUserId): UserProfileId | null => {
    return userIdMap.get(authUserId) || null
  }

  const {
    users,
    total,
    isLoadingUsers,
    error,
    filters,
    updateFilters,
    resetFilters,
    selectedUsers,
    selectedUsersList,
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    updateUserRole,
    banUser,
    unbanUser,
    impersonateUser,
    removeUser,
    setUserPassword,
    toggleUserStatus,
    performBulkAction,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    isUpdating,
    isUpdatingRole,
    isBanning,
    isUnbanning,
    isImpersonating,
    isRemovingUser,
    isSettingPassword,
  } = useUserManagement()

  const [searchTerm, setSearchTerm] = useState('')
  const [showActionModal, setShowActionModal] = useState<{
    user: UserWithRole | null
    action: 'role' | 'ban' | 'password' | 'sessions' | null
    isOpen: boolean
  }>({ user: null, action: null, isOpen: false })

  const handleSearch = () => {
    updateFilters({ search: searchTerm })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return t('userManagement.timeAgo.today')
    if (days === 1) return t('userManagement.timeAgo.yesterday')
    if (days < 7) return t('userManagement.timeAgo.daysAgo', { count: days })
    if (days < 30) return t('userManagement.timeAgo.weeksAgo', { count: Math.floor(days / 7) })
    return t('userManagement.timeAgo.monthsAgo', { count: Math.floor(days / 30) })
  }

  const getRoleConfig = (role: UserRole) => {
    return ROLE_DEFINITIONS[role] || ROLE_DEFINITIONS.user
  }

  const getRoleBadgeVariant = (color: string) => {
    switch (color) {
      case 'red': return 'danger' as const
      case 'blue': return 'primary' as const
      case 'green': return 'success' as const
      case 'yellow': return 'warning' as const
      case 'gray': return 'secondary' as const
      case 'purple': return 'info' as const
      default: return 'secondary' as const
    }
  }

  const handleUserAction = async (user: UserWithRole, action: string) => {
    const userProfileId = getUserProfileId(user.id)

    try {
      switch (action) {
        case 'impersonate':
          await impersonateUser(user.id) // ✅ BetterAuth uses AuthUserId
          break
        case 'ban':
          setShowActionModal({ user, action: 'ban', isOpen: true })
          break
        case 'unban':
          await unbanUser(user.id) // ✅ BetterAuth uses AuthUserId
          break
        case 'toggle_status':
          if (!userProfileId) {
            toast.error('User profile not found')
            return
          }
          // TODO: Need to get isActive status from Convex profile
          // await toggleUserStatus(userProfileId, isActive)
          console.warn('Toggle status needs Convex profile isActive status')
          break
        case 'change_role':
          if (!userProfileId) {
            toast.error('User profile not found')
            return
          }
          setShowActionModal({ user, action: 'role', isOpen: true })
          break
        case 'reset_password':
          setShowActionModal({ user, action: 'password', isOpen: true })
          break
        case 'view_sessions':
          setShowActionModal({ user, action: 'sessions', isOpen: true })
          break
        case 'remove':
          if (!userProfileId) {
            toast.error('User profile not found')
            return
          }
          if (window.confirm(t('userManagement.confirmations.deleteUser', { name: user.name || user.email }))) {
            await removeUser(user.id, userProfileId) // ✅ Both IDs
          }
          break
      }
    } catch (error: any) {
      console.error('User action error:', error)

      const { message, code } = parseConvexError(error)
      toast.error(message)

      if (code === 'PERMISSION_DENIED') {
        console.warn('User lacks permission to perform this action')
      } else if (code === 'USER_NOT_FOUND') {
        console.warn('User no longer exists')
      } else if (code === 'VALIDATION_FAILED') {
        console.warn('Action validation failed')
      }
    }
  }

  const bulkActions = [
    {
      label: t('userManagement.bulkActions.activateSelected'),
      action: () => performBulkAction({
        type: 'activate',
        userIds: Array.from(selectedUsers),
      }),
      variant: 'success' as const,
    },
    {
      label: t('userManagement.bulkActions.deactivateSelected'),
      action: () => performBulkAction({
        type: 'deactivate',
        userIds: Array.from(selectedUsers),
      }),
      variant: 'warning' as const,
    },
    {
      label: t('userManagement.bulkActions.changeToUser'),
      action: () => performBulkAction({
        type: 'setRole' as const,
        userIds: Array.from(selectedUsers),
        metadata: { newRole: 'user' as UserRole },
      }),
      variant: 'primary' as const,
    },
  ]

  const exportUsers = () => {
    type CSVRow = {
      'User ID': string
      'Name': string
      'Email': string
      'Role': string
      'Status': string
      'Email Verified': string
      'Created': string
      'Updated': string
    }

    const csvData: CSVRow[] = users.map((user): CSVRow => ({
      'User ID': user.id as string,
      'Name': user.name || 'N/A',
      'Email': user.email,
      'Role': user.role || '',
      'Status': user.banned ? 'Banned' : 'Active',
      'Email Verified': user.emailVerified ? 'Yes' : 'No',
      'Created': new Date(user.createdAt).toLocaleDateString(),
      'Updated': new Date(user.updatedAt).toLocaleDateString(),
    }))

    const csvHeaders = Object.keys(csvData[0] || {}) as Array<keyof CSVRow>
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => csvHeaders.map(header => `"${row[header]}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <AdminGuard>
        <AdminLayout title={t('userManagement.title')} subtitle={t('userManagement.subtitle')}>
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">{t('userManagement.errors.loadingUsers')}</h2>
                <p className="text-gray-600">{error.message || t('userManagement.errors.failedToLoad')}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  {t('userManagement.errors.retry')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AdminLayout>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard requiredPermission="users.manage">
      <AdminLayout
        title={t('userManagement.title')}
        subtitle={t('userManagement.subtitle')}
        actions={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={exportUsers}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('userManagement.actions.export')}</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{t('userManagement.actions.addUser')}</span>
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder={t('userManagement.filters.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleSearch}
                    className="flex items-center space-x-2"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <SimpleSelect
                  value={filters.role || ''}
                  onChange={(e) => updateFilters({ role: (e.target.value as UserRole) || undefined })}
                  options={[
                    { value: '', label: t('userManagement.filters.allRoles') },
                    ...Object.values(ROLE_DEFINITIONS).map(role => ({
                      value: role.value,
                      label: role.label
                    }))
                  ]}
                  className="min-w-[120px]"
                />

                <SimpleSelect
                  value={filters.isActive !== undefined ? String(filters.isActive) : ''}
                  onChange={(e) => updateFilters({
                    isActive: e.target.value ? e.target.value === 'true' : undefined
                  })}
                  options={[
                    { value: '', label: t('userManagement.filters.allStatus') },
                    { value: 'true', label: t('userManagement.filters.active') },
                    { value: 'false', label: t('userManagement.filters.inactive') }
                  ]}
                  className="min-w-[120px]"
                />

                <Button
                  variant="ghost"
                  onClick={resetFilters}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>{t('userManagement.filters.reset')}</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.size === 1
                      ? t('userManagement.bulkActions.selected', { count: selectedUsers.size })
                      : t('userManagement.bulkActions.selectedPlural', { count: selectedUsers.size })
                    }
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                  >
                    {t('userManagement.bulkActions.clearSelection')}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {bulkActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      disabled={isUpdating}
                      className={`${action.variant === 'success' ? 'text-green-600 border-green-300 hover:bg-green-50' :
                          action.variant === 'warning' ? 'text-yellow-600 border-yellow-300 hover:bg-yellow-50' :
                            action.variant === 'primary' ? 'text-blue-600 border-blue-300 hover:bg-blue-50' :
                              ''
                        }`}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {isLoadingUsers ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">{t('userManagement.states.loading')}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">{t('userManagement.states.noUsers')}</p>
                {filters.search && (
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="mt-2"
                  >
                    {t('userManagement.states.clearFilters')}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <Checkbox
                            checked={selectedUsers.size === users.length && users.length > 0}
                            onChange={(checked) => checked ? selectAllUsers() : clearSelection()}
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('userManagement.table.columns.user')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('userManagement.table.columns.role')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('userManagement.table.columns.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('userManagement.table.columns.created')}
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('userManagement.table.columns.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => {
                        const roleConfig = getRoleConfig(user.role as UserRole)

                        return (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <Checkbox
                                checked={selectedUsers.has(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.image ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={user.image}
                                    alt={user.name || user.email}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-gray-600" />
                                  </div>
                                )}
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name || t('userManagement.table.noName')}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center space-x-1">
                                    <span>{user.email}</span>
                                    {user.emailVerified && (
                                      <span title="Email verified">
                                        <Mail className="h-3 w-3 text-green-500" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getRoleBadgeVariant(roleConfig.color)}>
                                {roleConfig.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Badge variant={user.banned ? 'danger' : 'success'}>
                                  {user.banned ? t('userManagement.table.status.banned') : t('userManagement.table.status.active')}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-1">
                                {/* Role Change */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user, 'change_role')}
                                  title={t('userManagement.table.tooltips.changeRole')}
                                  disabled={isUpdating}
                                >
                                  <Shield className="h-4 w-4" />
                                </Button>

                                {/* Impersonate */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user, 'impersonate')}
                                  title={t('userManagement.table.tooltips.impersonate')}
                                  className="text-purple-600 hover:text-purple-800"
                                  disabled={isImpersonating}
                                >
                                  <UserCog className="h-4 w-4" />
                                </Button>

                                {/* Ban/Unban */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUserAction(user, user.banned ? 'unban' : 'ban')}
                                  title={user.banned ? t('userManagement.table.tooltips.unbanUser') : t('userManagement.table.tooltips.banUser')}
                                  className="text-red-600 hover:text-red-800"
                                  disabled={isBanning || isUnbanning}
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>

                                {/* More Options */}
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title={t('userManagement.table.tooltips.moreActions')}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {t('userManagement.pagination.page', { page: currentPage + 1 })} • {t('userManagement.pagination.showing', { count: users.length, total })}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousPage}
                        disabled={!hasPreviousPage}
                      >
                        {t('userManagement.pagination.previous')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={nextPage}
                        disabled={!hasNextPage}
                      >
                        {t('userManagement.pagination.next')}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Modals */}
        {showActionModal.isOpen && showActionModal.user && (
          <>
            {showActionModal.action === 'role' && (
              <RoleChangeModal
                user={showActionModal.user}
                onClose={() => setShowActionModal({ user: null, action: null, isOpen: false })}
                onSave={async (newRole) => {
                  const userProfileId = getUserProfileId(showActionModal.user!.id)
                  if (!userProfileId) {
                    toast.error('User profile not found')
                    return
                  }
                  await updateUserRole({
                    authUserId: showActionModal.user!.id, // ✅ For BetterAuth
                    userProfileId: userProfileId, // ✅ For Convex
                    newRole: newRole as UserRole,
                  })
                  setShowActionModal({ user: null, action: null, isOpen: false })
                }}
                isLoading={isUpdatingRole}
              />
            )}

            {showActionModal.action === 'ban' && (
              <BanUserModal
                user={showActionModal.user}
                onClose={() => setShowActionModal({ user: null, action: null, isOpen: false })}
                onSave={async (banReason, banExpiresIn) => {
                  await banUser(showActionModal.user!.id, banReason, banExpiresIn)
                  setShowActionModal({ user: null, action: null, isOpen: false })
                }}
                isLoading={isBanning}
              />
            )}

            {showActionModal.action === 'password' && (
              <ResetPasswordModal
                user={showActionModal.user}
                onClose={() => setShowActionModal({ user: null, action: null, isOpen: false })}
                onSave={async (newPassword) => {
                  await setUserPassword({
                    userId: showActionModal.user!.id,
                    newPassword
                  })
                  setShowActionModal({ user: null, action: null, isOpen: false })
                }}
                isLoading={isSettingPassword}
              />
            )}
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  )
}

// Modal Components
interface RoleChangeModalProps {
  user: UserWithRole
  onClose: () => void
  onSave: (newRole: string) => Promise<void>
  isLoading: boolean
}

function RoleChangeModal({ user, onClose, onSave, isLoading }: RoleChangeModalProps) {
  const { t } = useTranslation('admin')
  const [selectedRole, setSelectedRole] = useState(user.role)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{t('userManagement.modals.roleChange.title')}</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {t('userManagement.modals.roleChange.changingFor', { name: user.name || user.email })}
          </p>
          <p className="text-xs text-gray-500">
            {t('userManagement.modals.roleChange.currentRole', { role: user.role || 'user' })}
          </p>
        </div>

        <RadioGroup
          value={selectedRole as UserRole}
          onValueChange={(value) => setSelectedRole(value as UserRole)}
          className="mb-6"
        >
          {Object.values(ROLE_DEFINITIONS).map((role) => (
            <RadioGroupItem
              key={role.value}
              value={role.value}
              label={role.label}
              description={role.description}
            />
          ))}
        </RadioGroup>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('userManagement.modals.roleChange.cancel')}
          </Button>
          <Button
            onClick={() => onSave(selectedRole as UserRole)}
            disabled={selectedRole === user.role || isLoading}
          >
            {isLoading ? t('userManagement.modals.roleChange.saving') : t('userManagement.modals.roleChange.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface BanUserModalProps {
  user: UserWithRole
  onClose: () => void
  onSave: (banReason?: string, banExpiresIn?: number) => Promise<void>
  isLoading: boolean
}

function BanUserModal({ user, onClose, onSave, isLoading }: BanUserModalProps) {
  const { t } = useTranslation('admin')
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState<'permanent' | 'temporary'>('permanent')
  const [banDays, setBanDays] = useState(7)

  const handleSave = () => {
    const banExpiresIn = banDuration === 'temporary' ? banDays * 24 * 60 * 60 : undefined
    onSave(banReason || undefined, banExpiresIn)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{t('userManagement.modals.banUser.title')}</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {t('userManagement.modals.banUser.banningUser', { name: user.name || user.email })}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('userManagement.modals.banUser.reasonLabel')}
            </label>
            <Input
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder={t('userManagement.modals.banUser.reasonPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('userManagement.modals.banUser.durationLabel')}
            </label>
            <RadioGroup
              value={banDuration}
              onValueChange={(value) => setBanDuration(value as 'permanent' | 'temporary')}
            >
              <RadioGroupItem value="permanent" label={t('userManagement.modals.banUser.permanent')} />
              <RadioGroupItem value="temporary" label={t('userManagement.modals.banUser.temporary')} />
            </RadioGroup>
            {banDuration === 'temporary' && (
              <div className="mt-2 flex items-center space-x-2">
                <Input
                  type="number"
                  value={banDays}
                  onChange={(e) => setBanDays(parseInt(e.target.value) || 1)}
                  min="1"
                  max="365"
                  className="w-20"
                />
                <span className="text-sm text-gray-500">{t('userManagement.modals.banUser.days')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('userManagement.modals.banUser.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? t('userManagement.modals.banUser.saving') : t('userManagement.modals.banUser.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ResetPasswordModalProps {
  user: UserWithRole
  onClose: () => void
  onSave: (newPassword: string) => Promise<void>
  isLoading: boolean
}

function ResetPasswordModal({ user, onClose, onSave, isLoading }: ResetPasswordModalProps) {
  const { t } = useTranslation('admin')
  const toast = useToast()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = () => {
    if (newPassword !== confirmPassword) {
      toast.error(t('userManagement.modals.resetPassword.errors.noMatch'))
      return
    }
    if (newPassword.length < 8) {
      toast.error(t('userManagement.modals.resetPassword.errors.tooShort'))
      return
    }
    onSave(newPassword)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">{t('userManagement.modals.resetPassword.title')}</h3>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            {t('userManagement.modals.resetPassword.resettingFor', { name: user.name || user.email })}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('userManagement.modals.resetPassword.newPasswordLabel')}
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('userManagement.modals.resetPassword.newPasswordPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('userManagement.modals.resetPassword.confirmPasswordLabel')}
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('userManagement.modals.resetPassword.confirmPasswordPlaceholder')}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('userManagement.modals.resetPassword.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || !newPassword || newPassword !== confirmPassword}
          >
            {isLoading ? t('userManagement.modals.resetPassword.saving') : t('userManagement.modals.resetPassword.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}