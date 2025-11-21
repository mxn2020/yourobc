// convex/lib/system/system/systemMetrics/types.ts
// TypeScript type definitions for systemMetrics module

import type { Doc, Id } from '@/generated/dataModel';

export type SystemMetric = Doc<'systemMetrics'>;
export type SystemMetricId = Id<'systemMetrics'>;

export interface CreateSystemMetricData {
  metricType: string;
  [key: string]: any;
}

export interface UpdateSystemMetricData {
  metricType?: string;
  [key: string]: any;
}

export interface SystemMetricListResponse {
  items: SystemMetric[];
  total: number;
  hasMore: boolean;
}
