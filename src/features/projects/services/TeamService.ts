// src/features/projects/services/TeamService.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export interface TeamListOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'joinedAt' | 'lastActiveAt' | 'role';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    role?: string[];
    status?: string[];
    department?: string;
    search?: string;
  };
}

export class TeamService {
  // ==========================================
  // QUERY OPTION FACTORIES
  // ==========================================

  getProjectMembersQueryOptions(projectId: Id<"projects">, options?: TeamListOptions) {
    return convexQuery(api.lib.boilerplate.projects.team.queries.getProjectMembers, {
      projectId,
      options,
    });
  }

  getMemberQueryOptions(memberId: Id<"projectMembers">) {
    return convexQuery(api.lib.boilerplate.projects.team.queries.getMember, {
      memberId,
    });
  }

  getUserMembershipsQueryOptions(targetUserId?: Id<"userProfiles">) {
    return convexQuery(api.lib.boilerplate.projects.team.queries.getUserMemberships, {
      targetUserId,
    });
  }

  getTeamStatsQueryOptions(projectId: Id<"projects">) {
    return convexQuery(api.lib.boilerplate.projects.team.queries.getTeamStats, {
      projectId,
    });
  }

  getCheckMembershipQueryOptions(projectId: Id<"projects">, userId?: Id<"userProfiles">) {
    return convexQuery(api.lib.boilerplate.projects.team.queries.checkMembership, {
      projectId,
      userId,
    });
  }

  getProjectActivityQueryOptions(
    projectId: Id<"projects">,
    options?: {
      limit?: number;
      offset?: number;
      filterByAction?: string;
      filterByMember?: Id<"userProfiles">;
    }
  ) {
    return convexQuery(api.lib.boilerplate.projects.team.queries.getProjectActivity, {
      projectId,
      ...options,
    });
  }

  getMemberWorkloadQueryOptions(projectId: Id<"projects">) {
    return convexQuery(api.lib.boilerplate.projects.team.queries.getMemberWorkload, {
      projectId,
    });
  }

  // User profile queries for member management
  getCurrentUserProfileQueryOptions() {
    return convexQuery(api.lib.boilerplate.user_profiles.queries.getProfileByAuthId, {});
  }

  getAllUserProfilesQueryOptions() {
    return convexQuery(api.lib.boilerplate.user_profiles.queries.getAllProfiles, {});
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  useProjectMembers(projectId?: Id<"projects">, options?: TeamListOptions) {
    return useQuery({
      ...this.getProjectMembersQueryOptions(projectId!, options),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  useMember(memberId?: Id<"projectMembers">) {
    return useQuery({
      ...this.getMemberQueryOptions(memberId!),
      staleTime: 30000,
      enabled: !!memberId,
    });
  }

  useUserMemberships(targetUserId?: Id<"userProfiles">) {
    return useQuery({
      ...this.getUserMembershipsQueryOptions(targetUserId),
      staleTime: 30000,
    });
  }

  useTeamStats(projectId?: Id<"projects">) {
    return useQuery({
      ...this.getTeamStatsQueryOptions(projectId!),
      staleTime: 60000, // 1 minute for stats
      enabled: !!projectId,
    });
  }

  useCheckMembership(projectId?: Id<"projects">, userId?: Id<"userProfiles">) {
    return useQuery({
      ...this.getCheckMembershipQueryOptions(projectId!, userId),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  useProjectActivity(
    projectId?: Id<"projects">,
    options?: {
      limit?: number;
      offset?: number;
      filterByAction?: string;
      filterByMember?: Id<"userProfiles">;
    }
  ) {
    return useQuery({
      ...this.getProjectActivityQueryOptions(projectId!, options),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  useMemberWorkload(projectId?: Id<"projects">) {
    return useQuery({
      ...this.getMemberWorkloadQueryOptions(projectId!),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  useCurrentUserProfile() {
    return useQuery({
      ...this.getCurrentUserProfileQueryOptions(),
      staleTime: 300000, // 5 minutes for user profile
    });
  }

  useAllUserProfiles() {
    return useQuery({
      ...this.getAllUserProfilesQueryOptions(),
      staleTime: 60000, // 1 minute for user list
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  useAddMember() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.team.mutations.addMember);
    return useMutation({ mutationFn });
  }

  useUpdateMember() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.team.mutations.updateMember);
    return useMutation({ mutationFn });
  }

  useRemoveMember() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.team.mutations.removeMember);
    return useMutation({ mutationFn });
  }

  useUpdateMemberRole() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.team.mutations.updateMemberRole);
    return useMutation({ mutationFn });
  }

  useUpdateMemberActivity() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.team.mutations.updateMemberActivity);
    return useMutation({ mutationFn });
  }
}

export const teamService = new TeamService();