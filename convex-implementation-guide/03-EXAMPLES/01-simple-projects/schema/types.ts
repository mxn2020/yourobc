// convex/schema/software/freelancer_dashboard/projects/types.ts
// Type extractions for projects module

import { Infer } from 'convex/values';
import { projectsValidators, projectsFields } from './validators';

// Project types
export type ProjectStatus = Infer<typeof projectsValidators.status>;
export type ProjectPriority = Infer<typeof projectsValidators.priority>;
export type ProjectVisibility = Infer<typeof projectsValidators.visibility>;
export type ProjectBudget = Infer<typeof projectsFields.budget>;
export type ProjectSettings = Infer<typeof projectsFields.settings>;

// Member types
export type MemberRole = Infer<typeof projectsValidators.memberRole>;
export type MemberStatus = Infer<typeof projectsValidators.memberStatus>;
