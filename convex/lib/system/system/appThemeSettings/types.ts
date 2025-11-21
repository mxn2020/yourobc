// convex/lib/system/system/appThemeSettings/types.ts
// TypeScript type definitions for appThemeSettings module

import type { Doc, Id } from '@/generated/dataModel';

export type AppThemeSetting = Doc<'appThemeSettings'>;
export type AppThemeSettingId = Id<'appThemeSettings'>;

export interface CreateAppThemeSettingData {
  name: string;
  [key: string]: any;
}

export interface UpdateAppThemeSettingData {
  name?: string;
  [key: string]: any;
}

export interface AppThemeSettingListResponse {
  items: AppThemeSetting[];
  total: number;
  hasMore: boolean;
}
