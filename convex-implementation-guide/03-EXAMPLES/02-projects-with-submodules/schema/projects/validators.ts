// convex/schema/software/freelancer_dashboard/projects/projects/validators.ts
// Project-specific validators (extends shared validators)

import { v } from 'convex/values';
import { sharedProjectValidators } from '../_shared/validators';

/**
 * Validators specific to projects table
 * Supplements the shared validators
 */
export const projectsValidators = {
  // Reuse shared validators
  ...sharedProjectValidators,

  /**
   * Project type (specific to projects only)
   */
  projectType: v.union(
    v.literal('client'),
    v.literal('internal'),
    v.literal('research')
  ),
} as const;
