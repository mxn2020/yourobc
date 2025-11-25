// convex/lib/software/freelancer_dashboard/projects/_shared/types.ts
// Shared types across all sub-modules

import type { Doc, Id } from '@/generated/dataModel';

/**
 * Shared response format for all modules
 */
export interface PaginatedResponse<T> {
  items: T[];
  returnedCount: number;
  hasMore: boolean;
  cursor?: string;
}

/**
 * Common filter options
 */
export interface CommonFilters {
  status?: string[];
  priority?: string[];
  search?: string;
}

/**
 * Time tracking shared type
 */
export interface TimeTracking {
  estimated: number;
  actual?: number;
}
