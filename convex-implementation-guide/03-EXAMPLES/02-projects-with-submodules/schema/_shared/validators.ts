// convex/schema/software/freelancer_dashboard/projects/_shared/validators.ts
// Shared validators across projects, tasks, and milestones

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Shared validators used by parent and child modules
 * This prevents duplication when multiple entities share common fields
 */
export const sharedProjectValidators = {
  /**
   * Status shared across all project-related entities
   */
  status: v.union(
    v.literal('planning'),
    v.literal('active'),
    v.literal('on_hold'),
    v.literal('completed'),
    v.literal('cancelled')
  ),

  /**
   * Priority shared across projects, tasks, milestones
   */
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),

  /**
   * Visibility for projects (not used by tasks/milestones)
   */
  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  // Reuse currency from base
  currency: baseValidators.currency,
} as const;

/**
 * Shared complex fields
 */
export const sharedProjectFields = {
  /**
   * Budget structure used by projects and potentially milestones
   */
  budget: v.object({
    amount: v.number(),
    currency: baseValidators.currency,
  }),

  /**
   * Time estimate (in hours) used by tasks and milestones
   */
  timeEstimate: v.object({
    estimated: v.number(),
    actual: v.optional(v.number()),
  }),
} as const;
