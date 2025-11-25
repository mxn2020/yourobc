// convex/lib/system/app_theme_settings/types.ts
// Type definitions for appThemeSettings module

import type { Doc, Id } from '@/generated/dataModel';

// ============================================================================
// Entity Types
// ============================================================================

export type AppThemeSetting = Doc<'appThemeSettings'>;
export type AppThemeSettingId = Id<'appThemeSettings'>;

// ============================================================================
// Data Interfaces
// ============================================================================

export interface ThemeValue {
  type: 'string' | 'number' | 'boolean' | 'color' | 'object';
  value: any;
}

// ============================================================================
// Create/Update Data Interfaces
// ============================================================================

export interface CreateAppThemeSettingData {
  key: string;
  value: any;
  category: string;
  description?: string;
  isEditable?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateAppThemeSettingData {
  value?: any;
  category?: string;
  description?: string;
  isEditable?: boolean;
  metadata?: Record<string, any>;
}

// ============================================================================
// Response Types
// ============================================================================

export interface AppThemeSettingListResponse {
  items: AppThemeSetting[];
  total: number;
  hasMore: boolean;
}

export interface AppThemeSettingStatsResponse {
  totalSettings: number;
  settingsByCategory: Record<string, number>;
  editableSettings: number;
  recentlyModified: number;
}

export interface AppThemeSettingsByCategory {
  [category: string]: AppThemeSetting[];
}

// ============================================================================
// Filter Types
// ============================================================================

export interface AppThemeSettingFilters {
  category?: string[];
  isEditable?: boolean;
  searchQuery?: string;
  modifiedAfter?: number;
  modifiedBefore?: number;
}
