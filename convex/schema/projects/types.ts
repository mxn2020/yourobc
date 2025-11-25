// convex/schema/projects/types.ts
// Type extractions from validators for projects module

import { Infer } from 'convex/values';
import {
  projectsValidators,
  projectsFields,
  projectMembersValidators,
  projectMembersFields,
  projectTasksValidators,
  projectTasksFields,
} from './validators';

// Projects types from validators
export type ProjectStatus = Infer<typeof projectsValidators.status>;
export type ProjectPriority = Infer<typeof projectsValidators.priority>;
export type ProjectVisibility = Infer<typeof projectsValidators.visibility>;
export type ProjectRiskLevel = Infer<typeof projectsValidators.riskLevel>;

// Projects types from fields
export type ProjectProgress = Infer<typeof projectsFields.progress>;
export type ProjectSettings = Infer<typeof projectsFields.settings>;
export type ProjectExtendedMetadata = Infer<typeof projectsFields.extendedMetadata>;

// Project members types from validators
export type ProjectMemberRole = Infer<typeof projectMembersValidators.role>;
export type ProjectMemberStatus = Infer<typeof projectMembersValidators.status>;

// Project members types from fields
export type ProjectMemberSettings = Infer<typeof projectMembersFields.settings>;

// Project tasks types from validators
export type ProjectTaskStatus = Infer<typeof projectTasksValidators.status>;
export type ProjectTaskPriority = Infer<typeof projectTasksValidators.priority>;

// Project tasks types from fields
export type ProjectTaskMetadata = Infer<typeof projectTasksFields.metadata>;
