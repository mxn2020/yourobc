// convex/schema/yourobc/supporting/counters/types.ts
// Type definitions for counters module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { countersValidators } from './validators';
import { countersTable } from './tables';

// ============================================
// Document Types
// ============================================

export type Counter = Doc<'yourobcCounters'>;
export type CounterId = Id<'yourobcCounters'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type CounterSchema = Infer<typeof countersTable.validator>;

// ============================================
// Validator Types
// ============================================

export type CounterType = Infer<typeof countersValidators.counterType>;
