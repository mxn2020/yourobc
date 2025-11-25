// src/features/projects/hooks/useProjectAudit.ts

import { useCallback } from "react";
import { useMyAuditLogs } from "@/features/boilerplate/audit-logs";

/**
 * Internal hook for project audit logging
 * This is used within the projects feature to log project activities
 * Note: User info (userId, userName) is now extracted in the backend via JWT
 * 
 * ⚠️ IMPORTANT: All audit functions now expect publicId (string) not Convex _id
 * The backend stores publicId in the entityId field for user-facing audit logs
 */
export function useProjectAudit() {
  const { createAuditLog } = useMyAuditLogs();

  // Safely log audit events - won't throw if audit logging fails
  const safeLogAudit = useCallback(
    async (logData: Parameters<typeof createAuditLog>[0]) => {
      try {
        await createAuditLog(logData);
      } catch (error) {
        // ✅ Only log in development
        if (import.meta.env.DEV) {
          console.warn("Audit logging failed:", error);
        }
        // Silently fail in production - audit logging should never break UX
      }
    },
    [createAuditLog]
  );

  const logProjectCreated = useCallback(
    async (publicId: string, projectTitle: string, projectData: any) => {
      const logData = {
        action: "project.created" as const,
        description: `Created project "${projectTitle}".`,
        entityType: "boilerplate_project" as const,
        entityId: publicId, // ✅ Using publicId for user-facing audit logs
        entityTitle: projectTitle,
        metadata: {
          priority: projectData.priority,
          visibility: projectData.visibility,
          category: projectData.category,
          tags: projectData.tags,
        },
      };
      await safeLogAudit(logData);
    },
    [safeLogAudit]
  );

  const logProjectUpdated = useCallback(
    async (publicId: string, projectTitle: string, oldValues: any, newValues: any) => {
      // Determine changed fields
      const changedFields = Object.keys(newValues).filter(
        (key) => newValues[key] !== undefined && oldValues[key] !== newValues[key]
      );

      if (changedFields.length === 0) return;

      const logData = {
        action: "project.updated" as const,
        description: `Updated project "${projectTitle}": ${changedFields.join(", ")}.`,
        entityType: "boilerplate_project" as const,
        entityId: publicId, // ✅ Using publicId
        entityTitle: projectTitle,
        metadata: {
          changedFields,
          changes: Object.fromEntries(
            changedFields.map((field) => [field, { old: oldValues[field], new: newValues[field] }])
          ),
        },
      };
      await safeLogAudit(logData);
    },
    [safeLogAudit]
  );

  const logProjectDeleted = useCallback(
    async (publicId: string, projectTitle: string, projectData: any, hardDelete: boolean = false) => {
      const action = hardDelete ? ("project.hard_deleted" as const) : ("project.deleted" as const);
      const logData = {
        action,
        description: `${hardDelete ? "Permanently deleted" : "Deleted"} project "${projectTitle}".`,
        entityType: "boilerplate_project" as const,
        entityId: publicId, // ✅ Using publicId
        entityTitle: projectTitle,
        metadata: {
          hardDelete,
          status: projectData.status,
          completedTasks: projectData.progress?.completedTasks,
          totalTasks: projectData.progress?.totalTasks,
        },
      };
      await safeLogAudit(logData);
    },
    [safeLogAudit]
  );

  const logProgressUpdated = useCallback(
    async (publicId: string, projectTitle: string, oldProgress: any, newProgress: any) => {
      const logData = {
        action: "project.progress.updated" as const,
        description: `Updated progress for project "${projectTitle}" from ${oldProgress.percentage}% to ${newProgress.percentage}%.`,
        entityType: "boilerplate_project" as const,
        entityId: publicId, // ✅ Using publicId
        entityTitle: projectTitle,
        metadata: {
          oldProgress,
          newProgress,
        },
      };
      await safeLogAudit(logData);
    },
    [safeLogAudit]
  );

  const logProjectViewed = useCallback(
    async (publicId: string, projectTitle: string) => {
      const logData = {
        action: "project.viewed" as const,
        description: `Viewed project "${projectTitle}".`,
        entityType: "boilerplate_project" as const,
        entityId: publicId, // ✅ Using publicId
        entityTitle: projectTitle,
        metadata: {
          timestamp: Date.now(),
        },
      };
      await safeLogAudit(logData);
    },
    [safeLogAudit]
  );

  return {
    logProjectCreated,
    logProjectUpdated,
    logProjectDeleted,
    logProgressUpdated,
    logProjectViewed,
    // Expose the safe logging function for custom audit logs
    safeLogAudit,
  };
}