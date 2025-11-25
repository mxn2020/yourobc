// convex/schema/software/freelancer_dashboard/projects/milestones/types.ts

import { Infer } from 'convex/values';
import { milestonesValidators } from './validators';

export type MilestoneStatus = Infer<typeof milestonesValidators.status>;
export type MilestonePriority = Infer<typeof milestonesValidators.priority>;
export type MilestoneType = Infer<typeof milestonesValidators.milestoneType>;
