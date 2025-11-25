// convex/lib/system/supporting/counters/types.ts
// Types for system counters module

import type { Doc, Id } from '@/generated/dataModel';
import type { CounterType } from '@/schema/system/supporting/counters/types';

export type SystemCounter = Doc<'counters'>;
export type SystemCounterId = Id<'counters'>;

export interface CreateSystemCounterData {
  name: string;
  type: CounterType;
  prefix?: string;
  suffix?: string;
  currentValue: number;
  step?: number;
  minValue?: number;
  maxValue?: number;
  padLength?: number;
  format?: string;
}

export interface UpdateSystemCounterData {
  name?: string;
  currentValue?: number;
  step?: number;
  minValue?: number;
  maxValue?: number;
  padLength?: number;
  format?: string;
}

export interface SystemCounterListResponse {
  items: SystemCounter[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}
