// convex/schema/software/freelancer_dashboard/projects/index.ts
// Combined schema exports for sibling modules

export * from './projects';
export * from './project_calendar';

// Combined schemas for registration
import { softwareFreelancerDashboardProjectsSchemas } from './projects/schemas';
import { softwareFreelancerDashboardProjectCalendarSchemas } from './project_calendar/schemas';

/**
 * All schemas for sibling modules
 * Each module is independent but can reference each other optionally
 */
export const softwareFreelancerDashboardProjectsSiblingsSchemas = {
  ...softwareFreelancerDashboardProjectsSchemas,
  ...softwareFreelancerDashboardProjectCalendarSchemas,
};
