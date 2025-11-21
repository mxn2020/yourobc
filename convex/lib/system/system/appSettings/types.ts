// convex/lib/system/system/appSettings/types.ts
// TypeScript type definitions for appSettings module

import type { Doc, Id } from '@/generated/dataModel';

// Entity types
export type AppSetting = Doc<'appSettings'>;
export type AppSettingId = Id<'appSettings'>;

// Data interfaces
export interface CreateAppSettingData {
  name: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateAppSettingData {
  name?: string;
  value?: any;
  category?: string;
  description?: string;
  isPublic?: boolean;
}

// Response types
export interface AppSettingListResponse {
  items: AppSetting[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface AppSettingFilters {
  category?: string;
  isPublic?: boolean;
  search?: string;
}
