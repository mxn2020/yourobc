// convex/schema/yourobc/supporting/counters/validators.ts
import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

export const countersValidators = {
  counterType: baseValidators.counterType,
} as const;
