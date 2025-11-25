// convex/schema/software/freelancer_dashboard/projects/validators.ts
// Shared validators for projects and project_members tables

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Validators for projects module
 * Shared between projects and project_members tables
 */
export const projectsValidators = {
  /**
   * Project lifecycle status
   */
  status: v.union(
    v.literal('planning'),
    v.literal('active'),
    v.literal('on_hold'),
    v.literal('completed'),
    v.literal('cancelled')
  ),

  /**
   * Priority level
   */
  priority: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('urgent')
  ),

  /**
   * Project visibility
   */
  visibility: v.union(
    v.literal('private'),
    v.literal('team'),
    v.literal('public')
  ),

  /**
   * Member role in project
   */
  memberRole: v.union(
    v.literal('owner'),
    v.literal('admin'),
    v.literal('member'),
    v.literal('viewer')
  ),

  /**
   * Member status
   */
  memberStatus: v.union(
    v.literal('active'),
    v.literal('invited'),
    v.literal('inactive')
  ),

  // Reuse currency from base
  currency: baseValidators.currency,
} as const;

/**
 * Complex fields for projects
 */
export const projectsFields = {
  /**
   * Budget with amount and currency
   */
  budget: v.object({
    amount: v.number(),
    currency: baseValidators.currency,
  }),

  /**
   * Project settings
   */
  settings: v.object({
    allowComments: v.boolean(),
    emailNotifications: v.boolean(),
    autoArchive: v.boolean(),
  }),
} as const;
