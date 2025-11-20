// convex/lib/system/projects/projects/mutations.ts
// Write operations for projects module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { projectsValidators } from '@/schema/system/projects/projects/validators';
import { PROJECTS_CONSTANTS } from './constants';
import { validateProjectData } from './utils';
import {
  requireEditProjectAccess,
  requireDeleteProjectAccess,
  canEditProject,
  canDeleteProject,
} from './permissions';
import type { ProjectId } from './types';

/**
 * Create new project
 */
export const createProject = mutation({
  args: {
    data: v.object({
      title: v.string(),
      description: v.optional(v.string()),
      priority: v.optional(projectsValidators.priority),
      visibility: v.optional(projectsValidators.visibility),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      settings: v.optional(
        v.object({
          allowComments: v.optional(v.boolean()),
          requireApproval: v.optional(v.boolean()),
          autoArchive: v.optional(v.boolean()),
          emailNotifications: v.optional(v.boolean()),
        })
      ),
      extendedMetadata: v.optional(
        v.object({
          estimatedHours: v.optional(v.number()),
          budget: v.optional(v.number()),
          actualCost: v.optional(v.number()),
          riskLevel: v.optional(projectsValidators.riskLevel),
          client: v.optional(v.string()),
          color: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, { data }): Promise<ProjectId> => {
    // 1. AUTH: Get authenticated user
    const user = await requirePermission(
      ctx,
      PROJECTS_CONSTANTS.PERMISSIONS.CREATE,
      { allowAdmin: true }
    );

    // 2. VALIDATE: Check data validity
    const errors = validateProjectData(data);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 3. PROCESS: Generate IDs and prepare data
    const publicId = await generateUniquePublicId(ctx, 'projects');
    const now = Date.now();

    // 4. CREATE: Insert into database
    const projectId = await ctx.db.insert('projects', {
      publicId,
      title: data.title.trim(),
      description: data.description?.trim(),
      status: PROJECTS_CONSTANTS.STATUS.ACTIVE,
      priority: data.priority || PROJECTS_CONSTANTS.PRIORITY.MEDIUM,
      ownerId: user._id,
      visibility: data.visibility || PROJECTS_CONSTANTS.VISIBILITY.PRIVATE,
      tags: data.tags?.map((tag) => tag.trim()) || [],
      category: data.category,
      progress: {
        completedTasks: 0,
        totalTasks: 0,
        percentage: 0,
      },
      startDate: data.startDate,
      dueDate: data.dueDate,
      completedAt: undefined,
      settings: {
        allowComments: true,
        requireApproval: false,
        autoArchive: false,
        emailNotifications: true,
        ...data.settings,
      },
      extendedMetadata: data.extendedMetadata,
      lastActivityAt: now,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      deletedAt: undefined,
    });

    // Automatically add the owner as a project member with "owner" role
    await ctx.db.insert('projectMembers', {
      projectId,
      userId: user._id,
      role: 'owner',
      status: 'active',
      joinedAt: now,
      lastActiveAt: now,
      invitedBy: user._id,
      invitedAt: now,
      invitationAcceptedAt: now,
      settings: {
        emailNotifications: true,
        canManageTasks: true,
        canInviteMembers: true,
        canEditProject: true,
      },
      metadata: {},
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      deletedAt: undefined,
      deletedBy: undefined,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'project.created',
      entityType: 'system_project',
      entityId: publicId,
      entityTitle: data.title.trim(),
      description: `Created project: ${data.title.trim()}`,
      metadata: {
        status: PROJECTS_CONSTANTS.STATUS.ACTIVE,
        visibility: data.visibility || PROJECTS_CONSTANTS.VISIBILITY.PRIVATE,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return projectId;
  },
});

/**
 * Update existing project
 */
export const updateProject = mutation({
  args: {
    projectId: v.id('projects'),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(projectsValidators.status),
      priority: v.optional(projectsValidators.priority),
      visibility: v.optional(projectsValidators.visibility),
      tags: v.optional(v.array(v.string())),
      category: v.optional(v.string()),
      startDate: v.optional(v.number()),
      dueDate: v.optional(v.number()),
      settings: v.optional(
        v.object({
          allowComments: v.optional(v.boolean()),
          requireApproval: v.optional(v.boolean()),
          autoArchive: v.optional(v.boolean()),
          emailNotifications: v.optional(v.boolean()),
        })
      ),
      extendedMetadata: v.optional(
        v.object({
          estimatedHours: v.optional(v.number()),
          actualHours: v.optional(v.number()),
          budget: v.optional(v.number()),
          actualCost: v.optional(v.number()),
          riskLevel: v.optional(projectsValidators.riskLevel),
          client: v.optional(v.string()),
          color: v.optional(v.string()),
        })
      ),
    }),
  },
  handler: async (ctx, { projectId, updates }): Promise<ProjectId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const project = await ctx.db.get(projectId);
    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditProjectAccess(ctx, project, user);

    // 4. VALIDATE: Check update data validity
    const errors = validateProjectData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 5. PROCESS: Prepare update data
    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
      lastActivityAt: now,
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title.trim();
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim();
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    if (updates.visibility !== undefined) {
      updateData.visibility = updates.visibility;
    }
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags.map((tag) => tag.trim());
    }
    if (updates.category !== undefined) {
      updateData.category = updates.category;
    }
    if (updates.startDate !== undefined) {
      updateData.startDate = updates.startDate;
    }
    if (updates.dueDate !== undefined) {
      updateData.dueDate = updates.dueDate;
    }

    // Handle status changes
    if (
      updates.status === PROJECTS_CONSTANTS.STATUS.COMPLETED &&
      project.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED
    ) {
      updateData.completedAt = now;
    } else if (updates.status && updates.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED) {
      updateData.completedAt = undefined;
    }

    // Merge settings and metadata
    if (updates.settings) {
      updateData.settings = { ...project.settings, ...updates.settings };
    }
    if (updates.extendedMetadata) {
      updateData.extendedMetadata = {
        ...project.extendedMetadata,
        ...updates.extendedMetadata,
      };
    }

    // 6. UPDATE: Apply changes
    await ctx.db.patch(projectId, updateData);

    // 7. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'project.updated',
      entityType: 'system_project',
      entityId: project.publicId,
      entityTitle: updateData.title || project.title,
      description: `Updated project: ${updateData.title || project.title}`,
      metadata: {
        source: 'project.update',
        operation: 'update',
        changes: updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 8. RETURN: Return entity ID
    return projectId;
  },
});

/**
 * Delete project (soft delete)
 */
export const deleteProject = mutation({
  args: {
    projectId: v.id('projects'),
    hardDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, { projectId, hardDelete = false }): Promise<ProjectId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const project = await ctx.db.get(projectId);
    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    // 3. AUTHZ: Check delete permission
    await requireDeleteProjectAccess(project, user);

    const now = Date.now();

    if (hardDelete && (user.role === 'admin' || user.role === 'superadmin')) {
      // Hard delete: Remove project and all related data
      const members = await ctx.db
        .query('projectMembers')
        .withIndex('by_project', (q) => q.eq('projectId', projectId))
        .collect();

      for (const member of members) {
        await ctx.db.delete(member._id);
      }

      await ctx.db.delete(projectId);
    } else {
      // 4. SOFT DELETE: Mark as deleted
      await ctx.db.patch(projectId, {
        deletedAt: now,
        deletedBy: user._id,
        updatedAt: now,
      });
    }

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: hardDelete ? 'project.hard_deleted' : 'project.deleted',
      entityType: 'system_project',
      entityId: project.publicId,
      entityTitle: project.title,
      description: `${hardDelete ? 'Permanently deleted' : 'Deleted'} project: ${project.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return projectId;
  },
});

/**
 * Restore soft-deleted project
 */
export const restoreProject = mutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }): Promise<ProjectId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists and is deleted
    const project = await ctx.db.get(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    if (!project.deletedAt) {
      throw new Error('Project is not deleted');
    }

    // 3. AUTHZ: Check edit permission (owners and admins can restore)
    if (
      project.ownerId !== user._id &&
      user.role !== 'admin' &&
      user.role !== 'superadmin'
    ) {
      throw new Error('You do not have permission to restore this project');
    }

    // 4. RESTORE: Clear soft delete fields
    const now = Date.now();
    await ctx.db.patch(projectId, {
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: now,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'project.restored',
      entityType: 'system_project',
      entityId: project.publicId,
      entityTitle: project.title,
      description: `Restored project: ${project.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return projectId;
  },
});

/**
 * Archive project (status-based soft delete alternative)
 */
export const archiveProject = mutation({
  args: {
    projectId: v.id('projects'),
  },
  handler: async (ctx, { projectId }): Promise<ProjectId> => {
    // 1. AUTH: Get authenticated user
    const user = await requireCurrentUser(ctx);

    // 2. CHECK: Verify entity exists
    const project = await ctx.db.get(projectId);
    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    // 3. AUTHZ: Check edit permission
    await requireEditProjectAccess(ctx, project, user);

    // 4. ARCHIVE: Update status
    const now = Date.now();
    await ctx.db.patch(projectId, {
      status: PROJECTS_CONSTANTS.STATUS.ARCHIVED,
      updatedAt: now,
      lastActivityAt: now,
    });

    // 5. AUDIT: Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'project.archived',
      entityType: 'system_project',
      entityId: project.publicId,
      entityTitle: project.title,
      description: `Archived project: ${project.title}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 6. RETURN: Return entity ID
    return projectId;
  },
});

/**
 * Update project progress
 */
export const updateProjectProgress = mutation({
  args: {
    projectId: v.id('projects'),
    progress: v.object({
      completedTasks: v.number(),
      totalTasks: v.number(),
    }),
  },
  handler: async (ctx, { projectId, progress }) => {
    const user = await requireCurrentUser(ctx);

    const project = await ctx.db.get(projectId);

    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    await requireEditProjectAccess(ctx, project, user);

    const { completedTasks, totalTasks } = progress;
    const percentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const now = Date.now();

    await ctx.db.patch(projectId, {
      progress: {
        completedTasks,
        totalTasks,
        percentage,
      },
      updatedAt: now,
      lastActivityAt: now,
    });

    return { completedTasks, totalTasks, percentage };
  },
});

/**
 * Bulk update multiple projects
 */
export const bulkUpdateProjects = mutation({
  args: {
    projectIds: v.array(v.id('projects')),
    updates: v.object({
      status: v.optional(projectsValidators.status),
      priority: v.optional(projectsValidators.priority),
      visibility: v.optional(projectsValidators.visibility),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { projectIds, updates }) => {
    // 1. AUTH: Get authenticated user
    const user = await requirePermission(ctx, PROJECTS_CONSTANTS.PERMISSIONS.BULK_EDIT, {
      allowAdmin: true,
    });

    // 2. VALIDATE: Check update data
    const errors = validateProjectData(updates);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    const now = Date.now();
    const results = [];
    const failed = [];

    // 3. PROCESS: Update each entity
    for (const projectId of projectIds) {
      try {
        const project = await ctx.db.get(projectId);
        if (!project || project.deletedAt) {
          failed.push({ id: projectId, reason: 'Not found' });
          continue;
        }

        // Check individual edit access
        const canEdit = await canEditProject(ctx, project, user);
        if (!canEdit) {
          failed.push({ id: projectId, reason: 'No permission' });
          continue;
        }

        // Apply updates
        const updateData: any = {
          updatedAt: now,
          lastActivityAt: now,
        };

        if (updates.status !== undefined) updateData.status = updates.status;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.visibility !== undefined) updateData.visibility = updates.visibility;
        if (updates.tags !== undefined) {
          updateData.tags = updates.tags.map((tag) => tag.trim());
        }

        await ctx.db.patch(projectId, updateData);
        results.push({ id: projectId, success: true });
      } catch (error: any) {
        failed.push({ id: projectId, reason: error.message });
      }
    }

    // 4. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'project.bulk_updated',
      entityType: 'system_project',
      entityId: 'bulk',
      entityTitle: `${results.length} projects`,
      description: `Bulk updated ${results.length} projects`,
      metadata: {
        successful: results.length,
        failed: failed.length,
        updates,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 5. RETURN: Return results summary
    return {
      updated: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});

/**
 * Bulk delete multiple projects (soft delete)
 */
export const bulkDeleteProjects = mutation({
  args: {
    projectIds: v.array(v.id('projects')),
  },
  handler: async (ctx, { projectIds }) => {
    // 1. AUTH: Get authenticated user
    const user = await requirePermission(ctx, PROJECTS_CONSTANTS.PERMISSIONS.DELETE, {
      allowAdmin: true,
    });

    const now = Date.now();
    const results = [];
    const failed = [];

    // 2. PROCESS: Delete each entity
    for (const projectId of projectIds) {
      try {
        const project = await ctx.db.get(projectId);
        if (!project || project.deletedAt) {
          failed.push({ id: projectId, reason: 'Not found' });
          continue;
        }

        // Check individual delete access
        const canDelete = await canDeleteProject(project, user);
        if (!canDelete) {
          failed.push({ id: projectId, reason: 'No permission' });
          continue;
        }

        // Soft delete
        await ctx.db.patch(projectId, {
          deletedAt: now,
          deletedBy: user._id,
          updatedAt: now,
        });

        results.push({ id: projectId, success: true });
      } catch (error: any) {
        failed.push({ id: projectId, reason: error.message });
      }
    }

    // 3. AUDIT: Create single audit log for bulk operation
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'project.bulk_deleted',
      entityType: 'system_project',
      entityId: 'bulk',
      entityTitle: `${results.length} projects`,
      description: `Bulk deleted ${results.length} projects`,
      metadata: {
        successful: results.length,
        failed: failed.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // 4. RETURN: Return results summary
    return {
      deleted: results.length,
      failed: failed.length,
      failures: failed,
    };
  },
});
