// filepath: src/features/boilerplate/admin/hooks/useAppSettingsManagement.ts
import { useCallback, useMemo } from 'react'
import { appSettingsService } from '../services/AppSettingsService'
import type { AISettings, SystemSettings, AppSetting } from '../types/admin.types'
import type { SettingCategory } from '@/convex/lib/boilerplate/app_settings/types'
import { AuthUserId } from '@/features/boilerplate/auth'

/**
 * App settings management hook - handles system-wide settings for admins
 */
export function useAppSettingsManagement() {

  // === Settings Queries ===
  const { data: allSettings, isPending: isLoadingAll } = appSettingsService.useAllSettings()
  const { data: aiSettings, isPending: isLoadingAI } = appSettingsService.useAISettings()
  const { data: generalSettings, isPending: isLoadingGeneral } = appSettingsService.useGeneralSettings()
  const { data: securitySettings, isPending: isLoadingSecurity } = appSettingsService.useSecuritySettings()
  const { data: notificationSettings, isPending: isLoadingNotifications } = appSettingsService.useNotificationSettings()
  const { data: billingSettings, isPending: isLoadingBilling } = appSettingsService.useBillingSettings()
  const { data: integrationSettings, isPending: isLoadingIntegrations } = appSettingsService.useIntegrationSettings()
  const { data: settingsStats, isPending: isLoadingStats } = appSettingsService.useSettingsStats()

  // === Settings Mutations ===
  const createOrUpdateMutation = appSettingsService.useCreateOrUpdateSetting()
  const deleteMutation = appSettingsService.useDeleteSetting()
  const updateAIMutation = appSettingsService.useUpdateAISettings()
  const updateGeneralMutation = appSettingsService.useUpdateGeneralSettings()
  const updateSecurityMutation = appSettingsService.useUpdateSecuritySettings()
  const updateNotificationsMutation = appSettingsService.useUpdateNotificationSettings()
  const updateBillingMutation = appSettingsService.useUpdateBillingSettings()
  const updateIntegrationsMutation = appSettingsService.useUpdateIntegrationSettings()
  const batchUpdateMutation = appSettingsService.useBatchUpdateSettings()
  const resetCategoryMutation = appSettingsService.useResetCategoryToDefaults()
  const testAIMutation = appSettingsService.useTestAIConnection()

  // === Individual Setting Operations ===
  const updateSetting = useCallback(async (
    key: string,
    value: any,
    category: SettingCategory,
    description?: string,
    isPublic: boolean = false
  ) => {
    const validation = appSettingsService.validateSettingValue(key, value, category)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    return await appSettingsService.createOrUpdateSetting(
      createOrUpdateMutation,
      key,
      value,
      category,
      description,
      isPublic
    )
  }, [createOrUpdateMutation])

  const deleteSetting = useCallback(async (key: string) => {
    if (!window.confirm('Are you sure you want to delete this setting?')) {
      return
    }

    return await appSettingsService.deleteSetting(
      deleteMutation,
      key
    )
  }, [deleteMutation])

  // === Category-specific Operations ===
  const updateAISettings = useCallback(async (settings: Partial<AISettings>) => {
    return await appSettingsService.updateAISettings(
      updateAIMutation,
      settings
    )
  }, [updateAIMutation])

  const updateGeneralSettings = useCallback(async (settings: Partial<SystemSettings['general']>) => {
    return await appSettingsService.updateGeneralSettings(
      updateGeneralMutation,
      settings
    )
  }, [updateGeneralMutation])

  const updateSecuritySettings = useCallback(async (settings: Partial<SystemSettings['security']>) => {
    return await appSettingsService.updateSecuritySettings(
      updateSecurityMutation,
      settings
    )
  }, [updateSecurityMutation])

  const updateNotificationSettings = useCallback(async (settings: Partial<SystemSettings['notifications']>) => {
    return await appSettingsService.updateNotificationSettings(
      updateNotificationsMutation,
      settings
    )
  }, [updateNotificationsMutation])

  const updateBillingSettings = useCallback(async (settings: any) => {
    return await appSettingsService.updateBillingSettings(
      updateBillingMutation,
      settings
    )
  }, [updateBillingMutation])

  const updateIntegrationSettings = useCallback(async (settings: any) => {
    return await appSettingsService.updateIntegrationSettings(
      updateIntegrationsMutation,
      settings
    )
  }, [updateIntegrationsMutation])

  // === Bulk Operations ===
  const batchUpdateSettings = useCallback(async (
    settings: Array<{ key: string; value: any; category: SettingCategory }>
  ) => {
    // Validate all settings before updating
    for (const setting of settings) {
      const validation = appSettingsService.validateSettingValue(
        setting.key,
        setting.value,
        setting.category
      )
      if (!validation.valid) {
        throw new Error(`Validation failed for ${setting.key}: ${validation.errors.join(', ')}`)
      }
    }

    return await appSettingsService.batchUpdateSettings(
      batchUpdateMutation,
      settings
    )
  }, [batchUpdateMutation])

  const resetCategoryToDefaults = useCallback(async (category: SettingCategory) => {
    if (!window.confirm(`Are you sure you want to reset all ${category} settings to defaults?`)) {
      return
    }

    return await appSettingsService.resetCategoryToDefaults(
      resetCategoryMutation,
      category
    )
  }, [resetCategoryMutation])

  // === Testing and Validation ===
  const testAIConnection = useCallback(async (modelId?: string) => {
    return await appSettingsService.testAIConnection(
      testAIMutation,
      modelId
    )
  }, [testAIMutation])

  // === Data Processing ===
  const categorizedSettings = useMemo(() => {
    if (!allSettings?.settings) return {}
    return appSettingsService.categorizeSettings(allSettings.settings as AppSetting[])
  }, [allSettings])

  const getSettingsByCategory = useCallback((category: SettingCategory) => {
    if (!allSettings?.settings) return []
    return appSettingsService.filterSettingsByCategory(allSettings.settings as AppSetting[], category)
  }, [allSettings])

  // === Export/Import ===
  const exportSettings = useCallback((category?: SettingCategory) => {
    const settingsToExport = category
      ? getSettingsByCategory(category)
      : (allSettings?.settings as AppSetting[]) || []

    return appSettingsService.exportSettings(settingsToExport)
  }, [allSettings, getSettingsByCategory])

  const validateImportedSettings = useCallback((data: any) => {
    return appSettingsService.validateImportedSettings(data)
  }, [])

  // === Loading States ===
  const isLoading = useMemo(() => {
    return (
      isLoadingAll ||
      isLoadingAI ||
      isLoadingGeneral ||
      isLoadingSecurity ||
      isLoadingNotifications ||
      isLoadingBilling ||
      isLoadingIntegrations ||
      isLoadingStats
    )
  }, [
    isLoadingAll,
    isLoadingAI,
    isLoadingGeneral,
    isLoadingSecurity,
    isLoadingNotifications,
    isLoadingBilling,
    isLoadingIntegrations,
    isLoadingStats,
  ])

  const isUpdating = useMemo(() => {
    return (
      createOrUpdateMutation.isPending ||
      deleteMutation.isPending ||
      updateAIMutation.isPending ||
      updateGeneralMutation.isPending ||
      updateSecurityMutation.isPending ||
      updateNotificationsMutation.isPending ||
      updateBillingMutation.isPending ||
      updateIntegrationsMutation.isPending ||
      batchUpdateMutation.isPending ||
      resetCategoryMutation.isPending ||
      testAIMutation.isPending
    )
  }, [
    createOrUpdateMutation.isPending,
    deleteMutation.isPending,
    updateAIMutation.isPending,
    updateGeneralMutation.isPending,
    updateSecurityMutation.isPending,
    updateNotificationsMutation.isPending,
    updateBillingMutation.isPending,
    updateIntegrationsMutation.isPending,
    batchUpdateMutation.isPending,
    resetCategoryMutation.isPending,
    testAIMutation.isPending,
  ])

  return {
    // === Data ===
    allSettings: allSettings?.settings || [],
    total: allSettings?.total || 0,
    hasMore: allSettings?.hasMore || false,
    aiSettings,
    generalSettings,
    securitySettings,
    notificationSettings,
    billingSettings,
    integrationSettings,
    settingsStats,
    categorizedSettings,

    // === Loading States ===
    isLoading,
    isUpdating,

    // === Individual Setting Operations ===
    updateSetting,
    deleteSetting,

    // === Category-specific Operations ===
    updateAISettings,
    updateGeneralSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    updateBillingSettings,
    updateIntegrationSettings,

    // === Bulk Operations ===
    batchUpdateSettings,
    resetCategoryToDefaults,

    // === Testing and Validation ===
    testAIConnection,

    // === Data Utilities ===
    getSettingsByCategory,
    exportSettings,
    validateImportedSettings,

    // === Specific Loading States ===
    isUpdatingSetting: createOrUpdateMutation.isPending,
    isDeletingSetting: deleteMutation.isPending,
    isUpdatingAI: updateAIMutation.isPending,
    isUpdatingGeneral: updateGeneralMutation.isPending,
    isUpdatingSecurity: updateSecurityMutation.isPending,
    isUpdatingNotifications: updateNotificationsMutation.isPending,
    isUpdatingBilling: updateBillingMutation.isPending,
    isUpdatingIntegrations: updateIntegrationsMutation.isPending,
    isBatchUpdating: batchUpdateMutation.isPending,
    isResettingCategory: resetCategoryMutation.isPending,
    isTesting: testAIMutation.isPending,

    // === Utilities ===
    validateSettingValue: appSettingsService.validateSettingValue,
    getSettingDisplayInfo: appSettingsService.getSettingDisplayInfo,
    categorizeSettings: appSettingsService.categorizeSettings,
    searchSettings: appSettingsService.searchSettings,

    // === Raw Mutations (for advanced usage) ===
    mutations: {
      createOrUpdate: createOrUpdateMutation,
      delete: deleteMutation,
      updateAI: updateAIMutation,
      updateGeneral: updateGeneralMutation,
      updateSecurity: updateSecurityMutation,
      updateNotifications: updateNotificationsMutation,
      updateBilling: updateBillingMutation,
      updateIntegrations: updateIntegrationsMutation,
      batchUpdate: batchUpdateMutation,
      resetCategory: resetCategoryMutation,
      testAI: testAIMutation,
    }
  }
}