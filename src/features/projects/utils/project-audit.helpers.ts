// src/features/projects/utils/project-audit.helpers.ts
import type { ProjectId } from '../types'
import { Id } from "@/convex/_generated/dataModel";
import { CreateAuditLogData } from '@/convex/lib/system/core/audit_logs';
import { AuditAction, AuditMetadata } from '@/features/system/audit-logs';

export const ProjectAuditHelpers = {
  createProjectActionLog: (
    projectId: ProjectId,
    projectTitle: string,
    action: AuditAction,
    description: string,
    metadata?: Partial<AuditMetadata>
  ): CreateAuditLogData => ({
    action,
    entityType: 'system_project',
    entityId: projectId,
    entityTitle: projectTitle,
    description,
    metadata: {
      source: 'project_management',
      operation: action.includes('created') ? 'create' :
                 action.includes('updated') ? 'update' :
                 action.includes('deleted') ? 'delete' :
                 action.includes('viewed') ? 'view' : 'update',
      ...metadata,
    }
  }),

  createProjectCreatedLog: (
    projectId: ProjectId,
    projectTitle: string,
    projectData: any
  ) => ProjectAuditHelpers.createProjectActionLog(
    projectId,
    projectTitle,
    'project.created',
    `Project "${projectTitle}" was created with priority: ${projectData.priority}, visibility: ${projectData.visibility}`,
    {
      projectData: {
        priority: projectData.priority,
        visibility: projectData.visibility,
        category: projectData.category,
        estimatedHours: projectData.metadata?.estimatedHours,
        budget: projectData.metadata?.budget,
        actualCost: projectData.metadata?.actualCost,
        riskLevel: projectData.metadata?.riskLevel,
        tags: projectData.tags,
      }
    }
  ),

  createProjectUpdatedLog: (
    projectId: ProjectId,
    projectTitle: string,
    oldValues: any,
    newValues: any,
    changedFields: string[]
  ) => {
    const changes = changedFields
      .map(field => `${field}: ${oldValues[field]} → ${newValues[field]}`)
      .join(', ')

    return ProjectAuditHelpers.createProjectActionLog(
      projectId,
      projectTitle,
      'project.updated',
      `Project "${projectTitle}" was updated. Changes: ${changes}`,
      {
        oldValues: Object.fromEntries(
          Object.entries(oldValues).filter(([key]) => changedFields.includes(key))
        ),
        newValues: Object.fromEntries(
          Object.entries(newValues).filter(([key]) => changedFields.includes(key))
        ),
        changedFields,
      }
    )
  },

  createProjectDeletedLog: (
    projectId: ProjectId,
    projectTitle: string,
    projectData: any
  ) => ProjectAuditHelpers.createProjectActionLog(
    projectId,
    projectTitle,
    'project.deleted',
    `Project "${projectTitle}" was permanently deleted`,
    {
      deletedProject: {
        status: projectData.status,
        priority: projectData.priority,
        progress: projectData.progress,
        collaboratorsCount: projectData.collaborators?.length || 0,
        tags: projectData.tags,
      }
    }
  ),

  createProgressUpdatedLog: (
    projectId: ProjectId,
    projectTitle: string,
    oldProgress: any,
    newProgress: any
  ) => ProjectAuditHelpers.createProjectActionLog(
    projectId,
    projectTitle,
    'project.updated',
    `Project "${projectTitle}" progress updated from ${oldProgress.percentage}% to ${newProgress.percentage}% (${newProgress.completedTasks}/${newProgress.totalTasks} tasks)`,
    {
      progressUpdate: {
        oldPercentage: oldProgress.percentage,
        newPercentage: newProgress.percentage,
        tasksCompleted: newProgress.completedTasks - oldProgress.completedTasks,
      }
    }
  ),

  createCollaboratorLog: (
    projectId: ProjectId,
    projectTitle: string,
    collaboratorId: Id<"userProfiles">,
    action: 'added' | 'removed'
  ) => ProjectAuditHelpers.createProjectActionLog(
    projectId,
    projectTitle,
    'project.updated',
    `Collaborator ${collaboratorId} was ${action} ${action === 'added' ? 'to' : 'from'} project "${projectTitle}"`,
    {
      collaboratorAction: {
        type: action,
        collaboratorId,
      }
    }
  ),

  createProjectViewedLog: (
    projectId: ProjectId,
    projectTitle: string
  ) => ProjectAuditHelpers.createProjectActionLog(
    projectId,
    projectTitle,
    'project.viewed',
    `Project "${projectTitle}" was accessed`,
    {
      accessType: 'view',
      timestamp: Date.now(),
    }
  ),
}

