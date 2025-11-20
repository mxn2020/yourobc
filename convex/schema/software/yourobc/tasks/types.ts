// convex/schema/software/yourobc/tasks/types.ts
// Type extractions from validators for tasks module

import { Infer } from 'convex/values';
import { tasksValidators } from './validators';

// Extract types from validators
export type TasksStatus = Infer<typeof tasksValidators.status>;
export type TasksPriority = Infer<typeof tasksValidators.priority>;
export type TasksType = Infer<typeof tasksValidators.taskType>;
