// convex/schema/software/freelancer_dashboard/projects/projects/types.ts

import { Infer } from 'convex/values';
import { projectsValidators } from './validators';

export type ProjectStatus = Infer<typeof projectsValidators.status>;
export type ProjectPriority = Infer<typeof projectsValidators.priority>;
export type ProjectVisibility = Infer<typeof projectsValidators.visibility>;
export type ProjectType = Infer<typeof projectsValidators.projectType>;
