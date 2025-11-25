// convex/schema/software/freelancer_dashboard/projects/index.ts
// Combined schema exports for projects with sub-modules

export * from './_shared/validators';
export * from './_shared/fields';
export * from './projects';
export * from './tasks';
export * from './milestones';

// Combined schemas for registration
import { softwareFreelancerDashboardProjectsSchemas } from './projects/schemas';
import { softwareFreelancerDashboardTasksSchemas } from './tasks/schemas';
import { softwareFreelancerDashboardMilestonesSchemas } from './milestones/schemas';

/**
 * All schemas for projects module (parent + children)
 * Register all three tables in main schema.ts
 */
export const softwareFreelancerDashboardProjectsModuleSchemas = {
  ...softwareFreelancerDashboardProjectsSchemas,
  ...softwareFreelancerDashboardTasksSchemas,
  ...softwareFreelancerDashboardMilestonesSchemas,
};
