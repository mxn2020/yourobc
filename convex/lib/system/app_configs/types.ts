// convex/lib/system/app_configs/types.ts
// Type definitions for appConfigs module

import type { Doc } from '@/generated/dataModel';

export type AppConfig = Doc<'appConfigs'>;

export type ConfigChange = {
  value: any;
  changedBy: string;
  changedAt: number;
  reason?: string;
};
