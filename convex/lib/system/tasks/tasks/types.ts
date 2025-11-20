// convex/lib/boilerplate/tasks/tasks/types.ts
// TypeScript type definitions for tasks module

import type { Doc, Id } from '@/generated/dataModel';
import type { TaskStatus, TaskPriority } from '@/schema/boilerplate/tasks/tasks/types';

// Entity types
export type Task = Doc<'projectTasks'>;
export type TaskId = Id<'projectTasks'>;

// Data interfaces
export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: Id<'projects'>;
  assignedTo?: Id<'userProfiles'>;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  estimatedHours?: number;
  order?: number;
  dependsOn?: TaskId[];
  blockedBy?: TaskId[];
  extendedMetadata?: {
    attachments?: string[];
    externalLinks?: string[];
    customFields?: Record<string, any>;
  };
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: Id<'userProfiles'>;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  estimatedHours?: number;
  actualHours?: number;
  order?: number;
  blockedBy?: TaskId[];
  dependsOn?: TaskId[];
  completedAt?: number;
  extendedMetadata?: {
    attachments?: string[];
    externalLinks?: string[];
    customFields?: Record<string, any>;
  };
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: Id<'projects'>;
  assignedTo?: Id<'userProfiles'>;
  createdBy?: Id<'userProfiles'>;
  tags?: string[];
  dueDateBefore?: number;
  dueDateAfter?: number;
  search?: string;
}

// Response types
export interface TaskListResponse {
  items: Task[];
  total: number;
  hasMore: boolean;
}

export interface TaskStats {
  total: number;
  byStatus: {
    todo: number;
    in_progress: number;
    in_review: number;
    completed: number;
    blocked: number;
    cancelled: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
    critical: number;
  };
  overdue: number;
}
