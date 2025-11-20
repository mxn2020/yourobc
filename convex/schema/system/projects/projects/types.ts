// convex/schema/system/projects/projects/types.ts
// Type extractions from validators for projects module

import { Infer } from 'convex/values';
import { projectsValidators } from './validators';

// Extract types from validators
export type ProjectStatus = Infer<typeof projectsValidators.status>;
export type ProjectPriority = Infer<typeof projectsValidators.priority>;
export type ProjectVisibility = Infer<typeof projectsValidators.visibility>;
export type ProjectRiskLevel = Infer<typeof projectsValidators.riskLevel>;
