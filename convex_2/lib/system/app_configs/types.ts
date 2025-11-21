// convex/lib/system/app_configs/types.ts
// Type definitions for appConfigs module

import type { Doc, Id } from '@/generated/dataModel';
import type {
  ConfigValueType,
  ConfigScope,
  ConfigOverrideSource,
} from '@/schema/system/appConfigs/types';

// ============================================================================
// Entity Types
// ============================================================================

export type AppConfig = Doc<'appConfigs'>;
export type AppConfigId = Id<'appConfigs'>;

// ============================================================================
// Data Interfaces
// ============================================================================

export interface ConfigChange {
  value: any;
  changedBy: string;
  changedAt: number;
  reason?: string;
}

export interface ConfigMetadata {
  feature: string;
  featureKey: string;
  category?: string;
  section?: string;
  scope: ConfigScope;
}

export interface ConfigValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  allowedValues?: any[];
  customValidation?: string;
}

export interface ConfigOverride {
  value: any;
  source: ConfigOverrideSource;
  overriddenBy: string;
  overriddenAt: number;
  reason?: string;
}

// ============================================================================
// Create/Update Data Interfaces
// ============================================================================

export interface CreateAppConfigData {
  feature: string;
  featureKey: string;
  key: string;
  value: any;
  defaultValue: any;
  valueType: ConfigValueType;
  description?: string;
  category?: string;
  section?: string;
  scope: ConfigScope;
  isVisible?: boolean;
  isEditable?: boolean;
  validationRules?: ConfigValidationRules;
  metadata?: Record<string, any>;
}

export interface UpdateAppConfigData {
  value?: any;
  defaultValue?: any;
  description?: string;
  category?: string;
  section?: string;
  isVisible?: boolean;
  isEditable?: boolean;
  validationRules?: ConfigValidationRules;
  metadata?: Record<string, any>;
}

// ============================================================================
// Response Types
// ============================================================================

export interface AppConfigListResponse {
  items: AppConfig[];
  total: number;
  hasMore: boolean;
}

export interface AppConfigStatsResponse {
  totalConfigs: number;
  configsByCategory: Record<string, number>;
  configsByScope: Record<string, number>;
  configsByValueType: Record<string, number>;
  overriddenConfigs: number;
  editableConfigs: number;
}

// ============================================================================
// Filter Types
// ============================================================================

export interface AppConfigFilters {
  feature?: string;
  featureKey?: string;
  category?: string[];
  section?: string[];
  scope?: ConfigScope[];
  valueType?: ConfigValueType[];
  isVisible?: boolean;
  isEditable?: boolean;
  isOverridden?: boolean;
  searchQuery?: string;
}

// ============================================================================
// Re-export Schema Types
// ============================================================================

export type { ConfigValueType, ConfigScope, ConfigOverrideSource };
