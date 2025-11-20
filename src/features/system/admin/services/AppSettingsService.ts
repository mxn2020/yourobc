// src/features/admin/services/AppSettingsService.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import { Id } from "@/convex/_generated/dataModel";
import type {
  AISettings,
  SystemSettings,
  AppSetting
} from '../types/admin.types'
import type { SettingCategory } from '@/convex/lib/boilerplate/app_settings/types'

/**
 * App settings service - handles system-wide settings management
 * Admin-only functionality for managing application configuration
 */
class AppSettingsService {

  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  getAppSettingsQueryOptions(category?: SettingCategory) {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getAppSettings, {
      category,
    });
  }

  getAppSettingQueryOptions(key: string) {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getAppSetting, {
      key,
    });
  }

  getAISettingsQueryOptions() {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getAISettings, {});
  }

  getGeneralSettingsQueryOptions() {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getGeneralSettings, {});
  }

  getSecuritySettingsQueryOptions() {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getSecuritySettings, {});
  }

  getNotificationSettingsQueryOptions() {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getNotificationSettings, {});
  }

  getBillingSettingsQueryOptions() {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getBillingSettings, {});
  }

  getIntegrationSettingsQueryOptions() {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getIntegrationSettings, {});
  }

  getPublicSettingsQueryOptions(category?: SettingCategory) {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getPublicSettings, {
      category,
    });
  }

  getSettingsStatsQueryOptions() {
    return convexQuery(api.lib.boilerplate.app_settings.queries.getSettingsStats, {});
  }

  // === Settings Queries ===
  useAllSettings(category?: SettingCategory) {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getAppSettings, {
        category,
      }),
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  }

  useAppSetting(key: string) {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getAppSetting, {
        key,
      }),
      staleTime: 5 * 60 * 1000,
    })
  }

  useAISettings() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getAISettings, {}),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }

  useGeneralSettings() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getGeneralSettings, {}),
      staleTime: 15 * 60 * 1000, // 15 minutes
    })
  }

  useSecuritySettings() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getSecuritySettings, {}),
      staleTime: 15 * 60 * 1000,
    })
  }

  useNotificationSettings() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getNotificationSettings, {}),
      staleTime: 10 * 60 * 1000,
    })
  }

  useBillingSettings() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getBillingSettings, {}),
      staleTime: 15 * 60 * 1000,
    })
  }

  useIntegrationSettings() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getIntegrationSettings, {}),
      staleTime: 10 * 60 * 1000,
    })
  }

  usePublicSettings(category?: SettingCategory) {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getPublicSettings, {
        category,
      }),
      staleTime: 30 * 60 * 1000, // 30 minutes
    })
  }

  useSearchSettings(searchTerm: string, categories?: SettingCategory[]) {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.searchSettings, {
        searchTerm,
        categories,
      }),
      enabled: searchTerm.length > 2,
      staleTime: 2 * 60 * 1000, // 2 minutes
    })
  }

  useSettingsStats() {
    return useQuery({
      ...convexQuery(api.lib.boilerplate.app_settings.queries.getSettingsStats, {}),
      staleTime: 10 * 60 * 1000,
    })
  }

  // === Settings Mutations ===
  useCreateOrUpdateSetting() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.createOrUpdateAppSetting),
    })
  }

  useDeleteSetting() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.deleteAppSetting),
    })
  }

  useUpdateAISettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.updateAISettings),
    })
  }

  useUpdateGeneralSettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.updateGeneralSettings),
    })
  }

  useUpdateSecuritySettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.updateSecuritySettings),
    })
  }

  useUpdateNotificationSettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.updateNotificationSettings),
    })
  }

  useUpdateBillingSettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.updateBillingSettings),
    })
  }

  useUpdateIntegrationSettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.updateIntegrationSettings),
    })
  }

  useBatchUpdateSettings() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.batchUpdateSettings),
    })
  }

  useResetCategoryToDefaults() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.resetCategoryToDefaults),
    })
  }

  useTestAIConnection() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.boilerplate.app_settings.mutations.testAIConnection),
    })
  }

  // === Settings Operations ===
  async createOrUpdateSetting(
    mutation: ReturnType<typeof this.useCreateOrUpdateSetting>,
    key: string,
    value: any,
    category: SettingCategory,
    description?: string,
    isPublic: boolean = false
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        key,
        value,
        category,
        description,
        isPublic,
      })
    } catch (error) {
      throw new Error(`Failed to update setting: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteSetting(
    mutation: ReturnType<typeof this.useDeleteSetting>,
    key: string
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        key,
      })
    } catch (error) {
      throw new Error(`Failed to delete setting: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateAISettings(
    mutation: ReturnType<typeof this.useUpdateAISettings>,
    settings: Partial<AISettings>
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        settings,
      })
    } catch (error) {
      throw new Error(`Failed to update AI settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateGeneralSettings(
    mutation: ReturnType<typeof this.useUpdateGeneralSettings>,
    settings: Partial<SystemSettings['general']>
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        settings,
      })
    } catch (error) {
      throw new Error(`Failed to update general settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateSecuritySettings(
    mutation: ReturnType<typeof this.useUpdateSecuritySettings>,
    settings: Partial<SystemSettings['security']>
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        settings,
      })
    } catch (error) {
      throw new Error(`Failed to update security settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateNotificationSettings(
    mutation: ReturnType<typeof this.useUpdateNotificationSettings>,
    settings: Partial<SystemSettings['notifications']>
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        settings,
      })
    } catch (error) {
      throw new Error(`Failed to update notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateBillingSettings(
    mutation: ReturnType<typeof this.useUpdateBillingSettings>,
    settings: any
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        settings,
      })
    } catch (error) {
      throw new Error(`Failed to update billing settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async updateIntegrationSettings(
    mutation: ReturnType<typeof this.useUpdateIntegrationSettings>,
    settings: any
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        settings,
      })
    } catch (error) {
      throw new Error(`Failed to update integration settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async batchUpdateSettings(
    mutation: ReturnType<typeof this.useBatchUpdateSettings>,
    settings: Array<{ key: string; value: any; category: SettingCategory }>
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        settings,
      })
    } catch (error) {
      throw new Error(`Failed to batch update settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async resetCategoryToDefaults(
    mutation: ReturnType<typeof this.useResetCategoryToDefaults>,
    category: SettingCategory
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        category,
      })
    } catch (error) {
      throw new Error(`Failed to reset category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async testAIConnection(
    mutation: ReturnType<typeof this.useTestAIConnection>,
    modelId?: string
  ): Promise<void> {
    try {
      await mutation.mutateAsync({
        modelId,
      })
    } catch (error) {
      throw new Error(`Failed to test AI connection: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // === Settings Utilities ===
  validateSettingValue(key: string, value: any, category: SettingCategory): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    // Basic validation rules
    if (value === null || value === undefined) {
      errors.push('Value cannot be null or undefined')
      return { valid: false, errors }
    }

    // Category-specific validation
    switch (category) {
      case 'ai':
        if (key === 'maxTokensDefault' && (typeof value !== 'number' || value < 1 || value > 100000)) {
          errors.push('Max tokens must be between 1 and 100,000')
        }
        if (key === 'temperatureDefault' && (typeof value !== 'number' || value < 0 || value > 2)) {
          errors.push('Temperature must be between 0 and 2')
        }
        break

      case 'security':
        if (key === 'sessionTimeout' && (typeof value !== 'number' || value < 300 || value > 86400)) {
          errors.push('Session timeout must be between 5 minutes and 24 hours')
        }
        if (key === 'maxLoginAttempts' && (typeof value !== 'number' || value < 1 || value > 20)) {
          errors.push('Max login attempts must be between 1 and 20')
        }
        break

      case 'general':
        if (key === 'siteName' && (typeof value !== 'string' || value.length < 1 || value.length > 100)) {
          errors.push('Site name must be between 1 and 100 characters')
        }
        break
    }

    return { valid: errors.length === 0, errors }
  }

  getSettingDisplayInfo(key: string, category: SettingCategory): { name: string, description: string, type: string } {
    const settingInfo = {
      // AI Settings
      defaultModel: { name: 'Default Model', description: 'Default AI model for text generation', type: 'string' },
      defaultProvider: { name: 'Default Provider', description: 'Default AI provider', type: 'string' },
      maxTokensDefault: { name: 'Max Tokens', description: 'Default maximum tokens for AI requests', type: 'number' },
      temperatureDefault: { name: 'Temperature', description: 'Default temperature for AI requests', type: 'number' },
      enableAILogging: { name: 'Enable Logging', description: 'Enable logging of AI usage', type: 'boolean' },
      
      // General Settings
      siteName: { name: 'Site Name', description: 'Name of the application', type: 'string' },
      siteDescription: { name: 'Site Description', description: 'Description of the application', type: 'string' },
      maintenanceMode: { name: 'Maintenance Mode', description: 'Enable maintenance mode', type: 'boolean' },
      registrationEnabled: { name: 'Registration Enabled', description: 'Allow new user registrations', type: 'boolean' },
      
      // Security Settings
      sessionTimeout: { name: 'Session Timeout', description: 'Session timeout in seconds', type: 'number' },
      maxLoginAttempts: { name: 'Max Login Attempts', description: 'Maximum failed login attempts', type: 'number' },
      passwordMinLength: { name: 'Password Min Length', description: 'Minimum password length', type: 'number' },
      requireTwoFactor: { name: 'Require 2FA', description: 'Require two-factor authentication', type: 'boolean' },
    }

    return settingInfo[key as keyof typeof settingInfo] || {
      name: key,
      description: `Setting for ${key}`,
      type: 'string'
    }
  }

  categorizeSettings(settings: AppSetting[]): Record<string, AppSetting[]> {
    return settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = []
      }
      acc[setting.category].push(setting)
      return acc
    }, {} as Record<string, AppSetting[]>)
  }

  filterSettingsByCategory(settings: AppSetting[], category: SettingCategory): AppSetting[] {
    return settings.filter(setting => setting.category === category)
  }

  searchSettings(settings: AppSetting[], searchTerm: string): AppSetting[] {
    const lowerSearch = searchTerm.toLowerCase()
    return settings.filter(setting =>
      setting.key.toLowerCase().includes(lowerSearch) ||
      setting.description?.toLowerCase().includes(lowerSearch) ||
      setting.category.toLowerCase().includes(lowerSearch)
    )
  }

  exportSettings(settings: AppSetting[]): string {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: settings.map(setting => ({
        key: setting.key,
        value: setting.value,
        category: setting.category,
        description: setting.description,
        isPublic: setting.isPublic,
      }))
    }

    return JSON.stringify(exportData, null, 2)
  }

  validateImportedSettings(data: any): { valid: boolean, errors: string[] } {
    const errors: string[] = []

    if (!data || typeof data !== 'object') {
      errors.push('Invalid data format')
      return { valid: false, errors }
    }

    if (!data.version) {
      errors.push('Missing version information')
    }

    if (!Array.isArray(data.settings)) {
      errors.push('Settings must be an array')
      return { valid: false, errors }
    }

    // Validate each setting
    for (const setting of data.settings) {
      if (!setting.key || typeof setting.key !== 'string') {
        errors.push(`Invalid setting key: ${setting.key}`)
      }
      if (!setting.category || typeof setting.category !== 'string') {
        errors.push(`Invalid category for setting: ${setting.key}`)
      }
    }

    return { valid: errors.length === 0, errors }
  }
}

export const appSettingsService = new AppSettingsService()