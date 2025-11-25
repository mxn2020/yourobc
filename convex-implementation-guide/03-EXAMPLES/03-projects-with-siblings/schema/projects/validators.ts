// convex/schema/software/freelancer_dashboard/projects/projects/validators.ts
// Projects sibling module validators

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Validators for projects sibling module
 * Independent from project_calendar module
 */
export const projectsValidators = {
  status: v.union(
    v.literal('planning'),
    v.literal('active'),
    v.literal('on_hold'),
    v.literal('completed'),
    v.literal('cancelled')
  ),

  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),

  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  memberRole: v.union(
    v.literal('owner'),
    v.literal('admin'),
    v.literal('member'),
    v.literal('viewer')
  ),

  memberStatus: v.union(
    v.literal('active'),
    v.literal('invited'),
    v.literal('inactive')
  ),

  currency: baseValidators.currency,
} as const;

export const projectsFields = {
  budget: v.object({
    amount: v.number(),
    currency: baseValidators.currency,
  }),
} as const;
