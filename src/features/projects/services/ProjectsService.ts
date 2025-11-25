// src/features/projects/services/ProjectsService.ts

import { useQuery, useMutation } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@/convex/_generated/api";
import type { CreateProjectData, UpdateProjectData, ProjectId, ProjectsListOptions } from "../types";
import type { Id } from "@/convex/_generated/dataModel";
import * as projectHelpers from "../utils/projectHelpers";

/**
 * Projects Service
 *
 * Handles data fetching and mutations.
 * ⚠️ NO authentication/authorization logic here - that's in the backend!
 */
export class ProjectsService {
  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  getProjectsQueryOptions(options?: ProjectsListOptions) {
    return convexQuery(api.lib.boilerplate.projects.queries.getProjects, {
      options,
    });
  }

  getProjectQueryOptions(projectId: ProjectId) {
    return convexQuery(api.lib.boilerplate.projects.queries.getProject, {
      projectId,
    });
  }

  getProjectByPublicIdQueryOptions(publicId: string) {
    return convexQuery(api.lib.boilerplate.projects.queries.getProjectByPublicId, {
      publicId,
    });
  }

  getUserProjectsQueryOptions(options?: {
    targetUserId?: Id<"userProfiles">;
    includeArchived?: boolean;
    limit?: number;
  }) {
    return convexQuery(api.lib.boilerplate.projects.queries.getUserProjects, options || {});
  }

  getProjectStatsQueryOptions(targetUserId?: Id<"userProfiles">) {
    return convexQuery(api.lib.boilerplate.projects.queries.getProjectStats, {
      targetUserId,
    });
  }

  getProjectMembersQueryOptions(projectId: ProjectId) {
    return convexQuery(api.lib.boilerplate.projects.queries.getProjectMembers, {
      projectId,
    });
  }

  getDashboardStatsQueryOptions() {
    return convexQuery(api.lib.boilerplate.projects.queries.getDashboardStats, {});
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  useProjects(options?: ProjectsListOptions) {
    return useQuery({
      ...this.getProjectsQueryOptions(options),
      staleTime: 30000, // 30 seconds
    });
  }

  useProject(projectId?: ProjectId) {
    return useQuery({
      ...this.getProjectQueryOptions(projectId!),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  useProjectByPublicId(publicId?: string) {
    return useQuery({
      ...this.getProjectByPublicIdQueryOptions(publicId!),
      staleTime: 30000,
      enabled: !!publicId,
    });
  }

  useUserProjects(options?: {
    targetUserId?: Id<"userProfiles">;
    includeArchived?: boolean;
    limit?: number;
  }) {
    return useQuery({
      ...this.getUserProjectsQueryOptions(options),
      staleTime: 30000,
    });
  }

  useProjectStats(targetUserId?: Id<"userProfiles">) {
    return useQuery({
      ...this.getProjectStatsQueryOptions(targetUserId),
      staleTime: 60000, // 1 minute
    });
  }

  useDashboardStats() {
    return useQuery({
      ...this.getDashboardStatsQueryOptions(),
      staleTime: 60000,
    });
  }

  useProjectMembers(projectId?: ProjectId) {
    return useQuery({
      ...this.getProjectMembersQueryOptions(projectId!),
      staleTime: 30000,
      enabled: !!projectId,
    });
  }

  // ==========================================
  // MUTATION HOOKS
  // ==========================================

  useCreateProject() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.mutations.createProject);
    return useMutation({ mutationFn });
  }

  useUpdateProject() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.mutations.updateProject);
    return useMutation({ mutationFn });
  }

  useDeleteProject() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.mutations.deleteProject);
    return useMutation({ mutationFn });
  }

  useUpdateProjectProgress() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.mutations.updateProjectProgress);
    return useMutation({ mutationFn });
  }

  useRequestAccess() {
    const mutationFn = useConvexMutation(api.lib.boilerplate.projects.mutations.requestAccess);
    return useMutation({ mutationFn });
  }

  // ==========================================
  // UTILITY FUNCTIONS (No Auth Logic)
  // ==========================================

  formatProjectName(project: { title: string; _id?: ProjectId }): string {
    return project.title || `Project ${project._id || "Unknown"}`;
  }

}

export const projectsService = new ProjectsService();