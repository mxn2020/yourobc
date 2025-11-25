// convex/lib/software/freelancer_dashboard/projects/index.ts
// Combined exports for projects with sub-modules

// Shared types
export * from './_shared/types';

// Parent module (projects)
export * from './projects';

// Child modules
export * from './tasks';
export * from './milestones';

/**
 * This pattern exports all parent and child modules together.
 * Clients can import specific modules or get everything at once.
 *
 * Usage:
 * import { createProject, createTask } from '@/lib/.../projects';
 * import { getProject, getProjectTasks } from '@/lib/.../projects';
 */
