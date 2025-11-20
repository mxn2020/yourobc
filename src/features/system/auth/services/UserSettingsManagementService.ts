// src/features/boilerplate/auth/services/UserSettingsManagementService.ts

import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { 
  UserSettings,
  UserSettingsData,
  UserModelPreferences,
  ThemeMode,
  LayoutPreferences,
  NotificationSettings,
  DashboardSettings,
  createProfileError,
  PROFILE_ERROR_CODES
} from '../types/auth.types'

export interface UserSettingsUpdate {
  theme?: ThemeMode
  language?: string
  timezone?: string
  dateFormat?: string
  layoutPreferences?: LayoutPreferences
  notificationPreferences?: NotificationSettings
  dashboardPreferences?: DashboardSettings
}

/**
 * User settings management service - handles user preferences and settings
 * Optimized with conditional query execution
 */
class UserSettingsManagementService {

  // === Settings Queries ===
  useUserSettings(enabled = true) {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.user_settings.queries.getUserSettings, {}),
      enabled, // Only run when enabled
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    })
  }

  useUserModelPreferences(enabled = true) {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.user_settings.queries.getUserModelPreferences, {}),
      enabled, // Only run when enabled
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes
    })
  }

  // === Settings Mutations ===
  useUpdateUserSettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.user_settings.mutations.updateUserSettings),
    })
  }

  useResetUserSettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.user_settings.mutations.resetUserSettings),
    })
  }

  useUpdateModelPreferences() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.user_settings.mutations.updateUserModelPreferences),
    })
  }

  useSetDefaultModel() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.user_settings.mutations.setDefaultModel),
    })
  }

  useToggleFavoriteModel() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.user_settings.mutations.toggleFavoriteModel),
    })
  }

  useClearDefaultModel() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.user_settings.mutations.clearDefaultModel),
    })
  }

  // === Settings Operations ===
  async updateSettings(
    updateMutation: ReturnType<typeof this.useUpdateUserSettings>,
    updates: UserSettingsUpdate
  ): Promise<void> {
    try {
      await updateMutation.mutateAsync(updates)
    } catch (error) {
      throw createProfileError(
        PROFILE_ERROR_CODES.UPDATE_FAILED,
        'Failed to update settings',
        { updates, originalError: error }
      )
    }
  }

  async resetSettings(
    resetMutation: ReturnType<typeof this.useResetUserSettings>
  ): Promise<void> {
    try {
      await resetMutation.mutateAsync({})
    } catch (error) {
      throw createProfileError(
        PROFILE_ERROR_CODES.UPDATE_FAILED,
        'Failed to reset settings',
        { originalError: error }
      )
    }
  }

  async updateModelPreferences(
    updateMutation: ReturnType<typeof this.useUpdateModelPreferences>,
    preferences: Partial<UserModelPreferences>
  ): Promise<void> {
    try {
      await updateMutation.mutateAsync(preferences)
    } catch (error) {
      throw createProfileError(
        PROFILE_ERROR_CODES.UPDATE_FAILED,
        'Failed to update model preferences',
        { preferences, originalError: error }
      )
    }
  }

  async setDefaultModel(
    setMutation: ReturnType<typeof this.useSetDefaultModel>,
    modelId: string,
    modelType: 'language' | 'embedding' | 'image' | 'multimodal'
  ): Promise<void> {
    try {
      await setMutation.mutateAsync({ modelId, modelType })
    } catch (error) {
      throw createProfileError(
        PROFILE_ERROR_CODES.UPDATE_FAILED,
        'Failed to set default model',
        { modelId, modelType, originalError: error }
      )
    }
  }

  async toggleFavoriteModel(
    toggleMutation: ReturnType<typeof this.useToggleFavoriteModel>,
    modelId: string
  ): Promise<void> {
    try {
      await toggleMutation.mutateAsync({ modelId })
    } catch (error) {
      throw createProfileError(
        PROFILE_ERROR_CODES.UPDATE_FAILED,
        'Failed to toggle favorite model',
        { modelId, originalError: error }
      )
    }
  }

  async clearDefaultModel(
    clearMutation: ReturnType<typeof this.useClearDefaultModel>,
    modelType: 'language' | 'embedding' | 'image' | 'multimodal'
  ): Promise<void> {
    try {
      await clearMutation.mutateAsync({ modelType })
    } catch (error) {
      throw createProfileError(
        PROFILE_ERROR_CODES.UPDATE_FAILED,
        'Failed to clear default model',
        { modelType, originalError: error }
      )
    }
  }

  // === Settings Utilities ===
  getDefaultSettings(): Omit<UserSettings, '_id' | 'userId' | 'createdAt' | 'updatedAt'> {
    return {
      theme: 'auto',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      dateFormat: 'MM/dd/yyyy',
      version: 1,
      layoutPreferences: {
        layout: 'header',
      },
      notificationPreferences: {
        email: true,
        push: true,
        projectUpdates: true,
        assignments: true,
        deadlines: true,
      },
      dashboardPreferences: {
        defaultView: 'cards',
        itemsPerPage: 25,
        showCompletedProjects: true,
      },
    }
  }

  getDefaultModelPreferences(): UserModelPreferences {
    return {
      defaultLanguageModel: undefined,
      defaultEmbeddingModel: undefined,
      defaultImageModel: undefined,
      defaultMultimodalModel: undefined,
      favoriteModels: [],
      hiddenProviders: [],
      preferredView: 'grid',
      sortPreference: {
        field: 'name',
        direction: 'asc',
      },
      testingDefaults: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1.0,
      },
    }
  }

  // === Theme Utilities ===
  getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  resolveTheme(themeMode: ThemeMode): 'light' | 'dark' {
    if (themeMode === 'auto') {
      return this.getSystemTheme()
    }
    return themeMode
  }

  // === Validation ===
  validateTheme(theme: string): theme is ThemeMode {
    return ['light', 'dark', 'auto'].includes(theme)
  }

  validateLanguage(language: string): boolean {
    return /^[a-z]{2}(-[A-Z]{2})?$/.test(language)
  }

  validateTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone })
      return true
    } catch {
      return false
    }
  }

  validateDateFormat(format: string): boolean {
    const validFormats = [
      'MM/dd/yyyy',
      'dd/MM/yyyy', 
      'yyyy-MM-dd',
      'dd-MM-yyyy',
      'MM-dd-yyyy',
      'dd.MM.yyyy',
      'MM.dd.yyyy',
    ]
    return validFormats.includes(format)
  }

  // === Export/Import ===
  exportSettings(settings: UserSettingsData, modelPreferences: UserModelPreferences) {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      modelPreferences,
    }
  }

  validateImportedSettings(data: any): boolean {
    try {
      return (
        data &&
        typeof data === 'object' &&
        data.version &&
        data.settings &&
        typeof data.settings.theme === 'string' &&
        this.validateTheme(data.settings.theme)
      )
    } catch {
      return false
    }
  }
}

export const userSettingsManagementService = new UserSettingsManagementService()