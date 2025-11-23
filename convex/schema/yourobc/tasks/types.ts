// convex/schema/yourobc/tasks/types.ts
// Type extractions from validators for tasks module

import { Infer } from 'convex/values';
import { tasksValidators, tasksFields } from './validators';

// Status and classification types
export type TaskStatus = Infer<typeof tasksValidators.status>;
export type TaskPriority = Infer<typeof tasksValidators.priority>;
export type TaskType = Infer<typeof tasksValidators.taskType>;

// Field types
export type TaskChecklistItem = Infer<typeof tasksFields.checklistItem>;
