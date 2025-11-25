// convex/schema/software/freelancer_dashboard/projects/tasks/validators.ts
// Task-specific validators

import { v } from 'convex/values';
import { sharedProjectValidators } from '../_shared/validators';

/**
 * Validators specific to tasks (child of projects)
 */
export const tasksValidators = {
  // Reuse shared validators
  status: sharedProjectValidators.status,
  priority: sharedProjectValidators.priority,

  /**
   * Task-specific: completion percentage
   */
  progressStatus: v.union(
    v.literal('not_started'),
    v.literal('in_progress'),
    v.literal('blocked'),
    v.literal('done')
  ),
} as const;
