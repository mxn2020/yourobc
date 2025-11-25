// convex/lib/projects/tasks/types.ts

import type { Doc, Id } from '@/generated/dataModel';
import type {
  ProjectTaskMetadata,
  ProjectTaskPriority,
  ProjectTaskStatus,
} from '@/schema/projects/types';

export type Task = Doc<'projectTasks'>;
export type TaskId = Id<'projectTasks'>;

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: ProjectTaskPriority;
  projectId: Id<'projects'>;
  assignedTo?: Id<'userProfiles'>;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  estimatedHours?: number;
  actualHours?: number;
  order?: number;
  blockedBy?: Id<'projectTasks'>[];
  dependsOn?: Id<'projectTasks'>[];
  metadata?: ProjectTaskMetadata;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: ProjectTaskStatus;
  priority?: ProjectTaskPriority;
  assignedTo?: Id<'userProfiles'>;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  estimatedHours?: number;
  actualHours?: number;
  order?: number;
  blockedBy?: Id<'projectTasks'>[];
  dependsOn?: Id<'projectTasks'>[];
  metadata?: ProjectTaskMetadata;
}

export interface TaskFilters {
  status?: ProjectTaskStatus[];
  priority?: ProjectTaskPriority[];
  projectId?: Id<'projects'>;
  assignedTo?: Id<'userProfiles'>;
  createdBy?: Id<'userProfiles'>;
  search?: string;
}

export interface TasksListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'order';
  sortOrder?: 'asc' | 'desc';
  filters?: TaskFilters;
}

export interface TaskStats {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  completedTasks: number;
  blockedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  unassignedTasks: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  hasMore: boolean;
}
