import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/generated/api';

import type {
  AppSetting,
  AppSettingCategory,
  AppSettingId,
  AppSettingValue,
  AppSettingValueType,
} from '@/convex/schema/system';
import {
  getSettingDescription,
  validateSettingByCategory,
} from '@/convex/lib/system/app/app_settings/utils';

/**
 * New App settings service (new Convex pattern).
 * No legacy signatures.
 */
class AppSettingsService {
  private inferValueType(value: AppSettingValue): AppSettingValueType {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'object') return 'object';
    return 'string';
  }

  // ---------------------------------------------------------------------------
  // Query option factories (SSR + stable keys)
  // ---------------------------------------------------------------------------

  getAppSettingsQueryOptions(params?: {
    category?: AppSettingCategory;
    limit?: number;
    cursor?: string | null;
    search?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return convexQuery(api.lib.system.app.app_settings.queries.getAppSettings, {
      category: params?.category,
      limit: params?.limit,
      cursor: params?.cursor ?? undefined,
      search: params?.search,
      sortOrder: params?.sortOrder,
    });
  }

  getAppSettingQueryOptions(id: AppSettingId) {
    return convexQuery(api.lib.system.app.app_settings.queries.getAppSetting, { id });
  }

  getAppSettingByKeyQueryOptions(key: string) {
    return convexQuery(api.lib.system.app.app_settings.queries.getAppSettingByKey, { key });
  }

  getAISettingsQueryOptions() {
    return convexQuery(api.lib.system.app.app_settings.queries.getAISettings, {});
  }
  getGeneralSettingsQueryOptions() {
    return convexQuery(api.lib.system.app.app_settings.queries.getGeneralSettings, {});
  }
  getSecuritySettingsQueryOptions() {
    return convexQuery(api.lib.system.app.app_settings.queries.getSecuritySettings, {});
  }
  getNotificationSettingsQueryOptions() {
    return convexQuery(api.lib.system.app.app_settings.queries.getNotificationSettings, {});
  }
  getBillingSettingsQueryOptions() {
    return convexQuery(api.lib.system.app.app_settings.queries.getBillingSettings, {});
  }
  getIntegrationSettingsQueryOptions() {
    return convexQuery(api.lib.system.app.app_settings.queries.getIntegrationSettings, {});
  }

  getPublicSettingsQueryOptions(category?: AppSettingCategory) {
    return convexQuery(api.lib.system.app.app_settings.queries.getPublicSettings, { category });
  }

  getSettingsStatsQueryOptions() {
    return convexQuery(api.lib.system.app.app_settings.queries.getSettingsStats, {});
  }

  getSettingsHistoryQueryOptions(key?: string, limit?: number) {
    return convexQuery(api.lib.system.app.app_settings.queries.getSettingsHistory, { key, limit });
  }

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  useAppSettings(params?: {
    category?: AppSettingCategory;
    limit?: number;
    cursor?: string | null;
    search?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return useQuery({
      ...this.getAppSettingsQueryOptions(params),
      staleTime: 5 * 60 * 1000,
    });
  }

  useAllSettings(params?: {
    category?: AppSettingCategory;
    limit?: number;
    cursor?: string | null;
    search?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return this.useAppSettings(params);
  }

  useAppSetting(id: AppSettingId) {
    return useQuery({
      ...this.getAppSettingQueryOptions(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    });
  }

  useAppSettingByKey(key: string) {
    return useQuery({
      ...this.getAppSettingByKeyQueryOptions(key),
      enabled: !!key,
      staleTime: 5 * 60 * 1000,
    });
  }

  useAISettings() {
    return useQuery({
      ...this.getAISettingsQueryOptions(),
      staleTime: 10 * 60 * 1000,
    });
  }
  useGeneralSettings() {
    return useQuery({
      ...this.getGeneralSettingsQueryOptions(),
      staleTime: 15 * 60 * 1000,
    });
  }
  useSecuritySettings() {
    return useQuery({
      ...this.getSecuritySettingsQueryOptions(),
      staleTime: 15 * 60 * 1000,
    });
  }
  useNotificationSettings() {
    return useQuery({
      ...this.getNotificationSettingsQueryOptions(),
      staleTime: 10 * 60 * 1000,
    });
  }
  useBillingSettings() {
    return useQuery({
      ...this.getBillingSettingsQueryOptions(),
      staleTime: 15 * 60 * 1000,
    });
  }
  useIntegrationSettings() {
    return useQuery({
      ...this.getIntegrationSettingsQueryOptions(),
      staleTime: 10 * 60 * 1000,
    });
  }

  usePublicSettings(category?: AppSettingCategory) {
    return useQuery({
      ...this.getPublicSettingsQueryOptions(category),
      staleTime: 30 * 60 * 1000,
    });
  }

  useSearchSettings(searchTerm: string, categories?: AppSettingCategory[], limit?: number) {
    return useQuery({
      ...convexQuery(api.lib.system.app.app_settings.queries.searchSettings, {
        searchTerm,
        categories,
        limit,
      }),
      enabled: searchTerm.length > 2,
      staleTime: 2 * 60 * 1000,
    });
  }

  useSettingsStats() {
    return useQuery({
      ...this.getSettingsStatsQueryOptions(),
      staleTime: 10 * 60 * 1000,
    });
  }

  useSettingsHistory(key?: string, limit?: number) {
    return useQuery({
      ...this.getSettingsHistoryQueryOptions(key, limit),
      staleTime: 2 * 60 * 1000,
    });
  }

  // ---------------------------------------------------------------------------
  // Mutations hooks
  // ---------------------------------------------------------------------------

  useCreateOrUpdateSetting() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.createOrUpdateAppSetting
      ),
    });
  }

  useCreateSetting() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.createAppSetting
      ),
    });
  }

  useUpdateSetting() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.updateAppSetting
      ),
    });
  }

  useDeleteSetting() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.deleteAppSetting
      ),
    });
  }

  useDeleteSettingByKey() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.deleteAppSettingByKey
      ),
    });
  }

  useBatchUpsertSettings() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.batchUpsertSettings
      ),
    });
  }

  useBatchUpdateSettings() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.batchUpdateSettings
      ),
    });
  }

  useUpdateCategorySettings(category: AppSettingCategory) {
    const map = {
      ai: api.lib.system.app.app_settings.mutations.updateAISettings,
      general: api.lib.system.app.app_settings.mutations.updateGeneralSettings,
      security: api.lib.system.app.app_settings.mutations.updateSecuritySettings,
      notifications: api.lib.system.app.app_settings.mutations.updateNotificationSettings,
      billing: api.lib.system.app.app_settings.mutations.updateBillingSettings,
      integrations: api.lib.system.app.app_settings.mutations.updateIntegrationSettings,
    } as const;

    return useMutation({
      mutationFn: useConvexMutation(map[category]),
    });
  }

  useUpdateAISettings() {
    return this.useUpdateCategorySettings('ai');
  }

  useUpdateGeneralSettings() {
    return this.useUpdateCategorySettings('general');
  }

  useUpdateSecuritySettings() {
    return this.useUpdateCategorySettings('security');
  }

  useUpdateNotificationSettings() {
    return this.useUpdateCategorySettings('notifications');
  }

  useUpdateBillingSettings() {
    return this.useUpdateCategorySettings('billing');
  }

  useUpdateIntegrationSettings() {
    return this.useUpdateCategorySettings('integrations');
  }

  useResetCategoryToDefaults() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.resetCategoryToDefaults
      ),
    });
  }

  useTestAIConnection() {
    return useMutation({
      mutationFn: useConvexMutation(
        api.lib.system.app.app_settings.mutations.testAIConnection
      ),
    });
  }

  // ---------------------------------------------------------------------------
  // Async helpers (optional DX)
  // ---------------------------------------------------------------------------

  async upsertSetting(
    mutation: ReturnType<AppSettingsService['useCreateOrUpdateSetting']>,
    input: {
      name?: string;
      key: string;
      value: AppSettingValue;
      valueType?: AppSettingValueType;
      category: AppSettingCategory;
      description?: string;
      isPublic?: boolean;
    }
  ) {
    const valueType = input.valueType ?? this.inferValueType(input.value);
    return mutation.mutateAsync({ ...input, valueType });
  }

  async deleteSettingById(
    mutation: ReturnType<AppSettingsService['useDeleteSetting']>,
    id: AppSettingId
  ) {
    return mutation.mutateAsync({ id });
  }

  async deleteSettingByKey(
    mutation: ReturnType<AppSettingsService['useDeleteSettingByKey']>,
    key: string
  ) {
    return mutation.mutateAsync({ key });
  }

  async batchUpsert(
    mutation: ReturnType<AppSettingsService['useBatchUpsertSettings']>,
    settings: Array<{
      name?: string;
      key: string;
      value: AppSettingValue;
      valueType?: AppSettingValueType;
      category: AppSettingCategory;
      description?: string;
      isPublic?: boolean;
    }>
  ) {
    const normalized = settings.map((setting) => ({
      ...setting,
      valueType: setting.valueType ?? this.inferValueType(setting.value),
    }));
    return mutation.mutateAsync({ settings: normalized });
  }

  async createOrUpdateSetting(
    mutation: ReturnType<AppSettingsService['useCreateOrUpdateSetting']>,
    key: string,
    value: AppSettingValue,
    category: AppSettingCategory,
    description?: string,
    isPublic = false,
    name?: string
  ) {
    return mutation.mutateAsync({
      name: name ?? key,
      key,
      value,
      valueType: this.inferValueType(value),
      category,
      description,
      isPublic,
    });
  }

  async deleteSetting(
    mutation: ReturnType<AppSettingsService['useDeleteSettingByKey']>,
    key: string
  ) {
    return mutation.mutateAsync({ key });
  }

  async batchUpdateSettings(
    mutation: ReturnType<AppSettingsService['useBatchUpdateSettings']>,
    settings: Array<{ key: string; value: AppSettingValue; category: AppSettingCategory }>
  ) {
    const payload = settings.map((setting) => ({
      ...setting,
      valueType: this.inferValueType(setting.value),
      name: setting.key,
    }));
    return mutation.mutateAsync({ settings: payload });
  }

  validateSettingValue(
    key: string,
    value: AppSettingValue,
    category: AppSettingCategory
  ): { valid: boolean; errors: string[] } {
    const errors = validateSettingByCategory(key, value, category);
    return { valid: errors.length === 0, errors };
  }

  getSettingDisplayInfo(key: string) {
    return {
      key,
      description: getSettingDescription(key),
    };
  }

  exportSettings(settings: AppSetting[]): string {
    return JSON.stringify(settings, null, 2);
  }

  validateImportedSettings(
    data: unknown
  ): { valid: boolean; errors: string[]; settings: AppSetting[] } {
    if (!Array.isArray(data)) {
      return { valid: false, errors: ['Expected an array of settings'], settings: [] };
    }

    const errors: string[] = [];
    const settings: AppSetting[] = [];

    data.forEach((item, index) => {
      if (
        typeof item === 'object' &&
        item !== null &&
        'key' in item &&
        'value' in item &&
        'category' in item
      ) {
        const casted = item as AppSetting;
        const validation = this.validateSettingValue(
          casted.key,
          casted.value as AppSettingValue,
          casted.category as AppSettingCategory
        );
        if (!validation.valid) {
          errors.push(`Item ${index}: ${validation.errors.join(', ')}`);
        } else {
          settings.push(casted);
        }
      } else {
        errors.push(`Item ${index} is not a valid setting object`);
      }
    });

    return { valid: errors.length === 0, errors, settings };
  }

  // ---------------------------------------------------------------------------
  // Local utilities
  // ---------------------------------------------------------------------------

  categorizeSettings(settings: AppSetting[]): Record<string, AppSetting[]> {
    return settings.reduce((acc, s) => {
      (acc[s.category] ||= []).push(s);
      return acc;
    }, {} as Record<string, AppSetting[]>);
  }

  filterSettingsByCategory(settings: AppSetting[], category: AppSettingCategory) {
    return settings.filter((s) => s.category === category);
  }

  searchLocal(settings: AppSetting[], searchTerm: string) {
    const term = searchTerm.toLowerCase();
    return settings.filter(
      (s) =>
        s.key.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        (s.description?.toLowerCase().includes(term) ?? false)
    );
  }
}

export const appSettingsService = new AppSettingsService();
