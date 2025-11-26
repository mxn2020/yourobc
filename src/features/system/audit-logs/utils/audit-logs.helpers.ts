// src/features/audit-logs/utils/audit-logs.helpers.ts

import { ProjectId } from "@/features/projects";
import { AuditAction, AuditOperation } from "../types/audit-logs.types";

// === Audit Log Helpers ===
export const AuditLogHelpers = {
  // Helper functions for common audit log operations
  createUserActionLog: (action: AuditAction, description: string) => ({
    action: action,
    entityType: 'system_user' as const,
    description,
    metadata: {
      source: 'user_action',
      operation: 'update' as AuditOperation,
    }
  }),

  createSystemActionLog: (action: AuditAction, description: string, metadata?: any) => ({
    action: action,
    entityType: 'system' as const,
    description,
    metadata: {
      source: 'system_action',
      ...metadata,
    }
  }),

  createProjectActionLog: (
    projectId: ProjectId,
    projectTitle: string,
    action: AuditAction,
    description: string
  ) => ({
    action: action,
    entityType: 'system_project' as const,
    entityId: projectId,
    entityTitle: projectTitle,
    description,
    metadata: {
      source: 'project_action',
      operation: action.includes('created') ? 'create' :
                action.includes('updated') ? 'update' :
                action.includes('deleted') ? 'delete' : 'view' as AuditOperation,
    }
  }),

  createSecurityActionLog: (
    action: AuditAction,
    description: string,
    ipAddress?: string,
    userAgent?: string
  ) => ({
    action: action,
    entityType: 'system_user' as const,
    description,
    metadata: {
      source: 'security_action',
      operation: 'security' as AuditOperation,
      ipAddress,
      userAgent,
    }
  })
}

