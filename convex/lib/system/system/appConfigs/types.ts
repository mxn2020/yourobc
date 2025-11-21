// convex/lib/system/system/appConfigs/types.ts
// TypeScript type definitions for appConfigs module

import type { Doc, Id } from '@/generated/dataModel';
import type { ConfigValueType, ConfigScope, ConfigOverrideSource } from '@/schema/system/system/appConfigs/types';

// Entity types
export type AppConfig = Doc<'appConfigs'>;
export type AppConfigId = Id<'appConfigs'>;

// Data interfaces
export interface CreateAppConfigData {
  name: string;
  feature: string;
  key: string;
  value: any;
  valueType: ConfigValueType;
  category: string;
  section?: string;
  description?: string;
  scope?: ConfigScope;
  tenantId?: string;
  userId?: Id<'userProfiles'>;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    required?: boolean;
  };
  defaultValue: any;
  isOverridden?: boolean;
  overrideSource?: ConfigOverrideSource;
  displayOrder?: number;
  isVisible?: boolean;
  isEditable?: boolean;
  requiresRestart?: boolean;
}

export interface UpdateAppConfigData {
  name?: string;
  value?: any;
  valueType?: ConfigValueType;
  category?: string;
  section?: string;
  description?: string;
  scope?: ConfigScope;
  isVisible?: boolean;
  isEditable?: boolean;
  requiresRestart?: boolean;
  displayOrder?: number;
}

// Response types
export interface AppConfigWithHistory extends AppConfig {
  historyCount?: number;
}

export interface AppConfigListResponse {
  items: AppConfig[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface AppConfigFilters {
  feature?: string;
  category?: string;
  scope?: ConfigScope[];
  isVisible?: boolean;
  isEditable?: boolean;
  search?: string;
}
