// convex/lib/system/appConfigs/types.ts
// Type definitions for appConfigs module

import type { Doc, Id } from '@/generated/dataModel';
import type { AppConfigScope, AppConfigValueType } from '@/schema/system/app/app_configs/types';

export type AppConfig = Doc<'appConfigs'>;
export type AppConfigId = Id<'appConfigs'>;

export interface CreateAppConfigData {
  name: string;
  feature: string;
  featureKey: string;
  key: string;
  value: string | number | boolean | null | (string | number | boolean)[] | Record<string, any>;
  valueType: AppConfigValueType;
  category?: string;
  scope: AppConfigScope;
  defaultValue?: string | number | boolean | null;
}

export interface UpdateAppConfigData {
  name?: string;
  value?: string | number | boolean | null | (string | number | boolean)[] | Record<string, any>;
  description?: string;
  isVisible?: boolean;
  isEditable?: boolean;
}
