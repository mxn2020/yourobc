// src/features/boilerplate/projects/hooks/useTasks.ts

import { useCallback, useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { tasksService, type TasksListOptions } from '../services/TasksService';
import { parseConvexError } from '@/utils/errorHandling';
import type { Id } from '@/convex/_generated/dataModel';

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  projectId?: Id<"projects">;
  assignedTo?: Id<"userProfiles">;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  estimatedHours?: number;
  order?: number;
  dependsOn?: Id<"projectTasks">[];
  metadata?: any;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  assignedTo?: Id<"userProfiles">;
  tags?: string[];
  startDate?: number;
  dueDate?: number;
  estimatedHours?: number;
  actualHours?: number;
  order?: number;
  blockedBy?: Id<"projectTasks">[];
  dependsOn?: Id<"projectTasks">[];
  metadata?: any;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed' | 'cancelled';

// ==========================================
// STANDARD HOOKS
// ==========================================

export function useTasksCore(options?: TasksListOptions) {
  return tasksService.useTasks(options);
}

export function useTask(taskId?: Id<"projectTasks">) {
  return tasksService.useTask(taskId);
}

export function useUserTasks(targetUserId?: Id<"userProfiles">) {
  return tasksService.useUserTasks(targetUserId);
}

export function useTaskStats(projectId?: Id<"projects">) {
  return tasksService.useTaskStats(projectId);
}

export function useProjectTasks(projectId?: Id<"projects">) {
  const result = tasksService.useProjectTasks(projectId);

  // Unwrap the response: { tasks, total } → tasks array
  return {
    ...result,
    data: result.data?.tasks || [],
  };
}

/**
 * Main tasks hook with mutations
 */
export function useTasks(options?: TasksListOptions) {
  // Core data queries
  const { data, isPending, error, refetch } = useTasksCore(options);

  // Stats query
  const { data: stats, isPending: isStatsLoading } = tasksService.useTaskStats();

  // Mutations
  const createTaskMutation = tasksService.useCreateTask();
  const updateTaskMutation = tasksService.useUpdateTask();
  const deleteTaskMutation = tasksService.useDeleteTask();
  const updateTaskStatusMutation = tasksService.useUpdateTaskStatus();

  // Parse error
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null;
  }, [error]);

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED';

  // Enhanced action functions
  const createTask = useCallback(
    async (taskData: CreateTaskData) => {
      return await createTaskMutation.mutateAsync({
        data: taskData,
      });
    },
    [createTaskMutation]
  );

  const updateTask = useCallback(
    async (taskId: Id<"projectTasks">, updates: UpdateTaskData) => {
      return await updateTaskMutation.mutateAsync({
        taskId,
        updates, // ✅ Fixed: was 'data', should be 'updates'
      });
    },
    [updateTaskMutation]
  );

  const deleteTask = useCallback(
    async (taskId: Id<"projectTasks">) => {
      return await deleteTaskMutation.mutateAsync({
        taskId,
      });
    },
    [deleteTaskMutation]
  );

  const updateTaskStatus = useCallback(
    async (taskId: Id<"projectTasks">, status: TaskStatus) => {
      return await updateTaskStatusMutation.mutateAsync({
        taskId,
        status,
      });
    },
    [updateTaskStatusMutation]
  );

  return {
    // Data
    tasks: data?.tasks || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    stats,

    // Loading states
    isLoading: isPending,
    isStatsLoading,

    // Errors
    error: parsedError,
    rawError: error,
    isPermissionError,

    // Actions
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    refetch,

    // Mutation states
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isUpdatingStatus: updateTaskStatusMutation.isPending,

    // Raw mutations
    mutations: {
      createTask: createTaskMutation,
      updateTask: updateTaskMutation,
      deleteTask: deleteTaskMutation,
      updateTaskStatus: updateTaskStatusMutation,
    },
  };
}

// ==========================================
// SUSPENSE HOOKS
// ==========================================

export function useTasksSuspense(options?: TasksListOptions) {
  return useSuspenseQuery(tasksService.getTasksQueryOptions(options));
}

export function useTaskSuspense(taskId: Id<"projectTasks">) {
  return useSuspenseQuery(tasksService.getTaskQueryOptions(taskId));
}

export function useProjectTasksSuspense(projectId: Id<"projects">) {
  return useSuspenseQuery(tasksService.getProjectTasksQueryOptions(projectId));
}