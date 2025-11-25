// src/features/projects/hooks/useTeam.ts

import { useCallback, useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { teamService, type TeamListOptions } from '../services/TeamService';
import { parseConvexError } from '@/utils/errorHandling';
import type { Id } from '@/convex/_generated/dataModel';

export interface AddMemberData {
  projectId: Id<"projects">;
  userId: Id<"userProfiles">;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  department?: string;
  jobTitle?: string;
  permissions?: string[];
  settings?: {
    emailNotifications?: boolean;
    canManageTasks?: boolean;
    canInviteMembers?: boolean;
    canEditProject?: boolean;
  };
}

export interface UpdateMemberData {
  role?: 'owner' | 'admin' | 'member' | 'viewer';
  department?: string;
  jobTitle?: string;
  status?: 'active' | 'invited' | 'inactive';
  permissions?: string[];
  settings?: {
    emailNotifications?: boolean;
    canManageTasks?: boolean;
    canInviteMembers?: boolean;
    canEditProject?: boolean;
  };
  extendedMetadata?: {
    avatar?: string;
    bio?: string;
    skills?: string[];
  };
}

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

// ==========================================
// STANDARD HOOKS
// ==========================================

export function useProjectMembers(projectId?: Id<"projects">, options?: TeamListOptions) {
  return teamService.useProjectMembers(projectId, options);
}

export function useMember(memberId?: Id<"projectMembers">) {
  return teamService.useMember(memberId);
}

export function useUserMemberships(targetUserId?: Id<"userProfiles">) {
  return teamService.useUserMemberships(targetUserId);
}

export function useTeamStats(projectId?: Id<"projects">) {
  return teamService.useTeamStats(projectId);
}

export function useCheckMembership(projectId?: Id<"projects">, userId?: Id<"userProfiles">) {
  return teamService.useCheckMembership(projectId, userId);
}

/**
 * Main team hook with mutations
 */
export function useTeam(projectId?: Id<"projects">, options?: TeamListOptions) {
  // Core data queries
  const { data, isPending, error, refetch } = useProjectMembers(projectId, options);

  // Stats query
  const { data: stats, isPending: isStatsLoading } = teamService.useTeamStats(projectId);

  // Mutations
  const addMemberMutation = teamService.useAddMember();
  const updateMemberMutation = teamService.useUpdateMember();
  const removeMemberMutation = teamService.useRemoveMember();
  const updateMemberRoleMutation = teamService.useUpdateMemberRole();
  const updateMemberActivityMutation = teamService.useUpdateMemberActivity();

  // Parse error
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null;
  }, [error]);

  const isPermissionError = parsedError?.code === 'PERMISSION_DENIED';

  // Enhanced action functions
  const addMember = useCallback(
    async (memberData: AddMemberData) => {
      return await addMemberMutation.mutateAsync({
        data: memberData,
      });
    },
    [addMemberMutation]
  );

  const updateMember = useCallback(
    async (memberId: Id<"projectMembers">, updates: UpdateMemberData) => {
      return await updateMemberMutation.mutateAsync({
        memberId,
        updates,
      });
    },
    [updateMemberMutation]
  );

  const removeMember = useCallback(
    async (memberId: Id<"projectMembers">) => {
      return await removeMemberMutation.mutateAsync({
        memberId,
      });
    },
    [removeMemberMutation]
  );

  const updateMemberRole = useCallback(
    async (memberId: Id<"projectMembers">, role: MemberRole) => {
      return await updateMemberRoleMutation.mutateAsync({
        memberId,
        role,
      });
    },
    [updateMemberRoleMutation]
  );

  const updateMemberActivity = useCallback(
    async (projectId: Id<"projects">) => {
      return await updateMemberActivityMutation.mutateAsync({
        projectId,
      });
    },
    [updateMemberActivityMutation]
  );

  return {
    // Data
    members: data?.members || [],
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
    addMember,
    updateMember,
    removeMember,
    updateMemberRole,
    updateMemberActivity,
    refetch,

    // Mutation states
    isAdding: addMemberMutation.isPending,
    isUpdating: updateMemberMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    isUpdatingRole: updateMemberRoleMutation.isPending,
    isUpdatingActivity: updateMemberActivityMutation.isPending,

    // Raw mutations
    mutations: {
      addMember: addMemberMutation,
      updateMember: updateMemberMutation,
      removeMember: removeMemberMutation,
      updateMemberRole: updateMemberRoleMutation,
      updateMemberActivity: updateMemberActivityMutation,
    },
  };
}

// ==========================================
// SUSPENSE HOOKS
// ==========================================

export function useProjectMembersSuspense(projectId: Id<"projects">, options?: TeamListOptions) {
  return useSuspenseQuery(teamService.getProjectMembersQueryOptions(projectId, options));
}

export function useMemberSuspense(memberId: Id<"projectMembers">) {
  return useSuspenseQuery(teamService.getMemberQueryOptions(memberId));
}

export function useUserMembershipsSuspense(targetUserId?: Id<"userProfiles">) {
  return useSuspenseQuery(teamService.getUserMembershipsQueryOptions(targetUserId));
}

export function useTeamStatsSuspense(projectId: Id<"projects">) {
  return useSuspenseQuery(teamService.getTeamStatsQueryOptions(projectId));
}