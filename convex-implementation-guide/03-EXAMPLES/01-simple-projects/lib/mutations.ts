// convex/lib/software/freelancer_dashboard/projects/mutations.ts
// Write operations for projects module

import { mutation } from '@/generated/server';
import { v } from 'convex/values';
import { requireCurrentUser } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { projectsValidators } from '@/schema/software/freelancer_dashboard/projects/validators';
import { PROJECTS_CONSTANTS } from './constants';
import { trimProjectData, validateProjectData } from './utils';
import {
  requireEditProjectAccess,
  requireDeleteProjectAccess,
} from './permissions';

/**
 * Create a new project
 * 🔒 Authentication: Required
 * 🔒 Authorization: CREATE permission
 */
export const createProject = mutation({
  args: {
    data: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      status: v.optional(projectsValidators.status),
      priority: v.optional(projectsValidators.priority),
      visibility: v.optional(projectsValidators.visibility),
      clientId: v.optional(v.id('clients')),
      budget: v.optional(v.object({
        amount: v.number(),
        currency: projectsValidators.currency,
      })),
      startDate: v.optional(v.number()),
      deadline: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { data }) => {
    const user = await requireCurrentUser(ctx);

    // Trim and validate
    const trimmed = trimProjectData(data);
    const errors = validateProjectData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();
    const publicId = await generateUniquePublicId(ctx, 'freelancerProjects');

    // Create project
    const projectId = await ctx.db.insert('freelancerProjects', {
      ...trimmed,
      publicId,
      ownerId: user._id,
      status: trimmed.status ?? 'planning',
      visibility: trimmed.visibility ?? 'private',
      settings: {
        allowComments: true,
        emailNotifications: true,
        autoArchive: false,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
    });

    // Add creator as owner member
    await ctx.db.insert('freelancerProjectMembers', {
      projectId,
      userId: user._id,
      role: 'owner',
      status: 'active',
      invitedBy: user._id,
      invitedAt: now,
      joinedAt: now,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: 'project.created',
      entityType: 'freelancerProjects',
      entityId: publicId,
      entityTitle: trimmed.{displayField},
      description: `Created project: ${trimmed.{displayField}}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return projectId;
  },
});

/**
 * Update an existing project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or project admin
 */
export const updateProject = mutation({
  args: {
    id: v.id('freelancerProjects'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(projectsValidators.status),
      priority: v.optional(projectsValidators.priority),
      visibility: v.optional(projectsValidators.visibility),
      budget: v.optional(v.object({
        amount: v.number(),
        currency: projectsValidators.currency,
      })),
      startDate: v.optional(v.number()),
      deadline: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, { id, updates }) => {
    const user = await requireCurrentUser(ctx);

    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Project not found');
    }

    await requireEditProjectAccess(ctx, existing, user);

    // Trim and validate
    const trimmed = trimProjectData(updates);
    const errors = validateProjectData(trimmed);
    if (errors.length) {
      throw new Error(errors.join(', '));
    }

    const now = Date.now();

    // Handle completion
    const updateData: Partial<typeof existing> & {
      updatedAt: number;
      updatedBy: typeof user._id;
    } = {
      ...trimmed,
      updatedAt: now,
      updatedBy: user._id,
    };

    if (trimmed.status === 'completed' && existing.status !== 'completed') {
      updateData.completedAt = now;
    } else if (trimmed.status && trimmed.status !== 'completed') {
      updateData.completedAt = undefined;
    }

    await ctx.db.patch(id, updateData);

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: 'project.updated',
      entityType: 'freelancerProjects',
      entityId: existing.publicId,
      entityTitle: trimmed.{displayField} ?? existing.{displayField},
      description: `Updated project: ${trimmed.{displayField} ?? existing.{displayField}}`,
      metadata: { changes: trimmed },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Delete a project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner only
 */
export const deleteProject = mutation({
  args: { id: v.id('freelancerProjects') },
  handler: async (ctx, { id }) => {
    const user = await requireCurrentUser(ctx);

    const existing = await ctx.db.get(id);
    if (!existing || existing.deletedAt) {
      throw new Error('Project not found');
    }

    await requireDeleteProjectAccess(existing, user);

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: 'project.deleted',
      entityType: 'freelancerProjects',
      entityId: existing.publicId,
      entityTitle: existing.{displayField},
      description: `Deleted project: ${existing.{displayField}}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return id;
  },
});

/**
 * Add member to project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or project admin
 */
export const addProjectMember = mutation({
  args: {
    projectId: v.id('freelancerProjects'),
    userId: v.id('userProfiles'),
    role: projectsValidators.memberRole,
  },
  handler: async (ctx, { projectId, userId, role }) => {
    const user = await requireCurrentUser(ctx);

    const project = await ctx.db.get(projectId);
    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    await requireEditProjectAccess(ctx, project, user);

    // Check if already a member
    const existing = await ctx.db
      .query('freelancerProjectMembers')
      .withIndex('by_project_and_user', q =>
        q.eq('projectId', projectId).eq('userId', userId)
      )
      .filter(q => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (existing) {
      throw new Error('User is already a member');
    }

    const now = Date.now();

    // Add member
    const memberId = await ctx.db.insert('freelancerProjectMembers', {
      projectId,
      userId,
      role,
      status: 'invited',
      invitedBy: user._id,
      invitedAt: now,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: 'project.member_added',
      entityType: 'freelancerProjects',
      entityId: project.publicId,
      entityTitle: project.{displayField},
      description: `Added member to project: ${project.{displayField}}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return memberId;
  },
});

/**
 * Remove member from project
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or project admin
 */
export const removeProjectMember = mutation({
  args: { memberId: v.id('freelancerProjectMembers') },
  handler: async (ctx, { memberId }) => {
    const user = await requireCurrentUser(ctx);

    const member = await ctx.db.get(memberId);
    if (!member || member.deletedAt) {
      throw new Error('Member not found');
    }

    const project = await ctx.db.get(member.projectId);
    if (!project || project.deletedAt) {
      throw new Error('Project not found');
    }

    await requireEditProjectAccess(ctx, project, user);

    // Cannot remove owner
    if (member.role === 'owner') {
      throw new Error('Cannot remove project owner');
    }

    const now = Date.now();

    // Soft delete
    await ctx.db.patch(memberId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // Audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: user.{displayField} || user.email || 'Unknown',
      action: 'project.member_removed',
      entityType: 'freelancerProjects',
      entityId: project.publicId,
      entityTitle: project.{displayField},
      description: `Removed member from project: ${project.{displayField}}`,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
    });

    return memberId;
  },
});
