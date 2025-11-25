// convex/schema/yourobc/supporting/counters/validators.ts
import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

export const countersValidators = {
  counterType: v.union(
    v.literal('invoice'),
    v.literal('quote'),
    v.literal('order'),
    v.literal('customer'),
    v.literal('product'),
    v.literal('general')
  ),
} as const;
