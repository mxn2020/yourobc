// src/features/projects/services/TasksService.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export interface TasksListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'order';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    status?: string[];
    priority?: string[];
    projectId?: Id<"projects">;
    assignedTo?: Id<"userProfiles">;
    createdBy?: Id<"userProfiles">;
    search?: string;
  };
}

export class TasksService {
  // ==========================================
  // QUERY OPTION FACTORIES
  // ==========================================

  getTasksQueryOptions(options?: TasksListOptions) {
    return convexQuery(api.lib.projects.tasks.queries.getTasks, {
      options,
    });
  }

  getTaskQueryOptions(taskId: Id<"projectTasks">) {
    return convexQuery(api.lib.projects.tasks.queries.getTask, {
      taskId,
    });
  }

  getUserTasksQueryOptions(targetUserId?: Id<"userProfiles">) {
    return convexQuery(api.lib.projects.tasks.queries.getUserTasks, {
      targetUserId,
    });
  }

  getTaskStatsQueryOptions(projectId?: Id<"projects">) {
    return convexQuery(api.lib.projects.tasks.queries.getTaskStats, {
      projectId,
    });
  }

  getProjectTasksQueryOptions(projectId: Id<"projects">) {
    return convexQuery(api.lib.projects.tasks.queries.getProjectTasks, {
      projectId,
    });
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  useTasks(options?: TasksListOptions) {
    return useQuery({
      ...this.getTasksQueryOptions(options),
      staleTime: 30000,
    });
  }

  useTask(taskId?: Id<"projectTasks">) {
    return useQuery({
      ...this.getTaskQueryOptions(taskId!),
      staleTime: 30000,
      enabled: !!taskId,
    });
  }

  useUserTasks(targetUserId?: Id<"userProfiles">) {
    return useQuery({
      ...this.getUserTasksQueryOptions(targetUserId),
      staleTime: 30000,
    });
  }

  useTaskStats(projectId?: Id<"projects">) {
    return useQuery({
      ...this.getTaskStatsQueryOptions(projectId),
      staleTime: 60000, // 1 minute for stats
    });
  }

  useProjectTasks(projectId?: Id<"projects">) {
    return useQuery({
      ...this.getProjectTasksQueryOptions(projectId!),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  useCreateTask() {
    const mutationFn = useConvexMutation(api.lib.projects.tasks.mutations.createTask);
    return useMutation({ mutationFn });
  }

  useUpdateTask() {
    const mutationFn = useConvexMutation(api.lib.projects.tasks.mutations.updateTask);
    return useMutation({ mutationFn });
  }

  useDeleteTask() {
    const mutationFn = useConvexMutation(api.lib.projects.tasks.mutations.deleteTask);
    return useMutation({ mutationFn });
  }

  useUpdateTaskStatus() {
    const mutationFn = useConvexMutation(api.lib.projects.tasks.mutations.updateTaskStatus);
    return useMutation({ mutationFn });
  }

  useUpdateTaskOrder() {
    const mutationFn = useConvexMutation(api.lib.projects.tasks.mutations.updateTaskOrder);
    return useMutation({ mutationFn });
  }
}

export const tasksService = new TasksService();