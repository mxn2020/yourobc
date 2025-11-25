// convex/lib/system/appSettings/types.ts
import type { Doc, Id } from '@/generated/dataModel';

export type AppSetting = Doc<'appSettings'>;
export type AppSettingId = Id<'appSettings'>;

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
  description?: string;
  isPublic?: boolean;
}
