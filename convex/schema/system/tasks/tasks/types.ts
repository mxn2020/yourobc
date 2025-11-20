// convex/schema/boilerplate/tasks/tasks/types.ts
// Type extractions from validators for tasks module

import { Infer } from 'convex/values';
import { tasksValidators } from './validators';

// Extract types from validators
export type TaskStatus = Infer<typeof tasksValidators.status>;
export type TaskPriority = Infer<typeof tasksValidators.priority>;
