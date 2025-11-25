// src/features/projects/hooks/useMilestones.ts

import { useCallback, useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { milestonesService, type MilestonesListOptions } from '../services/MilestonesService';
import { parseConvexError } from '@/utils/errorHandling';
import type { Id } from '@/convex/_generated/dataModel';

export interface CreateMilestoneData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  projectId: Id<"projects">;
  startDate: number;
  dueDate: number;
  assignedTo?: Id<"userProfiles">;
  order?: number;
  color?: string;
  dependencies?: Id<"projectMilestones">[];
  deliverables?: Array<{
    title: string;
    completed: boolean;
    completedAt?: number;
  }>;
  metadata?: any;
}

export interface UpdateMilestoneData {
  title?: string;
  description?: string;
  status?: 'upcoming' | 'in_progress' | 'delayed' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  startDate?: number;
  dueDate?: number;
  progress?: number;
  assignedTo?: Id<"userProfiles">;
  order?: number;
  color?: string;
  dependencies?: Id<"projectMilestones">[];
  deliverables?: Array<{
    title: string;
    completed: boolean;
    completedAt?: number;
  }>;
  tasksTotal?: number;
  tasksCompleted?: number;
  metadata?: any;
}

export type MilestoneStatus = 'upcoming' | 'in_progress' | 'delayed' | 'completed' | 'cancelled';

// ==========================================
// STANDARD HOOKS
// ==========================================

export function useMilestonesCore(options?: MilestonesListOptions) {
  return milestonesService.useMilestones(options);
}

export function useMilestone(milestoneId?: Id<"projectMilestones">) {
  return milestonesService.useMilestone(milestoneId);
}

export function useProjectMilestones(projectId?: Id<"projects">) {
  const result = milestonesService.useProjectMilestones(projectId);

  // Unwrap the response: { milestones, total } → milestones array
  return {
    ...result,
    data: result.data?.milestones || [],
  };
}

export function useMilestoneStats(projectId?: Id<"projects">) {
  return milestonesService.useMilestoneStats(projectId);
}

export function useUpcomingMilestones(limit?: number) {
  return milestonesService.useUpcomingMilestones(limit);
}

/**
 * Main milestones hook with mutations
 */
export function useMilestones(options?: MilestonesListOptions) {
  // Core data queries
  const { data, isPending, error, refetch } = useMilestonesCore(options);

  // Stats query
  const { data: stats, isPending: isStatsLoading } = milestonesService.useMilestoneStats();

  // Mutations
  const createMilestoneMutation = milestonesService.useCreateMilestone();
  const updateMilestoneMutation = milestonesService.useUpdateMilestone();
  const deleteMilestoneMutation = milestonesService.useDeleteMilestone();
  const updateMilestoneProgressMutation = milestonesService.useUpdateMilestoneProgress();
  const updateMilestoneStatusMutation = milestonesService.useUpdateMilestoneStatus();

  // Parse error
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null;
  }, [error]);

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED';

  // Enhanced action functions
  const createMilestone = useCallback(
    async (milestoneData: CreateMilestoneData) => {
      return await createMilestoneMutation.mutateAsync({
        data: milestoneData,
      });
    },
    [createMilestoneMutation]
  );

  const updateMilestone = useCallback(
    async (milestoneId: Id<"projectMilestones">, updates: UpdateMilestoneData) => {
      return await updateMilestoneMutation.mutateAsync({
        milestoneId,
        updates, // ✅ Fixed: was 'data', should be 'updates'
      });
    },
    [updateMilestoneMutation]
  );

  const deleteMilestone = useCallback(
    async (milestoneId: Id<"projectMilestones">) => {
      return await deleteMilestoneMutation.mutateAsync({
        milestoneId,
      });
    },
    [deleteMilestoneMutation]
  );

  const updateMilestoneProgress = useCallback(
    async (milestoneId: Id<"projectMilestones">, progress: number) => {
      return await updateMilestoneProgressMutation.mutateAsync({
        milestoneId,
        progress,
      });
    },
    [updateMilestoneProgressMutation]
  );

  const updateMilestoneStatus = useCallback(
    async (milestoneId: Id<"projectMilestones">, status: MilestoneStatus) => {
      return await updateMilestoneStatusMutation.mutateAsync({
        milestoneId,
        status,
      });
    },
    [updateMilestoneStatusMutation]
  );

  return {
    // Data
    milestones: data?.milestones || [],
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
    createMilestone,
    updateMilestone,
    deleteMilestone,
    updateMilestoneProgress,
    updateMilestoneStatus,
    refetch,

    // Mutation states
    isCreating: createMilestoneMutation.isPending,
    isUpdating: updateMilestoneMutation.isPending,
    isDeleting: deleteMilestoneMutation.isPending,
    isUpdatingProgress: updateMilestoneProgressMutation.isPending,
    isUpdatingStatus: updateMilestoneStatusMutation.isPending,

    // Raw mutations
    mutations: {
      createMilestone: createMilestoneMutation,
      updateMilestone: updateMilestoneMutation,
      deleteMilestone: deleteMilestoneMutation,
      updateMilestoneProgress: updateMilestoneProgressMutation,
      updateMilestoneStatus: updateMilestoneStatusMutation,
    },
  };
}

// ==========================================
// SUSPENSE HOOKS
// ==========================================

export function useMilestonesSuspense(options?: MilestonesListOptions) {
  return useSuspenseQuery(milestonesService.getMilestonesQueryOptions(options));
}

export function useMilestoneSuspense(milestoneId: Id<"projectMilestones">) {
  return useSuspenseQuery(milestonesService.getMilestoneQueryOptions(milestoneId));
}

export function useProjectMilestonesSuspense(projectId: Id<"projects">) {
  return useSuspenseQuery(milestonesService.getProjectMilestonesQueryOptions(projectId));
}