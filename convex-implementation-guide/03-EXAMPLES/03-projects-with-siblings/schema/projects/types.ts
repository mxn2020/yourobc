// convex/schema/software/freelancer_dashboard/projects/projects/types.ts

import { Infer } from 'convex/values';
import { projectsValidators, projectsFields } from './validators';

export type ProjectStatus = Infer<typeof projectsValidators.status>;
export type ProjectPriority = Infer<typeof projectsValidators.priority>;
export type ProjectVisibility = Infer<typeof projectsValidators.visibility>;
export type ProjectBudget = Infer<typeof projectsFields.budget>;
export type MemberRole = Infer<typeof projectsValidators.memberRole>;
export type MemberStatus = Infer<typeof projectsValidators.memberStatus>;
