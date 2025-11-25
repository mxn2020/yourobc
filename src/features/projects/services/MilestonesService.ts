// src/features/projects/services/MilestonesService.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export interface MilestonesListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'startDate' | 'priority' | 'order';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    status?: string[];
    priority?: string[];
    projectId?: Id<"projects">;
    assignedTo?: Id<"userProfiles">;
    createdBy?: string;
    search?: string;
  };
}

export class MilestonesService {
  // ==========================================
  // QUERY OPTION FACTORIES
  // ==========================================

  getMilestonesQueryOptions(options?: MilestonesListOptions) {
    return convexQuery(api.lib.projects.milestones.queries.getMilestones, {
      options,
    });
  }

  getMilestoneQueryOptions(milestoneId: Id<"projectMilestones">) {
    return convexQuery(api.lib.projects.milestones.queries.getMilestone, {
      milestoneId,
    });
  }

  getProjectMilestonesQueryOptions(projectId: Id<"projects">) {
    return convexQuery(api.lib.projects.milestones.queries.getProjectMilestones, {
      projectId,
    });
  }

  getMilestoneStatsQueryOptions(projectId?: Id<"projects">) {
    return convexQuery(api.lib.projects.milestones.queries.getMilestoneStats, {
      projectId,
    });
  }

  getUpcomingMilestonesQueryOptions(limit?: number) {
    return convexQuery(api.lib.projects.milestones.queries.getUpcomingMilestones, {
      limit,
    });
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  useMilestones(options?: MilestonesListOptions) {
    return useQuery({
      ...this.getMilestonesQueryOptions(options),
      staleTime: 30000,
    });
  }

  useMilestone(milestoneId?: Id<"projectMilestones">) {
    return useQuery({
      ...this.getMilestoneQueryOptions(milestoneId!),
      staleTime: 30000,
      enabled: !!milestoneId,
    });
  }

  useProjectMilestones(projectId?: Id<"projects">) {
    return useQuery({
      ...this.getProjectMilestonesQueryOptions(projectId!),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  useMilestoneStats(projectId?: Id<"projects">) {
    return useQuery({
      ...this.getMilestoneStatsQueryOptions(projectId),
      staleTime: 60000, // 1 minute for stats
    });
  }

  useUpcomingMilestones(limit?: number) {
    return useQuery({
      ...this.getUpcomingMilestonesQueryOptions(limit),
      staleTime: 300000, // 5 minutes
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  useCreateMilestone() {
    const mutationFn = useConvexMutation(api.lib.projects.milestones.mutations.createMilestone);
    return useMutation({ mutationFn });
  }

  useUpdateMilestone() {
    const mutationFn = useConvexMutation(api.lib.projects.milestones.mutations.updateMilestone);
    return useMutation({ mutationFn });
  }

  useDeleteMilestone() {
    const mutationFn = useConvexMutation(api.lib.projects.milestones.mutations.deleteMilestone);
    return useMutation({ mutationFn });
  }

  useUpdateMilestoneProgress() {
    const mutationFn = useConvexMutation(api.lib.projects.milestones.mutations.updateMilestoneProgress);
    return useMutation({ mutationFn });
  }

  useUpdateMilestoneStatus() {
    const mutationFn = useConvexMutation(api.lib.projects.milestones.mutations.updateMilestoneStatus);
    return useMutation({ mutationFn });
  }
}

export const milestonesService = new MilestonesService();