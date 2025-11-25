// convex/lib/software/freelancer_dashboard/projects/index.ts
// Combined exports for sibling modules

// Sibling module 1 (projects)
export * from './projects';

// Sibling module 2 (project_calendar)
export * from './project_calendar';

/**
 * Sibling modules export pattern.
 * Each module is independent and can be imported separately.
 *
 * Usage:
 * import { createProject } from '@/lib/.../projects';
 * import { createCalendarEvent } from '@/lib/.../project_calendar';
 *
 * Or import both:
 * import { createProject, createCalendarEvent } from '@/lib/.../projects';
 */
