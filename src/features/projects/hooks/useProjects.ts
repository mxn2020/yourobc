// src/features/projects/hooks/useProjects.ts

import { useCallback, useMemo, useEffect, useRef } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useProjectAudit } from "./useProjectAudit";
import { projectsService } from "../services/ProjectsService";
import { parseConvexError } from "@/utils/errorHandling";
import * as projectHelpers from "../utils/projectHelpers";
import type {
  CreateProjectData,
  ProjectId,
  ProjectsListOptions,
  UpdateProjectData,
} from "../types";
import { Id } from "@/convex/_generated/dataModel";

// Generate unique ID for each hook instance
let instanceCounter = 0;

/**
 * Main projects hook
 * Handles data fetching, mutations, and audit logging
 */
export function useProjects(options?: ProjectsListOptions) {
  // Create unique timer ID for this hook instance
  const instanceId = useRef(++instanceCounter);
  const timerLabel = `useProjects: Data Fetch [${instanceId.current}]`;

  // Track data fetching performance with unique timer ID
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTimeRef.current = performance.now();
  }, []);

  // Core data queries
  const { data: projectsQuery, isPending, error, refetch } = projectsService.useProjects(options);

  // Stats query
  const { data: stats, isPending: isStatsLoading } = projectsService.useProjectStats();

  // Log when data is loaded (dev mode only)
  useEffect(() => {
    if (import.meta.env.DEV && !isPending && projectsQuery) {
      if (startTimeRef.current) {
        const duration = performance.now() - startTimeRef.current;
        const source = duration < 10 ? "from SSR cache" : "from WebSocket";
        console.log(
          `${timerLabel}: ${duration.toFixed(2)}ms - Loaded ${
            projectsQuery.projects?.length || 0
          } projects ${source}`
        );
        startTimeRef.current = undefined; // Clear to prevent duplicate logs
      }
    }
  }, [isPending, projectsQuery, timerLabel]);

  // Audit logging
  const {
    logProjectCreated,
    logProjectUpdated,
    logProjectDeleted,
    logProgressUpdated,
    logProjectViewed,
  } = useProjectAudit();

  // Mutations
  const createProjectMutation = projectsService.useCreateProject();
  const updateProjectMutation = projectsService.useUpdateProject();
  const deleteProjectMutation = projectsService.useDeleteProject();
  const updateProgressMutation = projectsService.useUpdateProjectProgress();

  // Parse error
  const parsedError = useMemo(() => {
    return error ? parseConvexError(error) : null;
  }, [error]);

  const isPermissionError = parsedError?.code === "PERMISSION_DENIED";

  // Enhanced action functions with audit logging
  const createProject = useCallback(
    async (data: CreateProjectData) => {
      const errors = projectHelpers.validateProjectData(data);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      const result = await createProjectMutation.mutateAsync({ data });

      // ✅ No try-catch needed - audit hook handles failures internally
      logProjectCreated(result._id, data.title, data);

      return result;
    },
    [createProjectMutation, logProjectCreated]
  );

  const updateProject = useCallback(
    async (projectId: ProjectId, updates: UpdateProjectData) => {
      const errors = projectHelpers.validateProjectData(updates);
      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(", ")}`);
      }

      const currentProject = projectsQuery?.projects?.find((p) => p._id === projectId);
      if (!currentProject) {
        throw new Error("Project not found");
      }

      const result = await updateProjectMutation.mutateAsync({
        projectId,
        updates,
      });

      // ✅ Clean - no error handling needed
      logProjectUpdated(projectId, currentProject.title, currentProject, updates);

      return result;
    },
    [updateProjectMutation, logProjectUpdated, projectsQuery]
  );

  const deleteProject = useCallback(
    async (projectId: ProjectId, hardDelete = false) => {
      const projectToDelete = projectsQuery?.projects?.find((p) => p._id === projectId);
      if (!projectToDelete) {
        throw new Error("Project not found");
      }

      const result = await deleteProjectMutation.mutateAsync({ projectId, hardDelete });

      // Log deletion
      logProjectDeleted(projectId, projectToDelete.title, projectToDelete, hardDelete).catch(
        console.warn
      );

      return result;
    },
    [deleteProjectMutation, logProjectDeleted, projectsQuery]
  );

  const updateProjectProgress = useCallback(
    async (projectId: ProjectId, completedTasks: number, totalTasks: number) => {
      const currentProject = projectsQuery?.projects?.find((p) => p._id === projectId);
      if (!currentProject) {
        throw new Error("Project not found");
      }

      const newProgress = {
        completedTasks,
        totalTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };

      const result = await updateProgressMutation.mutateAsync({
        projectId,
        progress: {
          completedTasks,
          totalTasks,
        },
      });

      // Log progress update
      logProgressUpdated(
        projectId,
        currentProject.title,
        currentProject.progress,
        newProgress
      ).catch(console.warn);

      return result;
    },
    [updateProgressMutation, logProgressUpdated, projectsQuery]
  );

  const viewProject = useCallback(
    async (projectId: ProjectId) => {
      const project = projectsQuery?.projects?.find((p) => p._id === projectId);
      if (project && project.visibility === "private") {
        logProjectViewed(projectId, project.title).catch(console.warn);
      }
    },
    [logProjectViewed, projectsQuery]
  );

  return {
    // Data
    projects: projectsQuery?.projects || [],
    total: projectsQuery?.total || 0,
    hasMore: projectsQuery?.hasMore || false,
    isLoading: isPending,
    isStatsLoading,
    error: parsedError,
    rawError: error,
    isPermissionError,
    stats,

    // Actions
    createProject,
    updateProject,
    deleteProject,
    updateProjectProgress,
    viewProject,
    refetch,

    // Loading states
    isUpdating:
      createProjectMutation.isPending ||
      updateProjectMutation.isPending ||
      deleteProjectMutation.isPending ||
      updateProgressMutation.isPending,
    isCreating: createProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    isUpdatingProgress: updateProgressMutation.isPending,

    // Raw mutations
    mutations: {
      createProject: createProjectMutation,
      updateProject: updateProjectMutation,
      deleteProject: deleteProjectMutation,
      updateProgress: updateProgressMutation,
    },
  };
}

// Additional hooks
export function useProject(projectId: ProjectId | undefined) {
  const result = projectsService.useProject(projectId);
  const { logProjectViewed } = useProjectAudit();

  // Auto-log project views for private projects
  useEffect(() => {
    if (projectId && result.data && result.data.visibility === "private") {
      logProjectViewed(projectId, result.data.title).catch(console.warn);
    }
  }, [result.data, projectId, logProjectViewed]);

  return result;
}

export function useUserProjects(options?: {
  targetUserId?: Id<"userProfiles">;
  includeArchived?: boolean;
  limit?: number;
}) {
  return projectsService.useUserProjects(options);
}

/**
 * Hook for project members
 */
export function useProjectMembers(projectId?: ProjectId) {
  return projectsService.useProjectMembers(projectId);
}

export function useCreateProject() {
  return projectsService.useCreateProject();
}

export function useUpdateProject() {
  return projectsService.useUpdateProject();
}

export function useDeleteProject() {
  return projectsService.useDeleteProject();
}

export function useUpdateProjectProgress() {
  return projectsService.useUpdateProjectProgress();
}

/**
 * Lightweight hook for project actions WITHOUT data subscription
 * Use this in components that only need to perform actions (like ProjectCard)
 * This avoids creating unnecessary data subscriptions
 */
export function useProjectActions() {
  const { logProjectViewed } = useProjectAudit();

  const viewProject = useCallback(
    async (projectId: ProjectId, projectTitle?: string) => {
      // Log the view - no need to fetch project data
      if (projectTitle) {
        logProjectViewed(projectId, projectTitle).catch(console.warn);
      }
    },
    [logProjectViewed]
  );

  return {
    viewProject,
  };
}

// ==========================================
// SUSPENSE QUERY HOOKS
// These hooks use useSuspenseQuery with service-provided query options
// Perfect for components that need guaranteed data (SSR-friendly)
// ==========================================

/**
 * Hook for projects list data using Suspense
 * Uses SSR cache when available, suspends and fetches if not
 *
 * @example
 * const { data: projectsData } = useProjectsList({ limit: 100 })
 */
export function useProjectsList(options?: ProjectsListOptions) {
  const startTime = performance.now();
  const result = useSuspenseQuery(projectsService.getProjectsQueryOptions(options));

  // Log data access timing
  const duration = performance.now() - startTime;
  const source = duration < 10 ? "SSR cache" : "WebSocket";

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`useProjectsList: Accessed data in ${duration.toFixed(2)}ms from ${source}`);
      console.log(`useProjectsList: Loaded ${result.data?.projects?.length || 0} projects`);
    }
  }, [duration, source, result.data?.projects?.length]);

  return result;
}

/**
 * Hook for project stats using Suspense
 * Uses SSR cache when available, suspends and fetches if not
 *
 * @example
 * const { data: stats } = useProjectStats()
 */
export function useProjectStats(targetUserId?: Id<"userProfiles">) {
  return useSuspenseQuery(projectsService.getProjectStatsQueryOptions(targetUserId));
}

/**
 * Hook for single project data using Suspense
 *
 * @example
 * const { data: project } = useProjectSuspense(projectId)
 */
export function useProjectSuspense(projectId: ProjectId) {
  return useSuspenseQuery(projectsService.getProjectQueryOptions(projectId));
}

/**
 * Hook for project members using Suspense
 *
 * @example
 * const { data: members } = useProjectMembersSuspense(projectId)
 */
export function useProjectMembersSuspense(projectId: ProjectId) {
  return useSuspenseQuery(projectsService.getProjectMembersQueryOptions(projectId));
}