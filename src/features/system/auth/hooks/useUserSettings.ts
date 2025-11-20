// src/features/boilerplate/auth/hooks/useUserSettings.ts

import { useCallback, useMemo } from 'react'
import { userSettingsManagementService, UserSettingsUpdate } from '../services/UserSettingsManagementService'
import { UserModelPreferences } from '../types/auth.types'

/**
 * User settings hook - handles current user preferences and settings
 * Optimized with conditional query execution
 */
export function useUserSettings(enabled = true) {
  const { data: settings, isPending: isSettingsLoading } = userSettingsManagementService.useUserSettings(enabled)
  const { data: modelPreferences, isPending: isModelPreferencesLoading } = userSettingsManagementService.useUserModelPreferences(enabled)
  
  const updateSettingsMutation = userSettingsManagementService.useUpdateUserSettings()
  const resetSettingsMutation = userSettingsManagementService.useResetUserSettings()
  const updateModelPrefsMutation = userSettingsManagementService.useUpdateModelPreferences()
  const setDefaultModelMutation = userSettingsManagementService.useSetDefaultModel()
  const toggleFavoriteMutation = userSettingsManagementService.useToggleFavoriteModel()
  const clearDefaultMutation = userSettingsManagementService.useClearDefaultModel()

  // === Settings Actions ===
  const updateSettings = useCallback(async (updates: UserSettingsUpdate) => {
    return await userSettingsManagementService.updateSettings(
      updateSettingsMutation,
      updates
    )
  }, [updateSettingsMutation])

  const resetSettings = useCallback(async () => {
    return await userSettingsManagementService.resetSettings(
      resetSettingsMutation
    )
  }, [resetSettingsMutation])

  const updateModelPreferences = useCallback(async (preferences: Partial<UserModelPreferences>) => {
    return await userSettingsManagementService.updateModelPreferences(
      updateModelPrefsMutation,
      preferences
    )
  }, [updateModelPrefsMutation])

  const setDefaultModel = useCallback(async (
    modelId: string,
    modelType: 'language' | 'embedding' | 'image' | 'multimodal'
  ) => {
    return await userSettingsManagementService.setDefaultModel(
      setDefaultModelMutation,
      modelId,
      modelType
    )
  }, [setDefaultModelMutation])

  const toggleFavoriteModel = useCallback(async (modelId: string) => {
    return await userSettingsManagementService.toggleFavoriteModel(
      toggleFavoriteMutation,
      modelId
    )
  }, [toggleFavoriteMutation])

  const clearDefaultModel = useCallback(async (
    modelType: 'language' | 'embedding' | 'image' | 'multimodal'
  ) => {
    return await userSettingsManagementService.clearDefaultModel(
      clearDefaultMutation,
      modelType
    )
  }, [clearDefaultMutation])

  // === Theme Utilities ===
  const currentTheme = useMemo(() => {
    if (!settings) return userSettingsManagementService.getSystemTheme()
    return userSettingsManagementService.resolveTheme(settings.theme)
  }, [settings])

  const systemTheme = userSettingsManagementService.getSystemTheme()

  // === Export/Import ===
  const exportSettings = useCallback(() => {
    if (!settings || !modelPreferences) return null
    return userSettingsManagementService.exportSettings(settings, modelPreferences)
  }, [settings, modelPreferences])

  // === Loading States ===
  const isLoading = isSettingsLoading || isModelPreferencesLoading
  const isUpdating = 
    updateSettingsMutation.isPending ||
    resetSettingsMutation.isPending ||
    updateModelPrefsMutation.isPending ||
    setDefaultModelMutation.isPending ||
    toggleFavoriteMutation.isPending ||
    clearDefaultMutation.isPending

  return {
    // Data
    settings: settings || userSettingsManagementService.getDefaultSettings(),
    modelPreferences: modelPreferences || userSettingsManagementService.getDefaultModelPreferences(),
    isLoading,
    isUpdating,
    
    // Theme
    currentTheme,
    systemTheme,
    
    // Settings Actions
    updateSettings,
    resetSettings,
    
    // Model Preferences Actions
    updateModelPreferences,
    setDefaultModel,
    toggleFavoriteModel,
    clearDefaultModel,
    
    // Utilities
    exportSettings,
    
    // Loading states for specific actions
    isUpdatingSettings: updateSettingsMutation.isPending,
    isResetting: resetSettingsMutation.isPending,
    isUpdatingModelPrefs: updateModelPrefsMutation.isPending,
    isSettingDefaultModel: setDefaultModelMutation.isPending,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
    isClearingDefault: clearDefaultMutation.isPending,
    
    // Raw mutations (for advanced usage)
    mutations: {
      updateSettings: updateSettingsMutation,
      resetSettings: resetSettingsMutation,
      updateModelPreferences: updateModelPrefsMutation,
      setDefaultModel: setDefaultModelMutation,
      toggleFavoriteModel: toggleFavoriteMutation,
      clearDefaultModel: clearDefaultMutation,
    }
  }
}