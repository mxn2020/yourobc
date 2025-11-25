// convex/schema/software/freelancer_dashboard/projects/milestones/validators.ts
// Milestone-specific validators

import { v } from 'convex/values';
import { sharedProjectValidators } from '../_shared/validators';

/**
 * Validators specific to milestones (child of projects)
 */
export const milestonesValidators = {
  // Reuse shared validators
  status: sharedProjectValidators.status,
  priority: sharedProjectValidators.priority,

  /**
   * Milestone type
   */
  milestoneType: v.union(
    v.literal('delivery'),
    v.literal('payment'),
    v.literal('review'),
    v.literal('checkpoint')
  ),
} as const;
