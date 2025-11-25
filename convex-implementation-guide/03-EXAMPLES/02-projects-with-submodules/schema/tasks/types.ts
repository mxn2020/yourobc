// convex/schema/software/freelancer_dashboard/projects/tasks/types.ts

import { Infer } from 'convex/values';
import { tasksValidators } from './validators';

export type TaskStatus = Infer<typeof tasksValidators.status>;
export type TaskPriority = Infer<typeof tasksValidators.priority>;
export type TaskProgressStatus = Infer<typeof tasksValidators.progressStatus>;
