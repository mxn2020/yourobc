// convex/lib/yourobc/supporting/counters/types.ts
// TypeScript type definitions for counters module

import type { Doc, Id } from '@/generated/dataModel';
import type { CounterType } from '@/schema/yourobc/supporting/counters/types';

// Entity types
export type Counter = Doc<'yourobcCounters'>;
export type CounterId = Id<'yourobcCounters'>;

// Create operation
export interface CreateCounterData {
  type: CounterType;
  prefix: string;
  year: number;
  lastNumber?: number;
}

// Update operation
export interface UpdateCounterData {
  lastNumber?: number;
  year?: number;
}

// List response
export interface CounterListResponse {
  items: Counter[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

// Filter options
export interface CounterFilters {
  type?: CounterType;
  year?: number;
}
